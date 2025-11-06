import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

export interface UILibrary {
  name: string;
  version: string;
  peerDependencies?: string[];
  federationShared?: boolean;
}

/**
 * Parse UI library string format: @scope/package@version or package@version
 */
export function parseUILibrary(libString: string): {
  name: string;
  version: string;
} {
  // Handle @scope/package@version
  const scopedMatch = libString.match(
    /^(@[\w-]+\/[\w-]+)(?:@([\d.^~]+|latest))?$/
  );
  if (scopedMatch) {
    return {
      name: scopedMatch[1],
      version: scopedMatch[2] || 'latest',
    };
  }

  // Handle package@version
  const match = libString.match(/^([\w-]+)(?:@([\d.^~]+|latest))?$/);
  if (match) {
    return {
      name: match[1],
      version: match[2] || 'latest',
    };
  }

  throw new Error(
    `Invalid UI library format: ${libString}. Use 'package@version' or '@scope/package@version'`
  );
}

/**
 * Add UI libraries to package.json dependencies
 */
export async function addUILibraries(
  targetDir: string,
  libs: string[]
): Promise<void> {
  if (!libs || libs.length === 0) return;

  const pkgPath = path.join(targetDir, 'package.json');
  if (!(await fs.pathExists(pkgPath))) {
    throw new Error(`package.json not found in ${targetDir}`);
  }

  const pkg = await fs.readJson(pkgPath);
  pkg.dependencies = pkg.dependencies || {};

  for (const libString of libs) {
    try {
      const { name, version } = parseUILibrary(libString);
      pkg.dependencies[name] = version;
      console.log(chalk.cyan(`  📦 Added ${name}@${version}`));
    } catch (error) {
      console.warn(chalk.yellow(`  ⚠️  Skipped invalid library: ${libString}`));
    }
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

/**
 * Configure Module Federation shared config for UI libraries
 */
export async function configureSharedUILibs(
  targetDir: string,
  libs: string[],
  framework: string = 'react'
): Promise<void> {
  if (!libs || libs.length === 0) return;

  const libNames = libs
    .map((l) => {
      try {
        return parseUILibrary(l).name;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as string[];

  if (libNames.length === 0) return;

  // Try TypeScript config first
  const tsConfigPath = path.join(targetDir, 'module-federation.config.ts');
  if (await fs.pathExists(tsConfigPath)) {
    await updateFederationConfigTS(tsConfigPath, libNames, framework);
    return;
  }

  // Try CommonJS config
  const cjsConfigPath = path.join(targetDir, 'module-federation.config.cjs');
  if (await fs.pathExists(cjsConfigPath)) {
    await updateFederationConfigCJS(cjsConfigPath, libNames, framework);
    return;
  }

  console.warn(
    chalk.yellow(
      '  ⚠️  No module-federation config found. Skipping shared config.'
    )
  );
}

async function updateFederationConfigTS(
  configPath: string,
  libNames: string[],
  framework: string
): Promise<void> {
  let content = await fs.readFile(configPath, 'utf8');

  // Create shared entries
  const sharedEntries = libNames
    .map((lib) => {
      // Framework-specific shared config
      if (
        framework === 'react' &&
        (lib.includes('react') || lib.includes('@radix-ui'))
      ) {
        return `    '${lib}': { singleton: true, requiredVersion: false }`;
      } else if (framework === 'angular' && lib.includes('@angular')) {
        return `    '${lib}': { singleton: true, strictVersion: true, requiredVersion: 'auto' }`;
      } else if (framework === 'vue' && lib === 'vue') {
        return `    '${lib}': { singleton: true, requiredVersion: false }`;
      }
      return `    '${lib}': { singleton: false }`;
    })
    .join(',\n');

  // Try to inject into existing shared array
  if (content.includes('shared: {')) {
    // Find the shared object and add entries
    const sharedPattern = /(shared:\s*\{[^}]*)(})/s;
    if (sharedPattern.test(content)) {
      content = content.replace(sharedPattern, (match, prefix, suffix) => {
        // Add comma if there's existing content
        const needsComma = prefix.trim().endsWith('{') ? '' : ',\n';
        return `${prefix}${needsComma}${sharedEntries}\n  ${suffix}`;
      });
    }
  } else if (content.includes('shared: [')) {
    // Convert array to object format
    const arrayPattern = /shared:\s*\[([^\]]*)\]/;
    content = content.replace(arrayPattern, (match, arrayContent) => {
      const existingLibs = arrayContent
        .split(',')
        .map((s: string) => s.trim().replace(/['"]/g, ''))
        .filter((s: string) => s.length > 0)
        .map((lib: string) => `    '${lib}': { singleton: true }`)
        .join(',\n');

      const allLibs = existingLibs
        ? `${existingLibs},\n${sharedEntries}`
        : sharedEntries;
      return `shared: {\n${allLibs}\n  }`;
    });
  }

  await fs.writeFile(configPath, content, 'utf8');
  console.log(
    chalk.green(
      `  ✓ Configured ${libNames.length} shared UI lib(s) in TypeScript config`
    )
  );
}

async function updateFederationConfigCJS(
  configPath: string,
  libNames: string[],
  framework: string
): Promise<void> {
  let content = await fs.readFile(configPath, 'utf8');

  // Create shared entries (CommonJS format)
  const sharedEntries = libNames
    .map((lib) => {
      if (framework === 'react' && lib.includes('react')) {
        return `    '${lib}': { singleton: true, requiredVersion: false }`;
      }
      return `    '${lib}': { singleton: false }`;
    })
    .join(',\n');

  // Similar logic to TS version
  if (content.includes('shared: {')) {
    const sharedPattern = /(shared:\s*\{[^}]*)(})/s;
    if (sharedPattern.test(content)) {
      content = content.replace(sharedPattern, (match, prefix, suffix) => {
        const needsComma = prefix.trim().endsWith('{') ? '' : ',\n';
        return `${prefix}${needsComma}${sharedEntries}\n  ${suffix}`;
      });
    }
  }

  await fs.writeFile(configPath, content, 'utf8');
  console.log(
    chalk.green(
      `  ✓ Configured ${libNames.length} shared UI lib(s) in CommonJS config`
    )
  );
}

/**
 * Get popular UI library suggestions based on framework
 */
export function getUILibrarySuggestions(
  framework: string
): Array<{ name: string; value: string }> {
  const suggestions: Record<string, Array<{ name: string; value: string }>> = {
    react: [
      {
        name: '@nashtech-garage/headless-ui (v0.0.1)',
        value: '@nashtech-garage/headless-ui@^0.0.1',
      },
      { name: '@radix-ui/themes (v3.0.0)', value: '@radix-ui/themes@^3.0.0' },
      { name: 'antd (v5.0.0)', value: 'antd@^5.0.0' },
      { name: 'shadcn/ui components', value: '@radix-ui/react-select@^2.0.0' },
      { name: 'Material-UI (MUI)', value: '@mui/material@^5.0.0' },
      { name: 'Chakra UI', value: '@chakra-ui/react@^2.0.0' },
    ],
    angular: [
      {
        name: '@angular/material (v17.0.0)',
        value: '@angular/material@^17.0.0',
      },
      { name: 'PrimeNG', value: 'primeng@^17.0.0' },
      { name: 'NG-ZORRO (Ant Design)', value: 'ng-zorro-antd@^17.0.0' },
    ],
    vue: [
      { name: 'Element Plus', value: 'element-plus@^2.0.0' },
      { name: 'Vuetify', value: 'vuetify@^3.0.0' },
      { name: 'Ant Design Vue', value: 'ant-design-vue@^4.0.0' },
      { name: 'PrimeVue', value: 'primevue@^3.0.0' },
    ],
  };

  return suggestions[framework] || [];
}
