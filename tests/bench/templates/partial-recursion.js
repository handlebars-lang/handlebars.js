module.exports = {
  context: {
    name: '1',
    kids: [{ name: '1.1', kids: [{ name: '1.1.1', kids: [] }] }],
  },
  partials: {
    mustache: { recursion: '{{name}}{{#kids}}{{>recursion}}{{/kids}}' },
    handlebars: { recursion: '{{name}}{{#each kids}}{{>recursion}}{{/each}}' },
  },
  handlebars: '{{name}}{{#each kids}}{{>recursion}}{{/each}}',
  dust: '{name}{#kids}{>recursion:./}{/kids}',
  mustache: '{{name}}{{#kids}}{{>recursion}}{{/kids}}',
};
