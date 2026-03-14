import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

// ─── Resolve files ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let baselinePath, currentPath;

if (args.length >= 2) {
  [baselinePath, currentPath] = args;
} else {
  const resultsDir = join(import.meta.dirname, 'results');
  let files;
  try {
    files = readdirSync(resultsDir)
      .filter((f) => f.endsWith('.md') && f.startsWith('bench-'))
      .map((f) => join(resultsDir, f));
  } catch {
    files = [];
  }

  if (files.length < 2) {
    console.error(
      files.length === 0
        ? 'No benchmark results found in bench/results/.'
        : 'Only one benchmark result found. Run benchmarks on another branch first.'
    );
    console.error('');
    console.error('Usage: node bench/compare.mjs [<baseline.md> <current.md>]');
    console.error('');
    console.error(
      'With no arguments, auto-selects the two most recent results.'
    );
    console.error('A result labelled "main" is always used as the baseline.');
    process.exit(1);
  }

  // Find the "main" labelled file if any
  const mainFile = files.find((f) => {
    const content = readFileSync(f, 'utf8');
    const match = content.match(/^- \*\*Label:\*\* (.+)$/m);
    return match && match[1] === 'main';
  });

  if (mainFile) {
    // Baseline is main, current is the most recent non-main file
    baselinePath = mainFile;
    const others = files
      .filter((f) => f !== mainFile)
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    currentPath = others[0];
  } else {
    // Sort by mtime, older = baseline, newer = current
    files.sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs);
    baselinePath = files[files.length - 2];
    currentPath = files[files.length - 1];
  }

  console.log(`Auto-selected files:`);
  console.log(`  baseline: ${basename(baselinePath)}`);
  console.log(`  current:  ${basename(currentPath)}`);
  console.log();
}

// ─── Parse ───────────────────────────────────────────────────────────────────

function parseOps(str) {
  str = str.trim();
  if (str.endsWith('M')) return parseFloat(str) * 1_000_000;
  if (str.endsWith('K')) return parseFloat(str) * 1_000;
  return parseFloat(str);
}

function parseNs(str) {
  str = str.trim();
  if (str.endsWith('ms')) return parseFloat(str) * 1_000_000;
  if (str.endsWith('µs')) return parseFloat(str) * 1_000;
  if (str.endsWith('ns')) return parseFloat(str);
  return parseFloat(str);
}

function parseReport(filepath) {
  const content = readFileSync(filepath, 'utf8');
  const lines = content.split('\n');

  let label = null;
  const labelMatch = content.match(/^- \*\*Label:\*\* (.+)$/m);
  if (labelMatch) label = labelMatch[1];

  const sections = {};
  let currentSection = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentSection = line.slice(3).trim();
      sections[currentSection] = {};
      continue;
    }

    if (
      !currentSection ||
      !line.startsWith('|') ||
      line.startsWith('|---') ||
      line.startsWith('| Benchmark')
    ) {
      continue;
    }

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 8) continue;

    const [name, opsSec, avg, p50, p75, p99, rme, samples] = cells;
    sections[currentSection][name] = {
      opsSec: parseOps(opsSec),
      avg: parseNs(avg),
      p50: parseNs(p50),
      p75: parseNs(p75),
      p99: parseNs(p99),
      rme: parseFloat(rme),
      samples: parseInt(samples, 10),
    };
  }

  return { label, sections };
}

// ─── Compare ─────────────────────────────────────────────────────────────────

function pctChange(baseline, current) {
  if (baseline === 0) return 0;
  return ((current - baseline) / baseline) * 100;
}

function formatPct(pct) {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatOps(ops) {
  if (ops >= 1_000_000) return `${(ops / 1_000_000).toFixed(2)}M`;
  if (ops >= 1000) return `${(ops / 1000).toFixed(2)}K`;
  return ops.toFixed(0);
}

function indicator(pct, higherIsBetter) {
  const effective = higherIsBetter ? pct : -pct;
  if (effective > 5) return ' !!';
  if (effective > 2) return ' !';
  if (effective < -5) return ' !!';
  if (effective < -2) return ' !';
  return '';
}

// ─── Output ──────────────────────────────────────────────────────────────────

const baseline = parseReport(baselinePath);
const current = parseReport(currentPath);

const baseLabel = baseline.label || 'baseline';
const curLabel = current.label || 'current';

console.log(`Benchmark Comparison: ${baseLabel} vs ${curLabel}`);
console.log('='.repeat(50));
console.log(`Baseline: ${baselinePath}`);
console.log(`Current:  ${currentPath}`);
console.log();
console.log('Legend: ! = >2% change, !! = >5% change');
console.log();

const mdLines = [];
mdLines.push(`# Benchmark Comparison: ${baseLabel} vs ${curLabel}`);
mdLines.push('');
mdLines.push(`- **Baseline:** ${baseLabel} (${baselinePath})`);
mdLines.push(`- **Current:** ${curLabel} (${currentPath})`);
mdLines.push(`- **Legend:** ! = >2% change, !! = >5% change`);
mdLines.push('');

const allSections = new Set([
  ...Object.keys(baseline.sections),
  ...Object.keys(current.sections),
]);

for (const section of allSections) {
  const baseBenches = baseline.sections[section] || {};
  const curBenches = current.sections[section] || {};
  const allNames = new Set([
    ...Object.keys(baseBenches),
    ...Object.keys(curBenches),
  ]);

  if (allNames.size === 0) continue;

  console.log(`## ${section}`);
  console.log();

  const header = `| Benchmark | ${baseLabel} ops/sec | ${curLabel} ops/sec | ops/sec | p75 latency |`;
  const sep = '|---|---|---|---|---|';

  console.log(header);
  console.log(sep);

  mdLines.push(`## ${section}`);
  mdLines.push('');
  mdLines.push(header);
  mdLines.push(sep);

  for (const name of allNames) {
    const b = baseBenches[name];
    const c = curBenches[name];

    if (!b || !c) {
      const row = `| ${name} | ${b ? formatOps(b.opsSec) : 'n/a'} | ${c ? formatOps(c.opsSec) : 'n/a'} | - | - |`;
      console.log(row);
      mdLines.push(row);
      continue;
    }

    const opsPct = pctChange(b.opsSec, c.opsSec);
    const p75Pct = pctChange(b.p75, c.p75);

    const opsStr = `${formatPct(opsPct)}${indicator(opsPct, true)}`;
    const p75Str = `${formatPct(p75Pct)}${indicator(p75Pct, false)}`;

    const row = `| ${name} | ${formatOps(b.opsSec)} | ${formatOps(c.opsSec)} | ${opsStr} | ${p75Str} |`;
    console.log(row);
    mdLines.push(row);
  }

  console.log();
  mdLines.push('');
}

const resultsDir = join(import.meta.dirname, 'results');
const curLabelSlug = curLabel.replace(/[^a-zA-Z0-9-_]/g, '_');
const baseLabelSlug = baseLabel.replace(/[^a-zA-Z0-9-_]/g, '_');
const outPath = join(
  resultsDir,
  `compare-${baseLabelSlug}-vs-${curLabelSlug}.md`
);
writeFileSync(outPath, mdLines.join('\n'));
console.log(`Comparison saved to: ${outPath}`);
