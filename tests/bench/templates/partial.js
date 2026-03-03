module.exports = {
  context: {
    peeps: [
      { name: 'Moe', count: 15 },
      { name: 'Larry', count: 5 },
      { name: 'Curly', count: 1 },
    ],
  },
  partials: {
    mustache: { variables: 'Hello {{name}}! You have {{count}} new messages.' },
    handlebars: {
      variables: 'Hello {{name}}! You have {{count}} new messages.',
    },
  },

  handlebars: '{{#each peeps}}{{>variables}}{{/each}}',
  dust: '{#peeps}{>variables/}{/peeps}',
  mustache: '{{#peeps}}{{>variables}}{{/peeps}}',
};
