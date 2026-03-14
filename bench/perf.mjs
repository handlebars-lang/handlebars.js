import { execSync } from 'node:child_process';
import { Bench } from 'tinybench';
import Handlebars from '../lib/index.js';
import { templates } from './templates.mjs';
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

  allSections.push(
    await runSection('COMPILATION (Handlebars.compile)', (bench) => {
      for (const [name, def] of Object.entries(templates)) {
        bench.add(`compile: ${name}`, () => {
          Handlebars.create().compile(def.template);
        });
      }
    })
  );

  allSections.push(
    await runSection('EXECUTION (template rendering)', (bench) => {
      for (const [name, def] of Object.entries(templates)) {
        const compiled = createEnv(def).compile(def.template);
        bench.add(`exec: ${name}`, () => {
          compiled(def.context);
        });
      }
    })
  );

  allSections.push(
    await runSection('PRECOMPILATION (Handlebars.precompile)', (bench) => {
      for (const [name, def] of Object.entries(templates)) {
        bench.add(`precompile: ${name}`, () => {
          Handlebars.precompile(def.template);
        });
      }
    })
  );

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

  allSections.push(
    await runSection('COMPILE OPTIONS COMPARISON', (bench) => {
      const src = templates['complex (if/each/helpers)'].template;
      const ctx = templates['complex (if/each/helpers)'].context;

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
