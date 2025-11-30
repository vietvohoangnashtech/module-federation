/**
 * Dynamic Remote Loader - Runtime Utility for Hosts
 * 
 * Provides runtime APIs for hosts to dynamically discover and load Module Federation remotes
 * from a registry service. Supports caching, prefetching, error handling, and fallbacks.
 * 
 * Usage in Host Application:
 * ```typescript
 * import { createDynamicLoader } from '@mfe-cli/dynamic-loader';
 * 
 * const loader = createDynamicLoader({
 *   registryUrl: 'http://localhost:3999'
 * });
 * 
 * // Discover available remotes
 * const remotes = await loader.getAvailableRemotes();
 * 
 * // Load a remote dynamically
 * const Dashboard = await loader.loadRemote('dashboard', './Dashboard');
 * ```
 */

export interface LoaderConfig {
  registryUrl: string;
  environment?: 'development' | 'staging' | 'production';
  enableCache?: boolean;
  cacheTimeout?: number; // ms
  retryAttempts?: number;
  retryDelay?: number; // ms
  healthCheckBeforeLoad?: boolean;
  onError?: (error: Error, remoteName: string) => void;
  onLoaded?: (remoteName: string, module: string) => void;
}

export interface RemoteInfo {
  name: string;
  url: string;
  version: string;
  manifest?: string;
  exposes: Record<string, string>;
  health?: {
    status: 'healthy' | 'unhealthy' | 'unknown';
  };
  deployment?: {
    environment: 'development' | 'staging' | 'production';
    canary?: boolean;
  };
}

interface CachedRemote {
  info: RemoteInfo;
  container: any;
  timestamp: number;
}

interface LoadedModule {
  factory: any;
  timestamp: number;
}

/**
 * Dynamic Loader Class
 */
export class DynamicLoader {
  private config: Required<LoaderConfig>;
  private remoteCache: Map<string, CachedRemote> = new Map();
  private moduleCache: Map<string, LoadedModule> = new Map();
  private registryCache: { remotes: RemoteInfo[]; timestamp: number } | null = null;

  constructor(config: LoaderConfig) {
    this.config = {
      registryUrl: config.registryUrl,
      environment: config.environment ?? 'development',
      enableCache: config.enableCache ?? true,
      cacheTimeout: config.cacheTimeout ?? 300000, // 5 minutes
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      healthCheckBeforeLoad: config.healthCheckBeforeLoad ?? true,
      onError: config.onError ?? ((error, name) => console.error(`[DynamicLoader] Error loading ${name}:`, error)),
      onLoaded: config.onLoaded ?? (() => {})
    };
  }

  /**
   * Get all available remotes from registry
   */
  async getAvailableRemotes(forceRefresh = false): Promise<RemoteInfo[]> {
    // Check cache
    if (!forceRefresh && this.config.enableCache && this.registryCache) {
      const age = Date.now() - this.registryCache.timestamp;
      if (age < this.config.cacheTimeout) {
        return this.registryCache.remotes;
      }
    }

    try {
      const url = `${this.config.registryUrl}/remotes?env=${this.config.environment}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Registry responded with ${response.status}`);
      }

      const data = await response.json();
      const remotes: RemoteInfo[] = data.remotes || [];

      // Update cache
      if (this.config.enableCache) {
        this.registryCache = {
          remotes,
          timestamp: Date.now()
        };
      }

