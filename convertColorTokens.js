const fs = require('fs');
const path = require('path');

/**
 * Converts color tokens JSON to CSS variables for light and dark modes
 */
function convertColorTokensToCss() {
  // Read the color tokens file
  const tokensPath = path.join(__dirname, 'color token.json');
  const colorTokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

  // Create a flat map of all token references for easy resolution
  const tokenMap = new Map();

  function flattenTokens(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const tokenName = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        tokenMap.set(tokenName, value);
      } else if (typeof value === 'object' && value !== null) {
        flattenTokens(value, tokenName);
      }
    }
  }

  flattenTokens(colorTokens.color);

  /**
   * Resolve token references recursively
   * e.g., "{color.palette.primary.80}" -> actual color value
   */
  function resolveToken(value) {
    if (typeof value !== 'string') return value;

    // Match pattern {color.X.Y.Z}
    const tokenRegex = /\{color\.([^}]+)\}/g;

    return value.replace(tokenRegex, (match, tokenPath) => {
      const resolvedValue = tokenMap.get(tokenPath);
      if (!resolvedValue) {
        console.warn(`Warning: Token "${tokenPath}" not found`);
        return match;
      }
      return resolveToken(resolvedValue);
    });
  }

  // Generate CSS for light mode
  let lightCss = ':root {\n';
  const lightRoles = colorTokens.color.role.light;

  for (const [roleName, roleValue] of Object.entries(lightRoles)) {
    const resolvedValue = resolveToken(roleValue);
    lightCss += `  --color-${roleName}: ${resolvedValue};\n`;
  }

  lightCss += '}\n\n';

  // Generate CSS for dark mode
  let darkCss = '[data-theme="dark"] {\n';
  const darkRoles = colorTokens.color.role.dark;

  for (const [roleName, roleValue] of Object.entries(darkRoles)) {
    const resolvedValue = resolveToken(roleValue);
    darkCss += `  --color-${roleName}: ${resolvedValue};\n`;
  }

  darkCss += '}\n';

  // Combine CSS
  const fullCss = lightCss + darkCss;

  // Write to CSS file
  const outputPath = path.join(__dirname, 'color-tokens.css');
  fs.writeFileSync(outputPath, fullCss);

  console.log(`✓ CSS variables generated successfully!`);
  console.log(`✓ Output written to: ${outputPath}`);
  console.log(`✓ Total variables: ${Object.keys(lightRoles).length} per mode`);
}

// Run the converter
convertColorTokensToCss();
