import { writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { Bench } from 'tinybench';
import Handlebars from '../lib/index.js';

// ─── Configuration ───────────────────────────────────────────────────────────

const WARMUP_RUNS = 500;
const MIN_ITERATIONS = 5000;
const BENCH_TIME_MS = 3000;

// ─── CLI Args ────────────────────────────────────────────────────────────────

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
}

const args = process.argv.slice(2);
const labelIdx = args.indexOf('--label');
const label = labelIdx !== -1 ? args[labelIdx + 1] : getGitBranch();

// ─── Template Definitions ────────────────────────────────────────────────────

const templates = {
  // --- Small templates ---
  'static string (no expressions)': {
    template: 'Hello world',
    context: {},
  },
  'simple variables': {
    template: 'Hello {{name}}! You have {{count}} new messages.',
    context: { name: 'Mick', count: 30 },
  },
  'dot paths': {
    template:
      '{{person.name.bar.baz}}{{person.age}}{{person.foo}}{{animal.age}}',
    context: { person: { name: { bar: { baz: 'Larry' } }, age: 45 } },
  },
  'with helper': {
    template: '{{#with person}}{{name}}{{age}}{{/with}}',
    context: { person: { name: 'Larry', age: 45 } },
  },

  // --- Medium templates ---
  'each (small array, 4 items)': {
    template: '{{#each names}}{{name}}{{/each}}',
    context: {
      names: [
        { name: 'Moe' },
        { name: 'Larry' },
        { name: 'Curly' },
        { name: 'Shemp' },
      ],
    },
  },
  'each with @index/@key': {
    template: '{{#each names}}{{@index}}:{{name}} {{/each}}',
    context: {
      names: [
        { name: 'Moe' },
        { name: 'Larry' },
        { name: 'Curly' },
        { name: 'Shemp' },
      ],
    },
  },
  'if/else conditional': {
    template:
      '{{#if active}}<span class="active">{{name}}</span>{{else}}<span>{{name}}</span>{{/if}}',
    context: { active: true, name: 'Widget' },
  },
  'partial (each + partial)': {
    template: '{{#each peeps}}{{>variables}}{{/each}}',
    context: {
      peeps: [
        { name: 'Moe', count: 15 },
        { name: 'Larry', count: 5 },
        { name: 'Curly', count: 1 },
      ],
    },
    partials: {
      variables: 'Hello {{name}}! You have {{count}} new messages.',
    },
  },
  'nested depth (../../)': {
    template:
      '{{#each names}}{{#each name}}{{../bat}}{{../../foo}}{{/each}}{{/each}}',
    context: {
      names: [
        { bat: 'foo', name: ['Moe'] },
        { bat: 'foo', name: ['Larry'] },
        { bat: 'foo', name: ['Curly'] },
        { bat: 'foo', name: ['Shemp'] },
      ],
      foo: 'bar',
    },
  },
  subexpressions: {
    template: '{{echo (header)}}',
    context: { echo: () => {}, header: () => {} },
    helpers: {
      echo: (value) => 'foo ' + value,
      header: () => 'Colors',
    },
  },

  // --- Complex template ---
  'complex (if/each/helpers)': {
    template: `<h1>{{header}}</h1>
{{#if items}}
  <ul>
    {{#each items}}
      {{#if current}}
        <li><strong>{{name}}</strong></li>
      {{^}}
        <li><a href="{{url}}">{{name}}</a></li>
      {{/if}}
    {{/each}}
  </ul>
{{^}}
  <p>The list is empty.</p>
{{/if}}`,
    context: {
      header() {
        return 'Colors';
      },
      hasItems: true,
      items: [
        { name: 'red', current: true, url: '#Red' },
        { name: 'green', current: false, url: '#Green' },
        { name: 'blue', current: false, url: '#Blue' },
      ],
    },
  },
  'recursive partials': {
    template: '{{name}}{{#each kids}}{{>recursion}}{{/each}}',
    context: {
      name: '1',
      kids: [{ name: '1.1', kids: [{ name: '1.1.1', kids: [] }] }],
    },
    partials: {
      recursion: '{{name}}{{#each kids}}{{>recursion}}{{/each}}',
    },
  },

  // --- Large/stress templates ---
  'each (large array, 100 items)': {
    template:
      '{{#each items}}<div class="item"><h3>{{title}}</h3><p>{{description}}</p><span>{{price}}</span></div>{{/each}}',
    context: {
      items: Array.from({ length: 100 }, (_, i) => ({
        title: `Item ${i}`,
        description: `Description for item ${i} with some longer text to simulate real content`,
        price: `$${(i * 9.99).toFixed(2)}`,
      })),
    },
  },
  'each (large array, 1000 items)': {
    template: '{{#each items}}{{name}} {{/each}}',
    context: {
      items: Array.from({ length: 1000 }, (_, i) => ({ name: `item-${i}` })),
    },
  },
  'deeply nested context (4 levels)': {
    template: `{{#with level1}}
  {{#with level2}}
    {{#each items}}
      {{#if active}}
        {{../../title}}: {{name}} ({{../label}})
      {{/if}}
    {{/each}}
  {{/with}}
{{/with}}`,
    context: {
      level1: {
        title: 'Root',
        level2: {
          label: 'Section',
          items: Array.from({ length: 20 }, (_, i) => ({
            name: `item-${i}`,
            active: i % 2 === 0,
          })),
        },
      },
    },
  },
  'many partials (10 partials)': {
    template: Array.from({ length: 10 }, (_, i) => `{{>partial${i}}}`).join(
      '\n'
    ),
    context: { name: 'World', count: 42 },
    partials: Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [
        `partial${i}`,
        `<section><h2>Section {{name}} #${i}</h2><p>Count: {{count}}</p></section>`,
      ])
    ),
  },
  'page template (mixed features)': {
    template: `<!DOCTYPE html>
<html>
<head><title>{{title}}</title></head>
<body>
  <header>{{>header}}</header>
  <nav>
    <ul>
      {{#each nav}}
        <li{{#if active}} class="active"{{/if}}><a href="{{url}}">{{label}}</a></li>
      {{/each}}
    </ul>
  </nav>
  <main>
    {{#if showBanner}}<div class="banner">{{bannerText}}</div>{{/if}}
    {{#each sections}}
      <section>
        <h2>{{title}}</h2>
        {{#each items}}
          <div class="card">
            <h3>{{name}}</h3>
            <p>{{description}}</p>
            {{#if featured}}<span class="badge">Featured</span>{{/if}}
          </div>
        {{/each}}
      </section>
    {{/each}}
  </main>
  <footer>{{>footer}}</footer>
</body>
</html>`,
    context: {
      title: 'My Page',
      showBanner: true,
      bannerText: 'Welcome!',
      nav: [
        { label: 'Home', url: '/', active: true },
        { label: 'About', url: '/about', active: false },
        { label: 'Contact', url: '/contact', active: false },
      ],
      sections: Array.from({ length: 5 }, (_, si) => ({
        title: `Section ${si + 1}`,
        items: Array.from({ length: 8 }, (_, ii) => ({
          name: `Card ${si * 8 + ii + 1}`,
          description: `Description for card ${si * 8 + ii + 1}`,
          featured: ii === 0,
        })),
      })),
    },
    partials: {
      header: '<h1>{{title}}</h1>',
      footer: '<p>&copy; 2026 {{title}}</p>',
    },
  },
};

