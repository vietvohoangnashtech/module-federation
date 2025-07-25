import {themeTokens} from 'mf_shared_lib/theme/tokens';

export function applyTheme() {
  const root = document.documentElement;
  if (!root) {
    return;
  }

  const isDarkMode =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  root.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');

  const currentPalette = isDarkMode
    ? themeTokens.palette.dark
    : themeTokens.palette.light;

  Object.keys(currentPalette).forEach((key) => {
    const varName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

    root.style.setProperty(
      varName,
      currentPalette[key as keyof typeof currentPalette]
    );
  });

  // Helper function to convert a color string to its RGB components
  const getRgbComponents = (color: string): string => {
    // If it's a CSS variable, resolve it from the currentPalette
    if (color.startsWith('var(')) {
      const varName = color.substring(4, color.length - 1); // e.g., --purple-500
      const tokenKey = varName
        .substring(2)
        .replace(/-([a-z])/g, (g) => g[1].toUpperCase()); // e.g., purple500
      if (tokenKey in currentPalette) {
        color = currentPalette[tokenKey as keyof typeof currentPalette];
      } else {
        // Also check semantic tokens if it's a semantic var
        const semanticTokenKey = varName.substring(2); // e.g., text-color
        if (semanticTokenKey in themeTokens.semantic) {
          color =
            themeTokens.semantic[
              semanticTokenKey as keyof typeof themeTokens.semantic
            ];
          // If it's a semantic token that itself is a var, recursively resolve
          if (color.startsWith('var(')) {
            return getRgbComponents(color);
          }
        }
      }
    }

    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }

    const rgbMatch = color.match(/rgba?(\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\))/);
    if (rgbMatch) {
      return `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`;
    }

    const fromMatch = color.match(
      /rgb\(from\s+#([0-9a-fA-F]{6})\s+r\s+g\s+b\s+\/\s*[\d.]+%?\)/
    );
    if (fromMatch) {
      let hex = fromMatch[1];
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }

    return '';
  };

  Object.keys(currentPalette).forEach((key) => {
    const varName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

    root.style.setProperty(
      varName,
      currentPalette[key as keyof typeof currentPalette]
    );
  });

  const bootstrapKeys = [
    'primary',
    'secondary',
    'success',
    'danger',
    'light',
    'dark',
  ];
  Object.keys(themeTokens.semantic).forEach((key) => {
    const varName = bootstrapKeys.includes(key) ? `--bs-${key}` : `--${key}`;
    const colorValue =
      themeTokens.semantic[key as keyof typeof themeTokens.semantic];

    root.style.setProperty(varName, colorValue);

    if (bootstrapKeys.includes(key)) {
      const rgbComponents = getRgbComponents(colorValue);
      if (rgbComponents) {
        root.style.setProperty(`--bs-${key}-rgb`, rgbComponents);
      }
    }
  });

  root.style.setProperty('font-family', themeTokens.fonts.body);
  document.body.style.setProperty(
    'background-color',
    'var(--background-color)'
  );
  root.style.setProperty('font-size', themeTokens.base.fontSize);
  root.style.setProperty('line-height', themeTokens.base.lineHeight);
  root.style.setProperty('--bs-body-color', 'var(--text-color)');

  Object.keys(themeTokens.borderRadius).forEach((key) => {
    const varName = `--bs-border-radius-${key
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()}`;
    root.style.setProperty(
      varName,
      themeTokens.borderRadius[key as keyof typeof themeTokens.borderRadius]
    );
  });
  root.style.setProperty('--bs-border-radius', themeTokens.borderRadius.md); // Keep for backward compatibility if needed
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      applyTheme();
    });
}
