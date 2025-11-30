/**
 * Dynamic Remote Discovery - Registry Service
 * 
 * A lightweight HTTP service that maintains a registry of available Module Federation remotes.
 * Remotes register themselves on startup and the registry provides discovery APIs for hosts.
 * 
 * Features:
 * - Remote registration with metadata
 * - Health check monitoring
 * - Version management
 * - SemVer-based resolution
 * - Canary deployment support
 * - Registry persistence
 */

import http from 'node:http';
import fs from 'fs-extra';
import path from 'node:path';
import chalk from 'chalk';

export interface RemoteMetadata {
  name: string;
  url: string;
  version: string;
  manifest?: string;
  exposes: Record<string, string>;
  shared?: Record<string, any>;
  framework?: string;
  buildTool?: string;
  health?: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    uptime?: number;
  };
  metadata?: {
    description?: string;
    team?: string;
    owner?: string;
    tags?: string[];
  };
  deployment?: {
    environment: 'development' | 'staging' | 'production';
    canary?: boolean;
    weight?: number; // For A/B testing (0-100)
  };
  registeredAt: Date;
  lastUpdated: Date;
}

export interface RegistryData {
  remotes: Map<string, RemoteMetadata[]>; // name -> versions[]
  version: string;
  lastUpdated: Date;
}

export interface RegistryConfig {
  port: number;
  host: string;
  persistPath?: string;
  healthCheckInterval?: number; // ms
  healthCheckTimeout?: number; // ms
  maxVersionsPerRemote?: number;
  enableCORS?: boolean;
}

