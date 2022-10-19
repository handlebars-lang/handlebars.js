try {
  if (typeof define !== 'function' || !define.amd) {
    var SourceMap = require('source-map'),
      SourceMapConsumer = SourceMap.SourceMapConsumer;
  }
} catch (err) {
  /* NOP for in browser */
}

describe('source-map', function () {
  if (!Handlebars.precompile || !SourceMap) {
    return;
  }

  it('should safely include source map info', function () {
    var template = Handlebars.precompile('{{hello}}', {
      destName: 'dest.js',
      srcName: 'src.hbs',
    });

    equal(!!template.code, true);
    equal(!!template.map, !CompilerContext.browser);
  });
  it('should map source properly', function () {
    var templateSource =
        '  b{{hello}}  \n  {{bar}}a {{#block arg hash=(subex 1 subval)}}{{/block}}',
      template = Handlebars.precompile(templateSource, {
        destName: 'dest.js',
        srcName: 'src.hbs',
      });

    if (template.map) {
      var consumer = new SourceMapConsumer(template.map),
        lines = template.code.split('\n'),
        srcLines = templateSource.split('\n'),
        generated = grepLine('"  b"', lines),
        source = grepLine('  b', srcLines);

      var mapped = consumer.originalPositionFor(generated);
      equal(mapped.line, source.line);
      equal(mapped.column, source.column);
    }
  });
});

function grepLine(token, lines) {
  for (var i = 0; i < lines.length; i++) {
    var column = lines[i].indexOf(token);
    if (column >= 0) {
      return {
        line: i + 1,
        column: column,
      };
    }
  }
}
