module.exports = {
  context: { person: { name: "Larry", age: 45 } },
  handlebars: "{{person.name}}{{person.age}}{{person.foo}}{{animal.age}}",
  dust: "{person.name}{person.age}{person.foo}{animal.age}",
  eco: "<%= @person.name %><%= @person.age %><%= @person.foo %><% if @animal: %><%= @animal.age %><% end %>",
  mustache: "{{person.name}}{{person.age}}{{person.foo}}{{animal.age}}"
};
