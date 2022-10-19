module.exports = {
  context: {
    names: [
      { name: 'Moe' },
      { name: 'Larry' },
      { name: 'Curly' },
      { name: 'Shemp' },
    ],
  },
  handlebars: '{{#each names}}{{name}}{{/each}}',
  dust: '{#names}{name}{/names}',
  mustache: '{{#names}}{{name}}{{/names}}',
};
