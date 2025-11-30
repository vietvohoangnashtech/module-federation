import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { glob } from 'glob';

/**
 * Represents a dependency usage in a package
 */
export interface DependencyUsage {
  package: string;
  version: string;
  isDev: boolean;
  size?: number;
}

/**
 * Analysis result for a single dependency
 */
export interface DependencyAnalysis {
  name: string;
  usageCount: number;
  usages: DependencyUsage[];
  versions: Map<string, number>;
  totalSize: number;
  recommendation: 'share' | 'keep-private' | 'review';
  potentialSavings: number;
  conflicts: boolean;
}

/**
 * Complete optimization report
 */
export interface OptimizationReport {
  totalPackages: number;
  analyzedDependencies: number;
  recommendations: {
    toShare: DependencyAnalysis[];
    keepPrivate: DependencyAnalysis[];
    needsReview: DependencyAnalysis[];
  };
  totalPotentialSavings: number;
  versionConflicts: DependencyAnalysis[];
}

/**
 * Find all packages in the workspace
 */
export async function findAllPackages(workspaceRoot: string): Promise<string[]> {
  const workspaceYaml = path.join(workspaceRoot, 'pnpm-workspace.yaml');
  
  if (!await fs.pathExists(workspaceYaml)) {
    throw new Error('pnpm-workspace.yaml not found. Are you in a workspace root?');
  }
  
  // Read workspace patterns
  const yamlContent = await fs.readFile(workspaceYaml, 'utf8');
  const patterns = yamlContent
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim());
  
  // Find all package directories
  const packageDirs: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: workspaceRoot,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**']
    });
    packageDirs.push(...matches);
  }
  
  return packageDirs;
}

/**
 * Extract dependencies from a package.json
 */
export async function extractDependencies(
  packageDir: string
): Promise<Map<string, DependencyUsage>> {
  const pkgJsonPath = path.join(packageDir, 'package.json');
  
  if (!await fs.pathExists(pkgJsonPath)) {
    return new Map();
  }
  
  const pkgJson = await fs.readJson(pkgJsonPath);
  const packageName = pkgJson.name || path.basename(packageDir);
  const dependencies = new Map<string, DependencyUsage>();
  
  // Extract regular dependencies
  if (pkgJson.dependencies) {
    for (const [name, version] of Object.entries(pkgJson.dependencies)) {
      dependencies.set(name, {
        package: packageName,
        version: version as string,
        isDev: false,
      });
    }
  }
  
  // Extract dev dependencies
  if (pkgJson.devDependencies) {
    for (const [name, version] of Object.entries(pkgJson.devDependencies)) {
      if (!dependencies.has(name)) {
        dependencies.set(name, {
          package: packageName,
          version: version as string,
          isDev: true,
        });
      }
    }
  }
  
  return dependencies;
}

/**
 * Estimate package size from node_modules (if available)
 */
async function estimatePackageSize(
  packageDir: string,
  depName: string
): Promise<number> {
  const depPath = path.join(packageDir, 'node_modules', depName);
  
  if (!await fs.pathExists(depPath)) {
    return 0;
  }
  
  try {
    const pkgJson = await fs.readJson(path.join(depPath, 'package.json'));
    // Rough estimate: use published size if available, otherwise estimate from files
    if (pkgJson.publishConfig?.size) {
      return pkgJson.publishConfig.size;
    }
    
    // Estimate by counting JS files
    const jsFiles = await glob('**/*.js', { cwd: depPath });
    return jsFiles.length * 10 * 1024; // Rough estimate: 10KB per file
  } catch {
    return 0;
  }
}

/**
 * Analyze all dependencies across the workspace
 */
export async function analyzeSharedDependencies(
  workspaceRoot: string
): Promise<Map<string, DependencyAnalysis>> {
  console.log(chalk.cyan('\n🔍 Analyzing workspace dependencies...\n'));
  
  const packages = await findAllPackages(workspaceRoot);
  const dependencyMap = new Map<string, DependencyUsage[]>();
  
  // Collect all dependencies from all packages
  for (const pkgDir of packages) {
    const deps = await extractDependencies(pkgDir);
    
    for (const [depName, usage] of deps) {
      if (!dependencyMap.has(depName)) {
        dependencyMap.set(depName, []);
      }
      dependencyMap.get(depName)!.push(usage);
    }
  }
  
  console.log(chalk.gray(`  ✓ Found ${packages.length} packages`));
  console.log(chalk.gray(`  ✓ Discovered ${dependencyMap.size} unique dependencies\n`));
  
  // Analyze each dependency
  const analysisMap = new Map<string, DependencyAnalysis>();
  
  for (const [depName, usages] of dependencyMap) {
    // Skip workspace packages and dev-only dependencies
    if (depName.startsWith('workspace:')) continue;
    if (usages.every(u => u.isDev)) continue;
    
    // Count versions
    const versions = new Map<string, number>();
    for (const usage of usages) {
      const count = versions.get(usage.version) || 0;
      versions.set(usage.version, count + 1);
    }
    
    // Estimate total size
    let totalSize = 0;
    for (const pkgDir of packages) {
      const size = await estimatePackageSize(pkgDir, depName);
      if (size > 0) {
        totalSize = size;
        break; // Use first found size
      }
    }
    
    // Determine recommendation
    const usageCount = usages.filter(u => !u.isDev).length;
    const hasConflicts = versions.size > 1;
    
    let recommendation: 'share' | 'keep-private' | 'review';
    if (usageCount >= 2 && !hasConflicts) {
      recommendation = 'share';
    } else if (usageCount === 1) {
      recommendation = 'keep-private';
    } else {
      recommendation = 'review';
    }
    
    // Calculate potential savings
    const potentialSavings = recommendation === 'share' 
      ? totalSize * (usageCount - 1) 
      : 0;
    
    analysisMap.set(depName, {
      name: depName,
      usageCount,
      usages,
      versions,
      totalSize,
      recommendation,
      potentialSavings,
      conflicts: hasConflicts,
    });
  }
  
  return analysisMap;
}

