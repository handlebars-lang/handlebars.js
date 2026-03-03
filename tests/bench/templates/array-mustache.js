module.exports = {
  context: {
    names: [
      { name: 'Moe' },
      { name: 'Larry' },
      { name: 'Curly' },
      { name: 'Shemp' },
    ],
  },
  handlebars: '{{#names}}{{name}}{{/names}}',
};
