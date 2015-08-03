module.exports = {
  context: { person: { name: {bar: {baz: 'Larry'}}, age: 45 } },
  handlebars: '{{person.name.bar.baz}}{{person.age}}{{person.foo}}{{animal.age}}',
  dust: '{person.name.bar.baz}{person.age}{person.foo}{animal.age}',
  eco: '<%= @person.name.bar.baz %><%= @person.age %><%= @person.foo %><% if @animal: %><%= @animal.age %><% end %>',
  mustache: '{{person.name.bar.baz}}{{person.age}}{{person.foo}}{{animal.age}}'
};