/**
 * Generate recommendations from analysis
 */
export function generateRecommendations(
  analysisMap: Map<string, DependencyAnalysis>
): OptimizationReport {
  const toShare: DependencyAnalysis[] = [];
  const keepPrivate: DependencyAnalysis[] = [];
  const needsReview: DependencyAnalysis[] = [];
  const versionConflicts: DependencyAnalysis[] = [];
  
  for (const analysis of analysisMap.values()) {
    if (analysis.recommendation === 'share') {
      toShare.push(analysis);
    } else if (analysis.recommendation === 'keep-private') {
      keepPrivate.push(analysis);
    } else {
      needsReview.push(analysis);
    }
    
    if (analysis.conflicts) {
      versionConflicts.push(analysis);
    }
  }
  
  // Sort by potential savings
  toShare.sort((a, b) => b.potentialSavings - a.potentialSavings);
  needsReview.sort((a, b) => b.usageCount - a.usageCount);
  
  const totalPotentialSavings = toShare.reduce(
    (sum, dep) => sum + dep.potentialSavings,
    0
  );
  
  return {
    totalPackages: new Set(
      Array.from(analysisMap.values())
        .flatMap(a => a.usages.map(u => u.package))
    ).size,
    analyzedDependencies: analysisMap.size,
    recommendations: {
      toShare,
      keepPrivate,
      needsReview,
    },
    totalPotentialSavings,
    versionConflicts,
  };
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Print optimization report to console
 */
export function printOptimizationReport(report: OptimizationReport): void {
  console.log(chalk.bold.cyan('\n📊 Optimization Report\n'));
  console.log(chalk.gray(`Analyzed ${report.totalPackages} packages with ${report.analyzedDependencies} dependencies\n`));
  
  // Recommendations to share
  if (report.recommendations.toShare.length > 0) {
    console.log(chalk.bold.green(`✅ Recommend sharing (${report.recommendations.toShare.length} dependencies):\n`));
    
    for (const dep of report.recommendations.toShare.slice(0, 10)) {
      const savings = formatBytes(dep.potentialSavings);
      console.log(chalk.green(`  📦 ${dep.name}`));
      console.log(chalk.gray(`     Used in ${dep.usageCount} packages | Saves ~${savings}`));
      console.log(chalk.gray(`     Versions: ${Array.from(dep.versions.keys()).join(', ')}`));
    }
    
    if (report.recommendations.toShare.length > 10) {
      console.log(chalk.gray(`\n     ... and ${report.recommendations.toShare.length - 10} more\n`));
    }
  }
  
  // Dependencies to keep private
  if (report.recommendations.keepPrivate.length > 0) {
    console.log(chalk.bold.yellow(`\n⚠️  Keep private (${report.recommendations.keepPrivate.length} dependencies):\n`));
    console.log(chalk.gray(`     Used in only 1 package each, not worth sharing\n`));
  }
  
  // Dependencies needing review
  if (report.recommendations.needsReview.length > 0) {
    console.log(chalk.bold.yellow(`\n🔍 Needs review (${report.recommendations.needsReview.length} dependencies):\n`));
    
    for (const dep of report.recommendations.needsReview.slice(0, 5)) {
      console.log(chalk.yellow(`  📦 ${dep.name}`));
      console.log(chalk.gray(`     Used in ${dep.usageCount} packages | ${dep.versions.size} different versions`));
      const versions = Array.from(dep.versions.entries())
        .map(([v, count]) => `${v} (${count}x)`)
        .join(', ');
      console.log(chalk.gray(`     Versions: ${versions}`));
    }
    
    if (report.recommendations.needsReview.length > 5) {
      console.log(chalk.gray(`\n     ... and ${report.recommendations.needsReview.length - 5} more\n`));
    }
  }
  
  // Version conflicts
  if (report.versionConflicts.length > 0) {
    console.log(chalk.bold.red(`\n❌ Version conflicts (${report.versionConflicts.length} dependencies):\n`));
    
    for (const dep of report.versionConflicts.slice(0, 5)) {
      console.log(chalk.red(`  📦 ${dep.name}`));
      const versions = Array.from(dep.versions.entries())
        .map(([v, count]) => `${v} (${count} packages)`)
        .join(', ');
      console.log(chalk.gray(`     Versions: ${versions}`));
      console.log(chalk.gray(`     Recommendation: Align to single version\n`));
    }
  }
  
  // Summary
  console.log(chalk.bold.cyan('\n💡 Summary:\n'));
  console.log(chalk.green(`  ✓ ${report.recommendations.toShare.length} dependencies can be shared`));
  console.log(chalk.gray(`  • ${report.recommendations.keepPrivate.length} dependencies are package-specific`));
  console.log(chalk.yellow(`  ⚠ ${report.recommendations.needsReview.length} dependencies need version alignment`));
  console.log(chalk.red(`  ❌ ${report.versionConflicts.length} version conflicts detected`));
  console.log(chalk.bold.green(`\n  💰 Total potential savings: ~${formatBytes(report.totalPotentialSavings)}\n`));
}

/**
 * Update module-federation.config files with shared dependencies
 */
export async function applyOptimizations(
  workspaceRoot: string,
  report: OptimizationReport,
  options: { dryRun?: boolean } = {}
): Promise<void> {
  const { dryRun = false } = options;
  
  if (dryRun) {
    console.log(chalk.cyan('\n🔍 Dry run mode - no files will be modified\n'));
  } else {
    console.log(chalk.cyan('\n✨ Applying optimizations...\n'));
  }
  
  const packages = await findAllPackages(workspaceRoot);
  const sharedDeps = report.recommendations.toShare.map(d => d.name);
  
  for (const pkgDir of packages) {
    const pkgJson = await fs.readJson(path.join(pkgDir, 'package.json'));
    const pkgName = pkgJson.name || path.basename(pkgDir);
    
    // Find module-federation.config file
    const configPaths = [
      path.join(pkgDir, 'module-federation.config.ts'),
      path.join(pkgDir, 'module-federation.config.js'),
      path.join(pkgDir, 'module-federation.config.cjs'),
    ];
    
    let configPath: string | null = null;
    for (const p of configPaths) {
      if (await fs.pathExists(p)) {
        configPath = p;
        break;
      }
    }
    
    if (!configPath) {
      console.log(chalk.gray(`  ⊘ ${pkgName}: No federation config found, skipping`));
      continue;
    }
    
    // Read current config
    let content = await fs.readFile(configPath, 'utf8');
    
    // Extract dependencies used in this package
    const deps = await extractDependencies(pkgDir);
    const relevantShared = sharedDeps.filter(dep => deps.has(dep));
    
    if (relevantShared.length === 0) {
      console.log(chalk.gray(`  ⊘ ${pkgName}: No shareable dependencies, skipping`));
      continue;
    }
    
    // Update shared configuration
    const sharedEntries = relevantShared.map(dep => {
      const usage = deps.get(dep)!;
      return `    '${dep}': { singleton: true, requiredVersion: '${usage.version}' }`;
    }).join(',\n');
    
    // Try to find and replace shared section
    const sharedRegex = /shared:\s*\{[^}]*\}/s;
    const sharedArrayRegex = /shared:\s*\[[^\]]*\]/s;
    
    if (sharedRegex.test(content)) {
      content = content.replace(
        sharedRegex,
        `shared: {\n${sharedEntries}\n  }`
      );
    } else if (sharedArrayRegex.test(content)) {
      content = content.replace(
        sharedArrayRegex,
        `shared: {\n${sharedEntries}\n  }`
      );
    } else {
      console.log(chalk.yellow(`  ⚠ ${pkgName}: Could not find shared config, manual update needed`));
      continue;
    }
    
    if (!dryRun) {
      await fs.writeFile(configPath, content, 'utf8');
      console.log(chalk.green(`  ✓ ${pkgName}: Updated with ${relevantShared.length} shared dependencies`));
    } else {
      console.log(chalk.cyan(`  ○ ${pkgName}: Would update with ${relevantShared.length} shared dependencies`));
    }
  }
  
  if (dryRun) {
    console.log(chalk.cyan('\n💡 Run without --dry-run to apply changes\n'));
  } else {
    console.log(chalk.green('\n✅ Optimizations applied successfully!\n'));
  }
}

/**
 * Main optimization function
 */
export async function optimizeWorkspace(
  workspaceRoot: string,
  options: {
    apply?: boolean;
    dryRun?: boolean;
  } = {}
): Promise<OptimizationReport> {
  const { apply = false, dryRun = false } = options;
  
  // Analyze dependencies
  const analysisMap = await analyzeSharedDependencies(workspaceRoot);
  
  // Generate recommendations
  const report = generateRecommendations(analysisMap);
  
  // Print report
  printOptimizationReport(report);
  
  // Apply if requested
  if (apply) {
    await applyOptimizations(workspaceRoot, report, { dryRun });
  } else {
    console.log(chalk.cyan('\n💡 To apply these optimizations, run with --apply flag\n'));
  }
  
  return report;
}
