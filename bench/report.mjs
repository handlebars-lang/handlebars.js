import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatNs(ns) {
  if (ns < 1000) return `${ns.toFixed(0)}ns`;
  if (ns < 1_000_000) return `${(ns / 1000).toFixed(2)}µs`;
  return `${(ns / 1_000_000).toFixed(2)}ms`;
}

export function formatOps(ops) {
  if (ops >= 1_000_000) return `${(ops / 1_000_000).toFixed(2)}M`;
  if (ops >= 1000) return `${(ops / 1000).toFixed(2)}K`;
  return ops.toFixed(0);
}

function taskToRow(task) {
  const { latency, throughput } = task.result;
  const toNs = (ms) => ms * 1_000_000;
  return {
    name: task.name,
    opsSec: formatOps(throughput.mean),
    avg: formatNs(toNs(latency.mean)),
    p50: formatNs(toNs(latency.p50)),
    p75: formatNs(toNs(latency.p75)),
    p99: formatNs(toNs(latency.p99)),
    rme: latency.rme.toFixed(2),
    samples: latency.samplesCount,
  };
}

function completedTasks(bench) {
  return bench.tasks.filter((t) => t.result?.state === 'completed');
}

// ─── Console output ──────────────────────────────────────────────────────────

export function printResults(bench) {
  for (const task of bench.tasks) {
    if (!task.result || task.result.state !== 'completed') {
      console.error(
        `  FAILED: ${task.name}`,
        task.result?.error || 'no result'
      );
    }
  }

  const results = completedTasks(bench).map((task) => {
    const row = taskToRow(task);
    return {
      Name: row.name,
      'ops/sec': row.opsSec,
      avg: row.avg,
      p50: row.p50,
      p75: row.p75,
      p99: row.p99,
      '±%': row.rme,
      samples: row.samples,
    };
  });

  console.table(results);
}

export function printSectionHeader(title) {
  const padded = `  ${title}  `;
  const width = Math.max(padded.length + 4, 59);
  const inner = padded.padEnd(width - 2);
  console.log(`┌${'─'.repeat(width - 2)}┐`);
  console.log(`│${inner}│`);
  console.log(`└${'─'.repeat(width - 2)}┘`);
  console.log();
}

// ─── Markdown report ─────────────────────────────────────────────────────────

export function saveMarkdownReport(sections, { label, config, date }) {
  const resultsDir = join(__dirname, 'results');
  mkdirSync(resultsDir, { recursive: true });

  const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const labelSlug = label ? `-${label.replace(/[^a-zA-Z0-9-_]/g, '_')}` : '';
  const filename = `bench-${timestamp}${labelSlug}.md`;
  const filepath = join(resultsDir, filename);

  const lines = [];
  const labelStr = label ? ` [${label}]` : '';
  lines.push(`# Handlebars Benchmark Results${labelStr}`);
  lines.push('');
  lines.push(`- **Date:** ${date.toISOString()}`);
  if (label) lines.push(`- **Label:** ${label}`);
  lines.push(`- **Node:** ${process.version}`);
  lines.push(`- **Platform:** ${process.platform} ${process.arch}`);
  lines.push(
    `- **Config:** warmup=${config.warmupIterations}, minIterations=${config.iterations}, time=${config.time}ms`
  );
  lines.push('');

  for (const { title, bench } of sections) {
    lines.push(`## ${title}`);
    lines.push('');
    lines.push(
      '| Benchmark | ops/sec | avg | p50 | p75 | p99 | ±% | samples |'
    );
    lines.push('|---|---|---|---|---|---|---|---|');
    for (const row of completedTasks(bench).map(taskToRow)) {
      lines.push(
        `| ${row.name} | ${row.opsSec} | ${row.avg} | ${row.p50} | ${row.p75} | ${row.p99} | ${row.rme} | ${row.samples} |`
      );
    }
    lines.push('');
  }

  writeFileSync(filepath, lines.join('\n'));
  return filepath;
}
