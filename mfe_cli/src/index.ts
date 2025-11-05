#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { mutateWorkspace } from './workspace.js';
import { createFromTemplate } from './templates.js';

interface CliArgs {
  name?: string;
  template?: string;
  mfName?: string;
  port?: number;
  shared?: string;
  install?: boolean;
  gitInit?: boolean;
  force?: boolean;
}

const TEMPLATES = ['react-vite', 'react-webpack', 'react-rsbuild', 'provider'];

async function ensureArgs(argv: CliArgs): Promise<Required<CliArgs>> {
  let { name, template, mfName, port, shared, install, gitInit, force } = argv;
  const missing = !name || !template || !mfName;
  if (missing) {
    console.log(chalk.cyan('\n🎯 Module Federation Generator\n'));
    const answers = await inquirer.prompt(
      [
        !name
          ? { name: 'name', message: 'Package folder name?', validate: Boolean }
          : null,
        !template
          ? {
              name: 'template',
              message: 'Template?',
              type: 'list',
              choices: TEMPLATES,
            }
          : null,
        !mfName
          ? {
              name: 'mfName',
              message: 'Module Federation container name?',
              validate: Boolean,
            }
          : null,
        !port
          ? {
              name: 'port',
              message: 'Dev port?',
              default: 3000,
              type: 'number',
            }
          : null,
        !shared
          ? {
              name: 'shared',
              message: 'Comma separated shared libs?',
              default: 'react,react-dom',
            }
          : null,
      ].filter(Boolean) as any
    );
    name ??= answers.name;
    template ??= answers.template;
    mfName ??= answers.mfName;
    port ??= answers.port;
    shared ??= answers.shared;
  }
  install = install ?? false;
  gitInit = gitInit ?? false;
  force = force ?? false;
  return {
    name: name!,
    template: template!,
    mfName: mfName!,
    port: port!,
    shared: shared!,
    install,
    gitInit,
    force,
  };
}

async function runInstall(targetDir: string, packageName: string) {
  console.log(chalk.cyan(`\n📦 Installing dependencies for ${packageName}...`));
  try {
    execSync(`pnpm install`, {
      cwd: targetDir,
      stdio: 'inherit',
    });
    console.log(chalk.green('✅ Dependencies installed successfully'));
  } catch (error) {
    console.log(
      chalk.yellow('⚠️  Installation failed. Run manually: pnpm install')
    );
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n🚀 Module Federation CLI\n'));

  const argv = yargs(hideBin(process.argv))
    .scriptName('generate-mfe')
    .usage('$0 <name> [options]')
    .positional('name', { describe: 'Directory/package name', type: 'string' })
    .option('template', {
      type: 'string',
      choices: TEMPLATES,
      describe: 'Template key',
    })
    .check((argv) => {
      if (argv._.length > 0) {
        argv.name = argv._[0].toString();
      }
      return true;
    })
    .option('mf-name', {
      type: 'string',
      describe: 'Container/remote name',
      demandOption: false,
    })
    .option('port', { type: 'number', default: 3000 })
    .option('shared', {
      type: 'string',
      default: 'react,react-dom',
      describe: 'Shared/peer deps',
    })
    .option('install', {
      type: 'boolean',
      default: false,
      describe: 'Run pnpm install after generation',
    })
    .option('git-init', { type: 'boolean', default: false })
    .option('force', {
      type: 'boolean',
      default: false,
      describe: 'Overwrite existing directory',
    })
    .example(
      '$0 my-app --template react-vite --mf-name myRemote --port 3200',
      'Generate a Vite MFE'
    )
    .example(
      '$0 analytics --template react-webpack --mf-name analytics --install',
      'Generate and install Webpack MFE'
    )
    .help().argv as any as CliArgs;

  const full = await ensureArgs(argv);

  if (!TEMPLATES.includes(full.template)) {
    console.error(
      chalk.red(
        `❌ Unknown template '${full.template}'. Available: ${TEMPLATES.join(
          ', '
        )}`
      )
    );
    process.exit(1);
  }

  const root = process.cwd();
  const targetDir = path.join(root, full.name);

  try {
    await createFromTemplate({ ...full, targetDir, root });
    await mutateWorkspace(root, full.name);

    if (full.install) {
      await runInstall(targetDir, full.name);
    }

    console.log(
      chalk.green.bold(`\n✨ Successfully generated MFE '${full.name}'!`)
    );
    console.log(chalk.cyan(`\n📋 Next steps:`));
    console.log(chalk.white(`  1. cd ${full.name}`));
    if (!full.install) {
      console.log(chalk.white(`  2. pnpm install`));
    }
    console.log(chalk.white(`  ${full.install ? '2' : '3'}. pnpm dev`));
    console.log(
      chalk.white(
        `  ${full.install ? '3' : '4'}. Open http://localhost:${full.port}`
      )
    );
    console.log(
      chalk.gray(
        `\n💡 Add to workspace dev orchestration if needed (see root package.json scripts)`
      )
    );
    console.log(
      chalk.gray(`💡 Module Federation name: ${chalk.bold(full.mfName)}\n`)
    );
  } catch (error) {
    console.error(
      chalk.red.bold('\n❌ Generation failed:'),
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(chalk.red(err instanceof Error ? err.stack : String(err)));
  process.exit(1);
});
