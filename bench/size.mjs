import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import Handlebars from '../lib/index.js';
import { templates } from './templates.mjs';

const gzipAsync = promisify(gzip);

// ─── Dist sizes ──────────────────────────────────────────────────────────────

async function measureDistSizes() {
  const distDir = join(__dirname, '..', 'dist');
  let files;
  try {
    files = readdirSync(distDir).filter((f) => {
      try {
        return statSync(join(distDir, f)).isFile();
      } catch {
        return false;
      }
    });
  } catch {
    console.warn('dist/ directory not found — run `npm run build` first.');
    return [];
  }

  const results = [];
  for (const file of files) {
    const content = readFileSync(join(distDir, file));
    const gzipped = await gzipAsync(content);
    results.push({
      File: file,
      'Raw (bytes)': content.length,
      'Gzip (bytes)': gzipped.length,
    });
  }
  return results;
}

// ─── Precompile sizes ────────────────────────────────────────────────────────

function measurePrecompileSizes() {
  const results = [];
  for (const [name, def] of Object.entries(templates)) {
    const compiled = Handlebars.precompile(def.template, {});

    const helpers = {};
    if (def.helpers) {
      for (const k of Object.keys(def.helpers)) {
        helpers[k] = true;
      }
    }
    const knownOnly = Handlebars.precompile(def.template, {
      knownHelpersOnly: true,
      knownHelpers: helpers,
    });

    results.push({
      Template: name,
      'Default (chars)': compiled.length,
      'knownHelpersOnly (chars)': knownOnly.length,
      'Saved (chars)': compiled.length - knownOnly.length,
    });
  }
  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('Handlebars Size Report');
  console.log('=====================');
  console.log();

  const distSizes = await measureDistSizes();
  if (distSizes.length > 0) {
    console.log('## Distribution files');
    console.table(distSizes);
    console.log();
  }

  console.log('## Precompiled template sizes');
  const precompileSizes = measurePrecompileSizes();
  console.table(precompileSizes);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
