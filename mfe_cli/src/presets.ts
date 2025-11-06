import chalk from 'chalk';

export interface PresetConfig {
  framework: string;
  buildTool: string;
  uiLibs: string[];
  shared: string[];
  storybook?: boolean;
  testing?: 'jest' | 'vitest' | 'none';
  linting?: boolean;
  typescript?: boolean;
  description?: string;
}

/**
 * Predefined presets for common use cases
 */
export const PRESETS: Record<string, PresetConfig> = {
  'nashtech-react': {
    framework: 'react',
    buildTool: 'vite',
    uiLibs: ['@nashtech-garage/headless-ui@^0.0.1'],
    shared: ['react', 'react-dom', '@nashtech-garage/headless-ui'],
    storybook: true,
    testing: 'vitest',
    linting: true,
    typescript: true,
    description:
      'NashTech React preset with Headless UI, Vite, Vitest, and Storybook',
  },

  'nashtech-react-webpack': {
    framework: 'react',
    buildTool: 'webpack',
    uiLibs: ['@nashtech-garage/headless-ui@^0.0.1'],
    shared: ['react', 'react-dom', '@nashtech-garage/headless-ui'],
    storybook: true,
    testing: 'jest',
    linting: true,
    typescript: true,
    description:
      'NashTech React preset with Webpack, Jest, and traditional tooling',
  },

  minimal: {
    framework: 'react',
    buildTool: 'vite',
    uiLibs: [],
    shared: ['react', 'react-dom'],
    storybook: false,
    testing: 'none',
    linting: false,
    typescript: true,
    description: 'Minimal React + Vite setup with no UI libraries or testing',
  },

  'enterprise-react': {
    framework: 'react',
    buildTool: 'rsbuild',
    uiLibs: ['@radix-ui/themes@^3.0.0', 'antd@^5.0.0'],
    shared: ['react', 'react-dom', '@radix-ui/themes', 'antd'],
    storybook: true,
    testing: 'vitest',
    linting: true,
    typescript: true,
    description:
      'Enterprise-ready React with Rsbuild, Radix UI, Ant Design, and full tooling',
  },

  'enterprise-angular': {
    framework: 'angular',
    buildTool: 'webpack',
    uiLibs: ['@angular/material@^17.0.0'],
    shared: [
      '@angular/core',
      '@angular/common',
      '@angular/router',
      '@angular/material',
    ],
    storybook: false,
    testing: 'jest',
    linting: true,
    typescript: true,
    description: 'Enterprise Angular with Material UI and Webpack',
  },

  prototype: {
    framework: 'react',
    buildTool: 'vite',
    uiLibs: ['@radix-ui/themes@^3.0.0'],
    shared: ['react', 'react-dom'],
    storybook: false,
    testing: 'none',
    linting: false,
    typescript: true,
    description: 'Quick prototype setup with Radix UI and minimal tooling',
  },
};

/**
 * Get preset configuration by name
 */
export function getPreset(name: string): PresetConfig | null {
  return PRESETS[name] || null;
}

/**
 * List all available presets
 */
export function listPresets(): void {
  console.log(chalk.cyan.bold('\n📋 Available Presets:\n'));

  Object.entries(PRESETS).forEach(([name, config]) => {
    console.log(chalk.green(`  ${name}`));
    console.log(chalk.gray(`    ${config.description || 'No description'}`));
    console.log(
      chalk.gray(
        `    Framework: ${config.framework} | Build Tool: ${config.buildTool}`
      )
    );
    if (config.uiLibs.length > 0) {
      console.log(chalk.gray(`    UI Libraries: ${config.uiLibs.join(', ')}`));
    }
    console.log('');
  });
}

/**
 * Validate preset name
 */
export function isValidPreset(name: string): boolean {
  return name in PRESETS;
}

/**
 * Merge preset with user options (user options take precedence)
 */
export function mergePresetWithOptions(
  preset: PresetConfig,
  userOptions: Partial<PresetConfig>
): PresetConfig {
  return {
    ...preset,
    ...userOptions,
    // Merge arrays
    uiLibs: userOptions.uiLibs || preset.uiLibs,
    shared: userOptions.shared || preset.shared,
  };
}