// ─── Formatting Helpers ──────────────────────────────────────────────────────

function formatNs(ns) {
  if (ns < 1000) return `${ns.toFixed(0)}ns`;
  if (ns < 1_000_000) return `${(ns / 1000).toFixed(2)}µs`;
  return `${(ns / 1_000_000).toFixed(2)}ms`;
}

function formatOps(ops) {
  if (ops >= 1_000_000) return `${(ops / 1_000_000).toFixed(2)}M`;
  if (ops >= 1000) return `${(ops / 1000).toFixed(2)}K`;
  return ops.toFixed(0);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const headerLabel = label ? ` [${label}]` : '';

  console.log(`Handlebars Performance Benchmark${headerLabel}`);
  console.log('================================');
  console.log(
    `tinybench | warmup: ${WARMUP_RUNS} | minIterations: ${MIN_ITERATIONS} | time: ${BENCH_TIME_MS}ms per bench`
  );
  console.log(`Node ${process.version} | ${process.platform} ${process.arch}`);
  console.log();

  const allSections = [];

  // ── Compilation benchmarks ───────────────────────────────────────────────

  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  COMPILATION BENCHMARKS (Handlebars.compile)            │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log();

  const compileBench = new Bench({
    warmupIterations: WARMUP_RUNS,
    iterations: MIN_ITERATIONS,
    time: BENCH_TIME_MS,
  });

  for (const [name, def] of Object.entries(templates)) {
    compileBench.add(`compile: ${name}`, () => {
      // Use create() each time to avoid compile cache hits
      Handlebars.create().compile(def.template);
    });
  }

  await compileBench.run();
  allSections.push({
    title: 'Compilation (Handlebars.compile)',
    bench: compileBench,
  });
  printResults(compileBench);

  // ── Execution benchmarks ─────────────────────────────────────────────────

  console.log();
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  EXECUTION BENCHMARKS (template rendering)              │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log();

  const execBench = new Bench({
    warmupIterations: WARMUP_RUNS,
    iterations: MIN_ITERATIONS,
    time: BENCH_TIME_MS,
  });

  for (const [name, def] of Object.entries(templates)) {
    const hb = Handlebars.create();
    if (def.helpers) {
      hb.registerHelper(def.helpers);
    }
    if (def.partials) {
      for (const [pName, pTpl] of Object.entries(def.partials)) {
        hb.registerPartial(pName, pTpl);
      }
    }
    const compiled = hb.compile(def.template);

    execBench.add(`exec: ${name}`, () => {
      compiled(def.context);
    });
  }

  await execBench.run();
  allSections.push({
    title: 'Execution (template rendering)',
    bench: execBench,
  });
  printResults(execBench);

  // ── Precompilation benchmarks ────────────────────────────────────────────

  console.log();
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  PRECOMPILATION BENCHMARKS (Handlebars.precompile)      │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log();

  const precompileBench = new Bench({
    warmupIterations: WARMUP_RUNS,
    iterations: MIN_ITERATIONS,
    time: BENCH_TIME_MS,
  });

  for (const [name, def] of Object.entries(templates)) {
    precompileBench.add(`precompile: ${name}`, () => {
      Handlebars.precompile(def.template);
    });
  }

  await precompileBench.run();
  allSections.push({
    title: 'Precompilation (Handlebars.precompile)',
    bench: precompileBench,
  });
  printResults(precompileBench);

  // ── Compile + execute combined ───────────────────────────────────────────

  console.log();
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  END-TO-END BENCHMARKS (compile + render)               │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log();

  const e2eBench = new Bench({
    warmupIterations: WARMUP_RUNS,
    iterations: MIN_ITERATIONS,
    time: BENCH_TIME_MS,
  });

  for (const [name, def] of Object.entries(templates)) {
    const hb = Handlebars.create();
    if (def.helpers) {
      hb.registerHelper(def.helpers);
    }
    if (def.partials) {
      for (const [pName, pTpl] of Object.entries(def.partials)) {
        hb.registerPartial(pName, pTpl);
      }
    }

    e2eBench.add(`e2e: ${name}`, () => {
      const fn = hb.compile(def.template);
      fn(def.context);
    });
  }

  await e2eBench.run();
  allSections.push({ title: 'End-to-End (compile + render)', bench: e2eBench });
  printResults(e2eBench);

  // ── Compile options comparison ───────────────────────────────────────────

  console.log();
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  COMPILE OPTIONS COMPARISON                             │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log();

  const optsBench = new Bench({
    warmupIterations: WARMUP_RUNS,
    iterations: MIN_ITERATIONS,
    time: BENCH_TIME_MS,
  });

  const mediumTemplate = templates['complex (if/each/helpers)'];
  const mediumCtx = mediumTemplate.context;
  const mediumSrc = mediumTemplate.template;

  const defaultFn = Handlebars.compile(mediumSrc);
  optsBench.add('exec: default options', () => {
    defaultFn(mediumCtx);
  });

  const noEscapeFn = Handlebars.compile(mediumSrc, { noEscape: true });
  optsBench.add('exec: noEscape=true', () => {
    noEscapeFn(mediumCtx);
  });

  const strictFn = Handlebars.compile(mediumSrc, {
    strict: true,
    assumeObjects: true,
  });
  optsBench.add('exec: strict + assumeObjects', () => {
    strictFn(mediumCtx);
  });

  const knownFn = Handlebars.compile(mediumSrc, {
    knownHelpers: { if: true, each: true },
    knownHelpersOnly: false,
  });
  optsBench.add('exec: knownHelpers', () => {
    knownFn(mediumCtx);
  });

  await optsBench.run();
  allSections.push({ title: 'Compile Options Comparison', bench: optsBench });
  printResults(optsBench);

  // ── Write markdown report ────────────────────────────────────────────────

  const resultsDir = join(import.meta.dirname, 'results');
  mkdirSync(resultsDir, { recursive: true });

  const labelSlug = label ? `-${label.replace(/[^a-zA-Z0-9-_]/g, '_')}` : '';
  const filename = `bench-${timestamp}${labelSlug}.md`;
  const filepath = join(resultsDir, filename);

  const md = buildMarkdown(allSections, now);
  writeFileSync(filepath, md);
  console.log();
  console.log(`Results saved to: ${filepath}`);
}