export class RegistryService {
  private registry: RegistryData;
  private config: Required<RegistryConfig>;
  private server: http.Server | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<RegistryConfig> = {}) {
    this.config = {
      port: config.port ?? 3999,
      host: config.host ?? 'localhost',
      persistPath: config.persistPath ?? '.mfe-registry-service.json',
      healthCheckInterval: config.healthCheckInterval ?? 30000, // 30s
      healthCheckTimeout: config.healthCheckTimeout ?? 5000, // 5s
      maxVersionsPerRemote: config.maxVersionsPerRemote ?? 10,
      enableCORS: config.enableCORS ?? true
    };

    this.registry = {
      remotes: new Map(),
      version: '1.0.0',
      lastUpdated: new Date()
    };
  }

  /**
   * Start the registry service
   */
  async start(): Promise<void> {
    // Load persisted registry
    await this.load();

    // Create HTTP server
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    // Start listening
    return new Promise((resolve, reject) => {
      this.server!.listen(this.config.port, this.config.host, () => {
        console.log(chalk.green(`\n✅ Registry service started`));
        console.log(chalk.cyan(`   URL: http://${this.config.host}:${this.config.port}`));
        console.log(chalk.gray(`   Persist: ${this.config.persistPath}`));
        console.log(chalk.gray(`   Health checks: ${this.config.healthCheckInterval}ms\n`));
        
        // Start health check monitoring
        this.startHealthChecks();
        
        resolve();
      });

      this.server!.on('error', reject);
    });
  }

  /**
   * Stop the registry service
   */
  async stop(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    if (this.server) {
      await this.save();
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log(chalk.yellow('\n⏹️  Registry service stopped\n'));
          resolve();
        });
      });
    }
  }

  /**
   * Handle incoming HTTP requests
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // CORS headers
    if (this.config.enableCORS) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const method = req.method?.toUpperCase();

    console.log(chalk.gray(`${method} ${url.pathname}`));

    try {
      // Route handlers
      if (method === 'POST' && url.pathname === '/register') {
        this.handleRegister(req, res);
      } else if (method === 'GET' && url.pathname === '/remotes') {
        this.handleListRemotes(req, res);
      } else if (method === 'GET' && url.pathname.startsWith('/remotes/')) {
        this.handleGetRemote(req, res, url);
      } else if (method === 'DELETE' && url.pathname.startsWith('/remotes/')) {
        this.handleDeleteRemote(req, res, url);
      } else if (method === 'GET' && url.pathname === '/health') {
        this.handleHealthCheck(req, res);
      } else if (method === 'GET' && url.pathname === '/') {
        this.handleRoot(req, res);
      } else {
        this.sendJSON(res, 404, { error: 'Not found' });
      }
    } catch (error) {
      console.error(chalk.red('Request error:'), error);
      this.sendJSON(res, 500, { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * POST /register - Register or update a remote
   */
  private async handleRegister(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const body = await this.readBody(req);
    
    try {
      const remote: Partial<RemoteMetadata> = JSON.parse(body);
      
      // Validate required fields
      if (!remote.name || !remote.url || !remote.version) {
        this.sendJSON(res, 400, { 
          error: 'Missing required fields: name, url, version' 
        });
        return;
      }

      // Validate version format (semver)
      if (!/^\d+\.\d+\.\d+/.test(remote.version)) {
        this.sendJSON(res, 400, { 
          error: 'Invalid version format. Use semver: x.y.z' 
        });
        return;
      }

      // Create full metadata
      const metadata: RemoteMetadata = {
        name: remote.name,
        url: remote.url,
        version: remote.version,
        manifest: remote.manifest || `${remote.url}/mf-manifest.json`,
        exposes: remote.exposes || {},
        shared: remote.shared,
        framework: remote.framework,
        buildTool: remote.buildTool,
        health: {
          status: 'unknown',
          lastCheck: new Date()
        },
        metadata: remote.metadata,
        deployment: remote.deployment || {
          environment: 'development',
          canary: false
        },
        registeredAt: new Date(),
        lastUpdated: new Date()
      };

      // Add to registry
      if (!this.registry.remotes.has(remote.name)) {
        this.registry.remotes.set(remote.name, []);
      }

      const versions = this.registry.remotes.get(remote.name)!;
      
      // Check if version already exists
      const existingIndex = versions.findIndex(v => v.version === metadata.version);
      if (existingIndex >= 0) {
        // Update existing
        versions[existingIndex] = metadata;
        console.log(chalk.cyan(`  📝 Updated: ${metadata.name}@${metadata.version}`));
      } else {
        // Add new version
        versions.push(metadata);
        
        // Limit versions per remote
        if (versions.length > this.config.maxVersionsPerRemote) {
          const removed = versions.shift();
          console.log(chalk.gray(`  🗑️  Removed old: ${removed?.name}@${removed?.version}`));
        }
        
        console.log(chalk.green(`  ✅ Registered: ${metadata.name}@${metadata.version}`));
      }

      // Sort by version (newest first)
      versions.sort((a, b) => this.compareVersions(b.version, a.version));

      this.registry.lastUpdated = new Date();
      await this.save();

      // Perform immediate health check
      this.checkRemoteHealth(metadata).catch(err => {
        console.error(chalk.red(`Health check failed for ${metadata.name}:`, err.message));
      });

      this.sendJSON(res, 200, { 
        success: true, 
        remote: metadata 
      });

    } catch (error) {
      this.sendJSON(res, 400, { 
        error: 'Invalid JSON body',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * GET /remotes - List all remotes (latest versions by default)
   */
  private handleListRemotes(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const allVersions = url.searchParams.get('all') === 'true';
    const environment = url.searchParams.get('env') as 'development' | 'staging' | 'production' | null;
    const healthyOnly = url.searchParams.get('healthy') === 'true';

    const remotes: RemoteMetadata[] = [];

    this.registry.remotes.forEach((versions, name) => {
      let filtered = versions;

      // Filter by environment
      if (environment) {
        filtered = filtered.filter(r => r.deployment?.environment === environment);
      }

      // Filter by health
      if (healthyOnly) {
        filtered = filtered.filter(r => r.health?.status === 'healthy');
      }

      if (allVersions) {
        remotes.push(...filtered);
      } else if (filtered.length > 0) {
        // Return latest version only
        remotes.push(filtered[0]);
      }
    });

    this.sendJSON(res, 200, {
      remotes,
      count: remotes.length,
      totalVersions: Array.from(this.registry.remotes.values()).reduce((sum, v) => sum + v.length, 0)
    });
  }

  /**
   * GET /remotes/:name - Get specific remote with version resolution
   */
  private handleGetRemote(req: http.IncomingMessage, res: http.ServerResponse, url: URL): void {
    const pathParts = url.pathname.split('/');
    const nameOrNameVersion = pathParts[2];
    
    if (!nameOrNameVersion) {
      this.sendJSON(res, 400, { error: 'Missing remote name' });
      return;
    }

    // Parse name@version or just name
    const [name, requestedVersion] = nameOrNameVersion.split('@');
    const versions = this.registry.remotes.get(name);

    if (!versions || versions.length === 0) {
      this.sendJSON(res, 404, { error: `Remote '${name}' not found` });
      return;
    }

    // Version resolution
    let remote: RemoteMetadata | undefined;

    if (requestedVersion) {
      // Find matching version (support semver ranges in future)
      remote = versions.find(v => v.version === requestedVersion);
      
      if (!remote) {
        this.sendJSON(res, 404, { 
          error: `Version '${requestedVersion}' not found for '${name}'`,
          availableVersions: versions.map(v => v.version)
        });
        return;
      }
    } else {
      // Return latest
      remote = versions[0];
    }

    // Check for canary deployment
    const canary = url.searchParams.get('canary') === 'true';
    if (canary) {
      const canaryVersion = versions.find(v => v.deployment?.canary);
      if (canaryVersion) {
        remote = canaryVersion;
      }
    }

    this.sendJSON(res, 200, { 
      remote,
      allVersions: versions.map(v => ({
        version: v.version,
        deployment: v.deployment,
        health: v.health
      }))
    });
  }

  /**
   * DELETE /remotes/:name - Delete a remote (or specific version)
   */
  private handleDeleteRemote(req: http.IncomingMessage, res: http.ServerResponse, url: URL): void {
    const pathParts = url.pathname.split('/');
    const nameOrNameVersion = pathParts[2];
    
    if (!nameOrNameVersion) {
      this.sendJSON(res, 400, { error: 'Missing remote name' });
      return;
    }

    const [name, version] = nameOrNameVersion.split('@');
    const versions = this.registry.remotes.get(name);

    if (!versions || versions.length === 0) {
      this.sendJSON(res, 404, { error: `Remote '${name}' not found` });
      return;
    }

    if (version) {
      // Delete specific version
      const index = versions.findIndex(v => v.version === version);
      if (index < 0) {
        this.sendJSON(res, 404, { error: `Version '${version}' not found` });
        return;
      }
      
      versions.splice(index, 1);
      
      if (versions.length === 0) {
        this.registry.remotes.delete(name);
      }
      
      console.log(chalk.yellow(`  🗑️  Deleted: ${name}@${version}`));
      this.sendJSON(res, 200, { success: true, message: `Deleted ${name}@${version}` });
    } else {
      // Delete all versions
      this.registry.remotes.delete(name);
      console.log(chalk.yellow(`  🗑️  Deleted: ${name} (all versions)`));
      this.sendJSON(res, 200, { success: true, message: `Deleted ${name}` });
    }

    this.registry.lastUpdated = new Date();
    this.save().catch(err => console.error('Save failed:', err));
  }

  /**
   * GET /health - Registry health check
   */
  private handleHealthCheck(req: http.IncomingMessage, res: http.ServerResponse): void {
    const totalRemotes = this.registry.remotes.size;
    const totalVersions = Array.from(this.registry.remotes.values()).reduce((sum, v) => sum + v.length, 0);
    
    let healthyCount = 0;
    let unhealthyCount = 0;
    
    this.registry.remotes.forEach(versions => {
      versions.forEach(remote => {
        if (remote.health?.status === 'healthy') healthyCount++;
        else if (remote.health?.status === 'unhealthy') unhealthyCount++;
      });
    });

    this.sendJSON(res, 200, {
      status: 'healthy',
      uptime: process.uptime(),
      registry: {
        totalRemotes,
        totalVersions,
        healthyRemotes: healthyCount,
        unhealthyRemotes: unhealthyCount
      },
      config: {
        port: this.config.port,
        healthCheckInterval: this.config.healthCheckInterval
      }
    });
  }

  /**
   * GET / - Root info
   */
  private handleRoot(req: http.IncomingMessage, res: http.ServerResponse): void {
    this.sendJSON(res, 200, {
      name: 'Module Federation Registry Service',
      version: this.registry.version,
      endpoints: {
        'POST /register': 'Register a remote',
        'GET /remotes': 'List all remotes',
        'GET /remotes/:name': 'Get specific remote',
        'DELETE /remotes/:name': 'Delete remote',
        'GET /health': 'Health check'
      },
      totalRemotes: this.registry.remotes.size
    });
  }

  /**
   * Health check monitoring
   */
  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks().catch(err => {
        console.error(chalk.red('Health check cycle failed:'), err);
      });
    }, this.config.healthCheckInterval);

    // Perform initial checks
    this.performHealthChecks().catch(err => {
      console.error(chalk.red('Initial health check failed:'), err);
    });
  }

  private async performHealthChecks(): Promise<void> {
    const remotes: RemoteMetadata[] = [];
    this.registry.remotes.forEach(versions => remotes.push(...versions));

    console.log(chalk.gray(`\n🔍 Running health checks for ${remotes.length} remotes...`));

    const checks = remotes.map(remote => this.checkRemoteHealth(remote));
    await Promise.allSettled(checks);

    const healthy = remotes.filter(r => r.health?.status === 'healthy').length;
    const unhealthy = remotes.filter(r => r.health?.status === 'unhealthy').length;

    console.log(chalk.green(`   ✅ Healthy: ${healthy}`));
    if (unhealthy > 0) {
      console.log(chalk.red(`   ❌ Unhealthy: ${unhealthy}`));
    }

    await this.save();
  }

  private async checkRemoteHealth(remote: RemoteMetadata): Promise<void> {
    const startTime = Date.now();
    
    try {
      const url = remote.manifest || `${remote.url}/mf-manifest.json`;
      
      // Simple HTTP GET with timeout
      const response = await this.fetchWithTimeout(url, this.config.healthCheckTimeout);
      
      if (response.ok) {
        remote.health = {
          status: 'healthy',
          lastCheck: new Date(),
          uptime: Date.now() - startTime
        };
      } else {
        remote.health = {
          status: 'unhealthy',
          lastCheck: new Date()
        };
      }
    } catch (error) {
      remote.health = {
        status: 'unhealthy',
        lastCheck: new Date()
      };
    }
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<{ ok: boolean }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve({ ok: false });
      }, timeout);

      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? require('https') : http;

      const req = client.get(url, (res: http.IncomingMessage) => {
        clearTimeout(timer);
        resolve({ ok: res.statusCode === 200 });
        res.resume(); // Consume response
      });

      req.on('error', () => {
        clearTimeout(timer);
        resolve({ ok: false });
      });

      req.end();
    });
  }

  /**
   * Persistence
   */
  private async save(): Promise<void> {
    const data = {
      version: this.registry.version,
      lastUpdated: this.registry.lastUpdated,
      remotes: Array.from(this.registry.remotes.entries()).map(([name, versions]) => ({
        name,
        versions
      }))
    };

    await fs.writeJson(this.config.persistPath, data, { spaces: 2 });
  }

  private async load(): Promise<void> {
    try {
      if (await fs.pathExists(this.config.persistPath)) {
        const data = await fs.readJson(this.config.persistPath);
        
        this.registry.version = data.version || '1.0.0';
        this.registry.lastUpdated = new Date(data.lastUpdated);
        this.registry.remotes = new Map(
          data.remotes.map((r: any) => [r.name, r.versions])
        );

        console.log(chalk.cyan(`  📂 Loaded registry: ${this.registry.remotes.size} remotes`));
      }
    } catch (error) {
      console.log(chalk.yellow('  ⚠️  Failed to load registry, starting fresh'));
    }
  }

  /**
   * Utilities
   */
  private sendJSON(res: http.ServerResponse, status: number, data: any): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  private async readBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (aParts[i] > bParts[i]) return 1;
      if (aParts[i] < bParts[i]) return -1;
    }
    
    return 0;
  }

  /**
   * Get registry data (for CLI display)
   */
  getRegistry(): RegistryData {
    return this.registry;
  }
}

/**
 * Standalone CLI entry point
 */
export async function startRegistryService(config?: Partial<RegistryConfig>): Promise<RegistryService> {
  const service = new RegistryService(config);
  await service.start();
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await service.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await service.stop();
    process.exit(0);
  });

  return service;
}
