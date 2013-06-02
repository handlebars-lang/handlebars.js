var sourceMap = require('source-map'),
      SourceMapConsumer = sourceMap.SourceMapConsumer;

describe('source-map', function() {
  if (!Handlebars.Parser) {
    return;
  }

  it('returns source map', function() {
    var template = Handlebars.precompile('{{foo}}', {filename: 'foo.handlebars', sourcemap: true});
    (typeof template.template).should.equal('string');
    (typeof template.sourcemap).should.equal('string');
    return;
    var consumer = new SourceMapConsumer(template.sourcemap);
    consumer.eachMapping(function(mapping) {
    }, this, SourceMapConsumer.ORIGINAL_ORDER);
  });
});
