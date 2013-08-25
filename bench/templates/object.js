module.exports = {
  context: { person: { name: "Larry", age: 45 } },
  handlebars: "{{#with person}}{{name}}{{age}}{{/with}}",
  dust: "{#person}{name}{age}{/person}",
  eco: "<%= @person.name %><%= @person.age %>",
  mustache: "{{#person}}{{name}}{{age}}{{/person}}"
};
