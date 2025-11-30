import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getFrameworkHandler, type CreateOptions } from './framework-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Map template keys to existing workspace packages (boilerplates)
// Legacy format: template key -> package name
// New format: framework-buildTool -> package name
const TEMPLATE_SOURCE_MAP: Record<string, string> = {
  // React templates (legacy + new)
  'react-vite': 'mf_react_vite',
  'react-webpack': 'mf_react_webpack',
  'react-rsbuild': 'mf_react_rsbuild',
  'provider': 'mf_provider_app',
  
  // Angular templates
  'angular-webpack': 'mf_angular_webpack',
  
  // Vue templates
  'vue-vite': 'mf_vue_vite',
  'vue-webpack': 'mf_vue_vite', // Use same template, config will adapt
  
  // Svelte templates
  'svelte-vite': 'mf_svelte_vite',
};

export async function createFromTemplate(opts: CreateOptions) {
  const templateRoot = await resolveTemplateSource(opts);
  if (!templateRoot) {
    throw new Error(`Unable to resolve template source for '${opts.template}'.`);
  }
  
  console.log(chalk.cyan(`\n📦 Copying template from: ${path.basename(templateRoot)}`));
  console.log(chalk.gray(`   Framework: ${opts.framework}, Build Tool: ${opts.buildTool}`));
  
  if (await fs.pathExists(opts.targetDir)) {
    if (!opts.force) {
      throw new Error(`Directory ${opts.name} already exists. Use --force to overwrite.`);
    }
    await fs.remove(opts.targetDir);
  }
  
  await copyTemplate(templateRoot, opts.targetDir);
  await replaceTokensInFiles(opts);
  
  // Apply framework-specific configurations
  if (opts.framework) {
    const handler = getFrameworkHandler(opts.framework);
    await handler.updateConfig(opts);
  }
  
  console.log(chalk.green(`✅ Template copied successfully`));
}

async function resolveTemplateSource(opts: CreateOptions): Promise<string | null> {
  // Use existing workspace package as the boilerplate source
  // Support both legacy template keys and new framework-buildTool format
  let templateKey = opts.template;
  
  // If using framework+buildTool mode, construct template key
  if (opts.framework && opts.buildTool) {
    templateKey = `${opts.framework}-${opts.buildTool}`;
  }
  
  if (!templateKey) {
    throw new Error(`No template specified. Available: ${Object.keys(TEMPLATE_SOURCE_MAP).join(', ')}`);
  }
  
  const sourcePackage = TEMPLATE_SOURCE_MAP[templateKey];
  if (!sourcePackage) {
    throw new Error(`Template '${templateKey}' not found. Available: ${Object.keys(TEMPLATE_SOURCE_MAP).join(', ')}`);
  }
  
  // Try workspace path first (development mode)
  const pkgDir = path.join(opts.root, sourcePackage);
  if (await fs.pathExists(pkgDir)) {
    return pkgDir;
  }
  
  // Try packaged templates (published mode)
  const possiblePackedPaths = [
    path.join(__dirname, '../templates', templateKey),
    path.join(process.cwd(), 'templates', templateKey),
  ];
  
  for (const packedPath of possiblePackedPaths) {
    if (await fs.pathExists(packedPath)) {
      return packedPath;
    }
  }
  
  throw new Error(`Template '${templateKey}' not found in workspace or packaged templates. Run 'pnpm prepare-publish' to prepare templates.`);
}

async function copyTemplate(source: string, target: string) {
  const EXCLUDE = [
    'node_modules',
    'dist',
    'coverage',
    '.turbo',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    '.git',
    'build',
    '.next',
    '.cache'
  ];
  
  await fs.mkdirp(target);
  const entries = await fs.readdir(source);
  
  for (const entry of entries) {
    if (EXCLUDE.includes(entry)) continue;
    const srcPath = path.join(source, entry);
    const destPath = path.join(target, entry);
    await fs.copy(srcPath, destPath);
  }
}

async function replaceTokensInFiles(opts: CreateOptions) {
  console.log(chalk.gray('🔧 Applying customizations...'));
  
  // Update package.json
  await updatePackageJson(opts);
  
  // Update module-federation config files
  await updateFederationConfig(opts);
  
  // Update vite.config.ts if exists
  await updateViteConfig(opts);
  
  // Update webpack.config.cjs if exists
  await updateWebpackConfig(opts);
  
  // Update rsbuild.config.ts if exists
  await updateRsbuildConfig(opts);
  
  // Update README
  await updateReadme(opts);
}

