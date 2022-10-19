module.exports = {
  context: { person: { name: 'Larry', age: 45 } },
  handlebars: '{{#person}}{{name}}{{age}}{{/person}}',
};