      return remotes;
    } catch (error) {
      this.config.onError(
        error instanceof Error ? error : new Error(String(error)),
        'registry'
      );
      return [];
    }
  }

  /**
   * Get specific remote info from registry
   */
  async getRemoteInfo(name: string, version?: string): Promise<RemoteInfo | null> {
    try {
      const endpoint = version ? `${name}@${version}` : name;
      const url = `${this.config.registryUrl}/remotes/${endpoint}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.remote;
    } catch (error) {
      this.config.onError(
        error instanceof Error ? error : new Error(String(error)),
        name
      );
      return null;
    }
  }

  /**
   * Load a remote module dynamically
   * 
   * @param remoteName - Name of the remote (e.g., 'dashboard')
   * @param modulePath - Path to module within remote (e.g., './Dashboard')
   * @param version - Optional specific version
   * @returns Loaded module factory
   */
  async loadRemote<T = any>(
    remoteName: string,
    modulePath: string,
    version?: string
  ): Promise<T> {
    const cacheKey = `${remoteName}@${version || 'latest'}::${modulePath}`;

    // Check module cache
    if (this.config.enableCache && this.moduleCache.has(cacheKey)) {
      const cached = this.moduleCache.get(cacheKey)!;
      const age = Date.now() - cached.timestamp;
      
      if (age < this.config.cacheTimeout) {
        return cached.factory as T;
      }
    }

    // Get remote info
    const remoteInfo = await this.getRemoteInfo(remoteName, version);
    if (!remoteInfo) {
      throw new Error(`Remote '${remoteName}' not found in registry`);
    }

    // Health check
    if (this.config.healthCheckBeforeLoad && remoteInfo.health?.status === 'unhealthy') {
      console.warn(`[DynamicLoader] Warning: Remote '${remoteName}' is unhealthy, attempting load anyway...`);
    }

    // Check if module is exposed
    if (!remoteInfo.exposes[modulePath]) {
      throw new Error(`Module '${modulePath}' not exposed by '${remoteName}'`);
    }

    try {
      // Load with retry logic
      const module = await this.loadWithRetry(remoteInfo, modulePath);
      
      // Cache the loaded module
      if (this.config.enableCache) {
        this.moduleCache.set(cacheKey, {
          factory: module,
          timestamp: Date.now()
        });
      }

      this.config.onLoaded(remoteName, modulePath);
      return module as T;
    } catch (error) {
      this.config.onError(
        error instanceof Error ? error : new Error(String(error)),
        remoteName
      );
      throw error;
    }
  }

  /**
   * Load remote with retry logic
   */
  private async loadWithRetry(remoteInfo: RemoteInfo, modulePath: string): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          await this.delay(this.config.retryDelay * attempt);
          console.log(`[DynamicLoader] Retry ${attempt}/${this.config.retryAttempts} for ${remoteInfo.name}`);
        }

        return await this.loadRemoteContainer(remoteInfo, modulePath);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError || new Error('Failed to load remote after retries');
  }

  /**
   * Load the actual remote container and module
   */
  private async loadRemoteContainer(remoteInfo: RemoteInfo, modulePath: string): Promise<any> {
    // Check if we have the container cached
    if (this.config.enableCache && this.remoteCache.has(remoteInfo.name)) {
      const cached = this.remoteCache.get(remoteInfo.name)!;
      const age = Date.now() - cached.timestamp;
      
      if (age < this.config.cacheTimeout) {
        return this.getModuleFromContainer(cached.container, modulePath);
      }
    }

    // Load the remote entry script
    const containerName = remoteInfo.name;
    const remoteUrl = remoteInfo.url;
    
    // @ts-ignore - __webpack_init_sharing__ and __webpack_share_scopes__ are Webpack runtime APIs
    if (typeof __webpack_init_sharing__ === 'undefined') {
      // Not in a Webpack environment, try direct script loading
      return await this.loadViaScript(remoteInfo, modulePath);
    }

    // Webpack Module Federation runtime
    // @ts-ignore
    await __webpack_init_sharing__('default');
    
    // Load the container
    const container = await this.loadContainer(containerName, remoteUrl);
    
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);

    // Cache container
    if (this.config.enableCache) {
      this.remoteCache.set(remoteInfo.name, {
        info: remoteInfo,
        container,
        timestamp: Date.now()
      });
    }

    return this.getModuleFromContainer(container, modulePath);
  }

  /**
   * Load container via dynamic script injection
   */
  private async loadContainer(containerName: string, remoteUrl: string): Promise<any> {
    // Check if already loaded in window
    // @ts-ignore
    if (typeof window !== 'undefined' && window[containerName]) {
      // @ts-ignore
      return window[containerName];
    }

    // Load via script tag
    return new Promise((resolve, reject) => {
      const scriptId = `mfe-${containerName}`;
      
      // Check if script already exists
      if (typeof document !== 'undefined' && document.getElementById(scriptId)) {
        // @ts-ignore
        resolve(window[containerName]);
        return;
      }

      if (typeof document === 'undefined') {
        reject(new Error('Document not available (SSR not supported yet)'));
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `${remoteUrl}/remoteEntry.js`;
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        // @ts-ignore
        const container = window[containerName];
        if (container) {
          resolve(container);
        } else {
          reject(new Error(`Container '${containerName}' not found after script load`));
        }
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script for '${containerName}'`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load via direct script injection (for non-Webpack environments)
   */
  private async loadViaScript(remoteInfo: RemoteInfo, modulePath: string): Promise<any> {
    const container = await this.loadContainer(remoteInfo.name, remoteInfo.url);
    
    // Try to get the module
    if (container && container.get) {
      const factory = await container.get(modulePath);
      return factory();
    }

    throw new Error(`Unable to load module '${modulePath}' from '${remoteInfo.name}'`);
  }

  /**
   * Get module from loaded container
   */
  private async getModuleFromContainer(container: any, modulePath: string): Promise<any> {
    if (!container || !container.get) {
      throw new Error('Invalid container');
    }

    const factory = await container.get(modulePath);
    return factory();
  }

  /**
   * Prefetch a remote (load container but not module)
   */
  async prefetchRemote(remoteName: string, version?: string): Promise<void> {
    const remoteInfo = await this.getRemoteInfo(remoteName, version);
    if (!remoteInfo) {
      throw new Error(`Remote '${remoteName}' not found`);
    }

    try {
      const container = await this.loadContainer(remoteInfo.name, remoteInfo.url);
      
      if (this.config.enableCache) {
        this.remoteCache.set(remoteInfo.name, {
          info: remoteInfo,
          container,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      this.config.onError(
        error instanceof Error ? error : new Error(String(error)),
        remoteName
      );
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.remoteCache.clear();
    this.moduleCache.clear();
    this.registryCache = null;
  }

  /**
   * Clear cache for specific remote
   */
  clearRemoteCache(remoteName: string): void {
    this.remoteCache.delete(remoteName);
    
    // Clear module cache for this remote
    const keysToDelete: string[] = [];
    this.moduleCache.forEach((_, key) => {
      if (key.startsWith(`${remoteName}@`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.moduleCache.delete(key));
  }

  /**
   * Utility: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function for React/framework hooks
 */
export function createDynamicLoader(config: LoaderConfig): DynamicLoader {
  return new DynamicLoader(config);
}

/**
 * React Hook for dynamic loading (example)
 */
export function useDynamicRemote<T = any>(
  loader: DynamicLoader,
  remoteName: string,
  modulePath: string,
  version?: string
): { module: T | null; loading: boolean; error: Error | null } {
  // This would typically use React.useState and useEffect
  // Placeholder implementation for TypeScript
  
  const state = {
    module: null as T | null,
    loading: true,
    error: null as Error | null
  };

  // In real implementation:
  // useEffect(() => {
  //   loader.loadRemote<T>(remoteName, modulePath, version)
  //     .then(mod => setState({ module: mod, loading: false, error: null }))
  //     .catch(err => setState({ module: null, loading: false, error: err }));
  // }, [remoteName, modulePath, version]);

  return state;
}

/**
 * Preload strategy helper
 */
export async function preloadRemotes(
  loader: DynamicLoader,
  remoteNames: string[]
): Promise<void> {
  console.log(`[DynamicLoader] Preloading ${remoteNames.length} remotes...`);
  
  const promises = remoteNames.map(name => 
    loader.prefetchRemote(name).catch(err => {
      console.warn(`[DynamicLoader] Failed to prefetch ${name}:`, err);
    })
  );

  await Promise.all(promises);
  console.log(`[DynamicLoader] Preload complete`);
}

/**
 * Type-safe remote loader with TypeScript
 */
export interface TypedRemoteModule<T> {
  name: string;
  module: string;
  load: (loader: DynamicLoader) => Promise<T>;
}

export function defineRemote<T>(
  name: string,
  module: string
): TypedRemoteModule<T> {
  return {
    name,
    module,
    load: async (loader: DynamicLoader) => {
      return loader.loadRemote<T>(name, module);
    }
  };
}

// Example typed remotes:
// export const DashboardRemote = defineRemote<{ default: React.ComponentType }>('dashboard', './Dashboard');
// const DashboardComponent = await DashboardRemote.load(loader);