async function updatePackageJson(opts: CreateOptions) {
  const pkgPath = path.join(opts.targetDir, 'package.json');
  if (!await fs.pathExists(pkgPath)) return;
  
  const pkg = await fs.readJson(pkgPath);
  pkg.name = opts.name;
  
  // Update dev script port if exists
  if (pkg.scripts?.dev) {
    // Framework-specific script updates
    if (opts.framework === 'react' || opts.framework === 'vue' || opts.framework === 'svelte') {
      if (opts.buildTool === 'vite') {
        pkg.scripts.dev = `vite --port ${opts.port}`;
      } else if (opts.buildTool === 'webpack') {
        pkg.scripts.dev = `webpack serve --config webpack.config.cjs --mode development --progress --port ${opts.port}`;
      } else if (opts.buildTool === 'rsbuild') {
        pkg.scripts.dev = `rsbuild dev --port ${opts.port}`;
      }
    } else if (opts.framework === 'angular') {
      // Angular uses ng serve with port in angular.json
      pkg.scripts.dev = `ng serve`;
    }
  }
  
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  console.log(chalk.gray(`  ✓ Updated package.json (name: ${opts.name})`));
}

async function updateFederationConfig(opts: CreateOptions) {
  const tsPath = path.join(opts.targetDir, 'module-federation.config.ts');
  const cjsPath = path.join(opts.targetDir, 'module-federation.config.cjs');
  
  if (await fs.pathExists(tsPath)) {
    let content = await fs.readFile(tsPath, 'utf8');
    content = content.replace(/name:\s*['"][\w_-]+['"]/, `name: '${opts.mfName}'`);
    await fs.writeFile(tsPath, content, 'utf8');
    console.log(chalk.gray(`  ✓ Updated module-federation.config.ts (name: ${opts.mfName})`));
  }
  
  if (await fs.pathExists(cjsPath)) {
    let content = await fs.readFile(cjsPath, 'utf8');
    content = content.replace(/name:\s*['"][\w_-]+['"]/, `name: '${opts.mfName}'`);
    await fs.writeFile(cjsPath, content, 'utf8');
    console.log(chalk.gray(`  ✓ Updated module-federation.config.cjs (name: ${opts.mfName})`));
  }
}

async function updateViteConfig(opts: CreateOptions) {
  const configPath = path.join(opts.targetDir, 'vite.config.ts');
  if (!await fs.pathExists(configPath)) return;
  
  let content = await fs.readFile(configPath, 'utf8');
  // Replace the federation name
  content = content.replace(/name:\s*['"][\w_-]+['"]/, `name: '${opts.mfName}'`);
  
  await fs.writeFile(configPath, content, 'utf8');
  console.log(chalk.gray(`  ✓ Updated vite.config.ts`));
}

async function updateWebpackConfig(opts: CreateOptions) {
  const configPath = path.join(opts.targetDir, 'webpack.config.cjs');
  if (!await fs.pathExists(configPath)) return;
  
  let content = await fs.readFile(configPath, 'utf8');
  // Update devServer port
  content = content.replace(/port:\s*\d+/, `port: ${opts.port}`);
  
  await fs.writeFile(configPath, content, 'utf8');
  console.log(chalk.gray(`  ✓ Updated webpack.config.cjs`));
}

async function updateRsbuildConfig(opts: CreateOptions) {
  const configPath = path.join(opts.targetDir, 'rsbuild.config.ts');
  if (!await fs.pathExists(configPath)) return;
  
  // Rsbuild config typically doesn't have port inline, controlled via CLI
  console.log(chalk.gray(`  ✓ Rsbuild config unchanged (port via CLI)`));
}

async function updateReadme(opts: CreateOptions) {
  const readmePath = path.join(opts.targetDir, 'README.md');
  const templateKey = opts.framework && opts.buildTool ? `${opts.framework}-${opts.buildTool}` : opts.template;
  
  if (!await fs.pathExists(readmePath)) {
    await fs.writeFile(readmePath, `# ${opts.name}\n\nGenerated from ${templateKey} template.\n\nFramework: ${opts.framework}\nBuild Tool: ${opts.buildTool}\n\n## Quick Start\n\`\`\`bash\npnpm install\npnpm dev\n\`\`\`\n`);
  } else {
    let content = await fs.readFile(readmePath, 'utf8');
    // Replace first heading if it matches template package name
    if (templateKey) {
      const sourcePackage = TEMPLATE_SOURCE_MAP[templateKey];
      if (sourcePackage) {
        content = content.replace(new RegExp(`#\\s*${sourcePackage}`, 'i'), `# ${opts.name}`);
      }
    }
    await fs.writeFile(readmePath, content, 'utf8');
  }
  console.log(chalk.gray(`  ✓ Updated README.md`));
}
