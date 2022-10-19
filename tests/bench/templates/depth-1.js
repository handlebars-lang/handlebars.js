module.exports = {
  context: {
    names: [
      { name: 'Moe' },
      { name: 'Larry' },
      { name: 'Curly' },
      { name: 'Shemp' },
    ],
    foo: 'bar',
  },
  handlebars: '{{#each names}}{{../foo}}{{/each}}',
  mustache: '{{#names}}{{foo}}{{/names}}',
};
