import { execSync } from 'node:child_process';
import { Bench } from 'tinybench';
import Handlebars from '../lib/index.js';
import { templates as allTemplates } from './templates.mjs';
import {
  printResults,
  printSectionHeader,
  saveMarkdownReport,
} from './report.mjs';

// ─── Configuration ───────────────────────────────────────────────────────────

const BENCH_CONFIG = {
  warmupIterations: 500,
  iterations: 5000,
  time: 3000,
};

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

const grepIdx = args.indexOf('--grep');
const grepPattern =
  grepIdx !== -1 && args[grepIdx + 1]
    ? new RegExp(args[grepIdx + 1], 'i')
    : null;

// ─── Filter templates ───────────────────────────────────────────────────────

const templates = Object.fromEntries(
  Object.entries(allTemplates).filter(
    ([name]) => !grepPattern || grepPattern.test(name)
  )
);

if (Object.keys(templates).length === 0) {
  console.error(
    `No templates match --grep ${grepPattern}. Available: ${Object.keys(allTemplates).join(', ')}`
  );
  process.exit(1);
}

if (grepPattern) {
  console.log(
    `Filtering templates: ${Object.keys(templates).length}/${Object.keys(allTemplates).length} match /${grepPattern.source}/i`
  );
  console.log();
}

// ─── Bench helpers ───────────────────────────────────────────────────────────

function newBench() {
  return new Bench(BENCH_CONFIG);
}

function createEnv(def) {
  const hb = Handlebars.create();
  if (def.helpers) {
    hb.registerHelper(def.helpers);
  }
  if (def.partials) {
    for (const [name, tpl] of Object.entries(def.partials)) {
      hb.registerPartial(name, tpl);
    }
  }
  return hb;
}

async function runSection(title, setup) {
  printSectionHeader(title);

  const bench = newBench();
  setup(bench);
  await bench.run();
  printResults(bench);
  console.log();

  return { title, bench };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  const now = new Date();
  const headerLabel = label ? ` [${label}]` : '';

  console.log(`Handlebars Performance Benchmark${headerLabel}`);
  console.log('================================');
  console.log(
    `tinybench | warmup: ${BENCH_CONFIG.warmupIterations} | minIterations: ${BENCH_CONFIG.iterations} | time: ${BENCH_CONFIG.time}ms per bench`
  );
  console.log(`Node ${process.version} | ${process.platform} ${process.arch}`);
  console.log();

  const allSections = [];

  // ─── COMPILATION ────────────────────────────────────────────────────────────

  allSections.push(
    await runSection('COMPILATION (Handlebars.compile)', (bench) => {
      for (const [name, def] of Object.entries(templates)) {
        const hb = createEnv(def);
        bench.add(`compile: ${name}`, () => {
          hb.compile(def.template);
        });
      }
    })
  );

  // ─── EXECUTION + output verification ────────────────────────────────────────

  const expectedOutputs = {};

  allSections.push(
    await runSection('EXECUTION (template rendering)', (bench) => {
      for (const [name, def] of Object.entries(templates)) {
        const compiled = createEnv(def).compile(def.template);
        expectedOutputs[name] = compiled(def.context);
        bench.add(`exec: ${name}`, () => {
          compiled(def.context);
        });
      }
    })
  );

  // Verify outputs haven't changed during benchmarking
  let verifyFails = 0;
  for (const [name, def] of Object.entries(templates)) {
    const compiled = createEnv(def).compile(def.template);
    const actual = compiled(def.context);
    if (actual !== expectedOutputs[name]) {
      console.warn(
        `  WARNING: output mismatch for "${name}"\n    expected: ${JSON.stringify(expectedOutputs[name])}\n    actual:   ${JSON.stringify(actual)}`
      );
      verifyFails++;
    }
  }
  if (verifyFails === 0) {
    console.log('Output verification: all templates OK');
  } else {
    console.warn(`Output verification: ${verifyFails} mismatch(es)`);
  }
  console.log();

  // ─── PRECOMPILATION ─────────────────────────────────────────────────────────

  allSections.push(
    await runSection('PRECOMPILATION (Handlebars.precompile)', (bench) => {
      for (const [name, def] of Object.entries(templates)) {
        bench.add(`precompile: ${name}`, () => {
          Handlebars.precompile(def.template);
        });
      }
    })
  );

  // ─── END-TO-END ─────────────────────────────────────────────────────────────

  allSections.push(
    await runSection('END-TO-END (compile + render)', (bench) => {
      for (const [name, def] of Object.entries(templates)) {
        const hb = createEnv(def);
        bench.add(`e2e: ${name}`, () => {
          const fn = hb.compile(def.template);
          fn(def.context);
        });
      }
    })
  );

  // ─── COMPILE OPTIONS ───────────────────────────────────────────────────────

  allSections.push(
    await runSection('COMPILE OPTIONS COMPARISON', (bench) => {
      const src = allTemplates['complex (if/each/helpers)'].template;
      const ctx = allTemplates['complex (if/each/helpers)'].context;

      const defaultFn = Handlebars.compile(src);
      bench.add('exec: default options', () => defaultFn(ctx));

      const noEscapeFn = Handlebars.compile(src, { noEscape: true });
      bench.add('exec: noEscape=true', () => noEscapeFn(ctx));

      const strictFn = Handlebars.compile(src, {
        strict: true,
        assumeObjects: true,
      });
      bench.add('exec: strict + assumeObjects', () => strictFn(ctx));

      const knownFn = Handlebars.compile(src, {
        knownHelpers: { if: true, each: true },
        knownHelpersOnly: false,
      });
      bench.add('exec: knownHelpers', () => knownFn(ctx));

      const compatFn = Handlebars.compile(src, { compat: true });
      bench.add('exec: compat=true', () => compatFn(ctx));

      const noDataFn = Handlebars.compile(src, { data: false });
      bench.add('exec: data=false', () => noDataFn(ctx));
    })
  );

  const filepath = saveMarkdownReport(allSections, {
    label,
    config: BENCH_CONFIG,
    date: now,
  });
  console.log(`Results saved to: ${filepath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
