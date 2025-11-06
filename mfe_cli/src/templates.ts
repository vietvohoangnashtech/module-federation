import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

interface CreateOptions {
  name: string;
  template: string;
  mfName: string;
  port: number;
  shared: string;
  install: boolean;
  gitInit: boolean;
  force: boolean;
  targetDir: string;
  root: string;
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Map template keys to workspace package names
const TEMPLATE_SOURCE_MAP: Record<string, string> = {
  'react-vite': 'mf_react_vite',
  'react-webpack': 'mf_react_webpack',
  'react-rsbuild': 'mf_react_rsbuild',
  provider: 'mf_provider_app',
};

export async function createFromTemplate(opts: CreateOptions) {
  const templateRoot = await resolveTemplateSource(opts);
  if (!templateRoot) {
    throw new Error(
      `Unable to resolve template source for '${opts.template}'.`
    );
  }

  console.log(
    chalk.cyan(`\n📦 Copying template from: ${path.basename(templateRoot)}`)
  );

  if (await fs.pathExists(opts.targetDir)) {
    if (!opts.force) {
      throw new Error(
        `Directory ${opts.name} already exists. Use --force to overwrite.`
      );
    }
    await fs.remove(opts.targetDir);
  }

  await copyTemplate(templateRoot, opts.targetDir);
  await replaceTokensInFiles(opts);

  console.log(chalk.green(`✅ Template copied successfully`));
}

async function resolveTemplateSource(opts: CreateOptions): Promise<string> {
  const templatePkg = TEMPLATE_SOURCE_MAP[opts.template];
  if (!templatePkg) {
    throw new Error(
      `Unknown template '${opts.template}'. Available: ${Object.keys(
        TEMPLATE_SOURCE_MAP
      ).join(', ')}`
    );
  }

  // Try workspace path first (development mode)
  const workspacePath = path.join(opts.root, templatePkg);
  if (await fs.pathExists(workspacePath)) {
    return workspacePath;
  }

  // Try different possible locations for packaged templates
  const possiblePaths = [
    path.join(__dirname, '../../templates', opts.template),
    path.join(__dirname, '../templates', opts.template),
    path.join(process.cwd(), 'templates', opts.template),
  ];

  for (const publishedPath of possiblePaths) {
    if (await fs.pathExists(publishedPath)) {
      return publishedPath;
    }
  }

  console.error('Debug - Attempted paths:', {
    workspacePath,
    possiblePaths,
    cwd: process.cwd(),
    dirname: __dirname,
  });

  throw new Error(
    `Template '${opts.template}' not found. Make sure you're either:\n` +
      `1. Running from the module-federation workspace, or\n` +
      `2. Using a published version with packaged templates`
  );
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
    '.cache',
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
  if (!(await fs.pathExists(pkgPath))) return;

  const pkg = await fs.readJson(pkgPath);
  pkg.name = opts.name;

  // Update dev script port if exists
  if (pkg.scripts?.dev) {
    if (opts.template === 'react-vite') {
      pkg.scripts.dev = `vite --port ${opts.port}`;
    } else if (opts.template === 'react-webpack') {
      pkg.scripts.dev = `webpack serve --config webpack.config.cjs --mode development --progress --port ${opts.port}`;
    } else if (opts.template === 'react-rsbuild') {
      pkg.scripts.dev = `rsbuild dev --port ${opts.port}`;
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
    content = content.replace(
      /name:\s*['"][\w_-]+['"]/,
      `name: '${opts.mfName}'`
    );
    await fs.writeFile(tsPath, content, 'utf8');
    console.log(
      chalk.gray(
        `  ✓ Updated module-federation.config.ts (name: ${opts.mfName})`
      )
    );
  }

  if (await fs.pathExists(cjsPath)) {
    let content = await fs.readFile(cjsPath, 'utf8');
    content = content.replace(
      /name:\s*['"][\w_-]+['"]/,
      `name: '${opts.mfName}'`
    );
    await fs.writeFile(cjsPath, content, 'utf8');
    console.log(
      chalk.gray(
        `  ✓ Updated module-federation.config.cjs (name: ${opts.mfName})`
      )
    );
  }
}

async function updateViteConfig(opts: CreateOptions) {
  const configPath = path.join(opts.targetDir, 'vite.config.ts');
  if (!(await fs.pathExists(configPath))) return;

  let content = await fs.readFile(configPath, 'utf8');
  // Replace the federation name
  content = content.replace(
    /name:\s*['"][\w_-]+['"]/,
    `name: '${opts.mfName}'`
  );

  await fs.writeFile(configPath, content, 'utf8');
  console.log(chalk.gray(`  ✓ Updated vite.config.ts`));
}

async function updateWebpackConfig(opts: CreateOptions) {
  const configPath = path.join(opts.targetDir, 'webpack.config.cjs');
  if (!(await fs.pathExists(configPath))) return;

  let content = await fs.readFile(configPath, 'utf8');
  // Update devServer port
  content = content.replace(/port:\s*\d+/, `port: ${opts.port}`);

  await fs.writeFile(configPath, content, 'utf8');
  console.log(chalk.gray(`  ✓ Updated webpack.config.cjs`));
}

async function updateRsbuildConfig(opts: CreateOptions) {
  const configPath = path.join(opts.targetDir, 'rsbuild.config.ts');
  if (!(await fs.pathExists(configPath))) return;

  // Rsbuild config typically doesn't have port inline, controlled via CLI
  console.log(chalk.gray(`  ✓ Rsbuild config unchanged (port via CLI)`));
}

async function updateReadme(opts: CreateOptions) {
  const readmePath = path.join(opts.targetDir, 'README.md');
  if (!(await fs.pathExists(readmePath))) {
    await fs.writeFile(
      readmePath,
      `# ${opts.name}\n\nGenerated from ${opts.template} template.\n\n## Quick Start\n\`\`\`bash\npnpm install\npnpm dev\n\`\`\`\n`
    );
  } else {
    let content = await fs.readFile(readmePath, 'utf8');
    // Replace first heading if it matches template package name
    const sourcePackage = TEMPLATE_SOURCE_MAP[opts.template];
    if (sourcePackage) {
      content = content.replace(
        new RegExp(`#\\s*${sourcePackage}`, 'i'),
        `# ${opts.name}`
      );
    }
    await fs.writeFile(readmePath, content, 'utf8');
  }
  console.log(chalk.gray(`  ✓ Updated README.md`));
}
