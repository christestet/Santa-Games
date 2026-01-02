#!/usr/bin/env node

/**
 * Update README.md version badges after npm version bump
 *
 * This script is called after npm version updates package.json
 * It syncs the version number to README.md badges
 *
 * Usage: Called automatically by npm version scripts in package.json
 */

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function updateReadmeVersion() {
  try {
    // Read package.json to get current version
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const version = packageJson.version;

    console.log(`📦 Updating README.md to version ${version}...`);

    // Read README.md
    const readmePath = join(rootDir, 'README.md');
    const readme = await fs.readFile(readmePath, 'utf8');

    // Update version badge (e.g., version-4.6.1-blue)
    const versionBadgeRegex = /version-\d+\.\d+\.\d+-blue/g;
    const dockerTagRegex = /santa-games:\d+\.\d+\.\d+/g;

    const updatedReadme = readme
      .replace(versionBadgeRegex, `version-${version}-blue`)
      .replace(dockerTagRegex, `santa-games:${version}`);

    // Write updated README
    await fs.writeFile(readmePath, updatedReadme, 'utf8');

    console.log(`✅ README.md updated successfully!`);
    console.log(`   - Version badge: version-${version}-blue`);
    console.log(`   - Docker tag: santa-games:${version}`);

  } catch (error) {
    console.error('❌ Error updating README.md:', error.message);
    process.exit(1);
  }
}

updateReadmeVersion();
