module.exports = {
  context: {
    names: [
      { bat: 'foo', name: ['Moe'] },
      { bat: 'foo', name: ['Larry'] },
      { bat: 'foo', name: ['Curly'] },
      { bat: 'foo', name: ['Shemp'] }
    ],
    foo: 'bar'
  },
  handlebars:
    '{{#each names}}{{#each name}}{{../bat}}{{../../foo}}{{/each}}{{/each}}',
  mustache: '{{#names}}{{#name}}{{bat}}{{foo}}{{/name}}{{/names}}',
  eco:
    '<% for item in @names: %><% for child in item.name: %><%= item.bat %><%= @foo %><% end %><% end %>'
};
