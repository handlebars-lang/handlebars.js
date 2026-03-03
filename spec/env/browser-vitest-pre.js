// Pre-setup for browser tests. Must run before the main setup file
// imports the Handlebars library, so that noConflict() captures this value.
globalThis.Handlebars = 'no-conflict';

// Polyfill Node.js 'global' for specs that reference it at module level
globalThis.global = globalThis;