function printResults(bench) {
  const results = bench.tasks
    .filter((task) => {
      if (!task.result || task.result.state !== 'completed') {
        console.error(
          `  FAILED: ${task.name}`,
          task.result?.error || 'no result'
        );
        return false;
      }
      return true;
    })
    .map((task) => {
      const { latency, throughput } = task.result;
      // tinybench latency is in milliseconds, convert to ns for display
      const toNs = (ms) => ms * 1_000_000;
      return {
        Name: task.name,
        'ops/sec': formatOps(throughput.mean),
        avg: formatNs(toNs(latency.mean)),
        p50: formatNs(toNs(latency.p50)),
        p75: formatNs(toNs(latency.p75)),
        p99: formatNs(toNs(latency.p99)),
        '±%': latency.rme.toFixed(2),
        samples: latency.samplesCount,
      };
    });

  console.table(results);
}

function benchToRows(bench) {
  return bench.tasks
    .filter((t) => t.result?.state === 'completed')
    .map((task) => {
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
    });
}

function buildMarkdown(sections, date) {
  const lines = [];
  const labelStr = label ? ` [${label}]` : '';
  lines.push(`# Handlebars Benchmark Results${labelStr}`);
  lines.push('');
  lines.push(`- **Date:** ${date.toISOString()}`);
  if (label) lines.push(`- **Label:** ${label}`);
  lines.push(`- **Node:** ${process.version}`);
  lines.push(`- **Platform:** ${process.platform} ${process.arch}`);
  lines.push(
    `- **Config:** warmup=${WARMUP_RUNS}, minIterations=${MIN_ITERATIONS}, time=${BENCH_TIME_MS}ms`
  );
  lines.push('');

  for (const { title, bench } of sections) {
    lines.push(`## ${title}`);
    lines.push('');
    lines.push(
      '| Benchmark | ops/sec | avg | p50 | p75 | p99 | ±% | samples |'
    );
    lines.push('|---|---|---|---|---|---|---|---|');
    for (const row of benchToRows(bench)) {
      lines.push(
        `| ${row.name} | ${row.opsSec} | ${row.avg} | ${row.p50} | ${row.p75} | ${row.p99} | ${row.rme} | ${row.samples} |`
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
