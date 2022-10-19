#!/usr/bin/env node

const yargs = require('yargs')
  .usage('Precompile handlebar templates.\nUsage: $0 [template|directory]...')
  .option('f', {
    type: 'string',
    description: 'Output File',
    alias: 'output',
  })
  .option('map', {
    type: 'string',
    description: 'Source Map File',
  })
  .option('a', {
    type: 'boolean',
    description: 'Exports amd style (require.js)',
    alias: 'amd',
  })
  .option('c', {
    type: 'string',
    description: 'Exports CommonJS style, path to Handlebars module',
    alias: 'commonjs',
    default: null,
  })
  .option('h', {
    type: 'string',
    description: 'Path to handlebar.js (only valid for amd-style)',
    alias: 'handlebarPath',
    default: '',
  })
  .option('k', {
    type: 'string',
    description: 'Known helpers',
    alias: 'known',
  })
  .option('o', {
    type: 'boolean',
    description: 'Known helpers only',
    alias: 'knownOnly',
  })
  .option('m', {
    type: 'boolean',
    description: 'Minimize output',
    alias: 'min',
  })
  .option('n', {
    type: 'string',
    description: 'Template namespace',
    alias: 'namespace',
    default: 'Handlebars.templates',
  })
  .option('s', {
    type: 'boolean',
    description: 'Output template function only.',
    alias: 'simple',
  })
  .option('N', {
    type: 'string',
    description:
      'Name of passed string templates. Optional if running in a simple mode. Required when operating on multiple templates.',
    alias: 'name',
  })
  .option('i', {
    type: 'string',
    description:
      'Generates a template from the passed CLI argument.\n"-" is treated as a special value and causes stdin to be read for the template value.',
    alias: 'string',
  })
  .option('r', {
    type: 'string',
    description:
      'Template root. Base value that will be stripped from template names.',
    alias: 'root',
  })
  .option('p', {
    type: 'boolean',
    description: 'Compiling a partial template',
    alias: 'partial',
  })
  .option('d', {
    type: 'boolean',
    description: 'Include data when compiling',
    alias: 'data',
  })
  .option('e', {
    type: 'string',
    description: 'Template extension.',
    alias: 'extension',
    default: 'handlebars',
  })
  .option('b', {
    type: 'boolean',
    description:
      'Removes the BOM (Byte Order Mark) from the beginning of the templates.',
    alias: 'bom',
  })
  .option('v', {
    type: 'boolean',
    description: 'Prints the current compiler version',
    alias: 'version',
  })
  .option('help', {
    type: 'boolean',
    description: 'Outputs this message',
  })
  .wrap(120);

const argv = yargs.argv;
argv.files = argv._;
delete argv._;

const Precompiler = require('../dist/cjs/precompiler');
Precompiler.loadTemplates(argv, function (err, opts) {
  if (err) {
    throw err;
  }

  if (opts.help || (!opts.templates.length && !opts.version)) {
    yargs.showHelp();
  } else {
    Precompiler.cli(opts);
  }
});
