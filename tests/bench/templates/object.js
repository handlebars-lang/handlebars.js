module.exports = {
  context: { person: { name: 'Larry', age: 45 } },
  handlebars: '{{#with person}}{{name}}{{age}}{{/with}}',
  dust: '{#person}{name}{age}{/person}',
  mustache: '{{#person}}{{name}}{{age}}{{/person}}',
};
