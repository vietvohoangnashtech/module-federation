#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES = {
  'react-vite': '../../mf_react_vite',
  'react-webpack': '../../mf_react_webpack',
  'react-rsbuild': '../../mf_react_rsbuild',
  provider: '../../mf_provider_app',
};

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

async function copyTemplates() {
  const templatesDir = path.join(__dirname, '../templates');

  // Clean templates directory
  await fs.remove(templatesDir);
  await fs.ensureDir(templatesDir);

  for (const [name, source] of Object.entries(TEMPLATES)) {
    const sourcePath = path.resolve(__dirname, source);
    const targetPath = path.join(templatesDir, name);

    console.log(`📦 Copying template ${name}...`);
    await fs.ensureDir(targetPath);

    const entries = await fs.readdir(sourcePath);
    for (const entry of entries) {
      if (EXCLUDE.includes(entry)) continue;
      const srcPath = path.join(sourcePath, entry);
      const destPath = path.join(targetPath, entry);
      await fs.copy(srcPath, destPath);
    }
  }

  console.log('✅ Templates prepared for publishing!');
}

copyTemplates().catch(console.error);
