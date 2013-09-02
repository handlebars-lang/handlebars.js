module.exports = {
  context: { names: [{name: "Moe"}, {name: "Larry"}, {name: "Curly"}, {name: "Shemp"}] },
  handlebars: "{{#each names}}{{@index}}{{name}}{{/each}}"
}
