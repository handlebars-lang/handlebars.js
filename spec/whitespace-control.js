describe('whitespace control', function() {
  it('should strip whitespace around mustache calls', function() {
    var hash = { foo: 'bar<' };

    expectTemplate(' {{~foo~}} ')
      .withInput(hash)
      .toCompileTo('bar&lt;');

    expectTemplate(' {{~foo}} ')
      .withInput(hash)
      .toCompileTo('bar&lt; ');

    expectTemplate(' {{foo~}} ')
      .withInput(hash)
      .toCompileTo(' bar&lt;');

    expectTemplate(' {{~&foo~}} ')
      .withInput(hash)
      .toCompileTo('bar<');

    expectTemplate(' {{~{foo}~}} ')
      .withInput(hash)
      .toCompileTo('bar<');

    expectTemplate('1\n{{foo~}} \n\n 23\n{{bar}}4').toCompileTo('1\n23\n4');
  });

  describe('blocks', function() {
    it('should strip whitespace around simple block calls', function() {
      var hash = { foo: 'bar<' };

      expectTemplate(' {{~#if foo~}} bar {{~/if~}} ')
        .withInput(hash)
        .toCompileTo('bar');

      expectTemplate(' {{#if foo~}} bar {{/if~}} ')
        .withInput(hash)
        .toCompileTo(' bar ');

      expectTemplate(' {{~#if foo}} bar {{~/if}} ')
        .withInput(hash)
        .toCompileTo(' bar ');

      expectTemplate(' {{#if foo}} bar {{/if}} ')
        .withInput(hash)
        .toCompileTo('  bar  ');

      expectTemplate(' \n\n{{~#if foo~}} \n\nbar \n\n{{~/if~}}\n\n ')
        .withInput(hash)
        .toCompileTo('bar');

      expectTemplate(' a\n\n{{~#if foo~}} \n\nbar \n\n{{~/if~}}\n\na ')
        .withInput(hash)
        .toCompileTo(' abara ');
    });

    it('should strip whitespace around inverse block calls', function() {
      expectTemplate(' {{~^if foo~}} bar {{~/if~}} ').toCompileTo('bar');

      expectTemplate(' {{^if foo~}} bar {{/if~}} ').toCompileTo(' bar ');

      expectTemplate(' {{~^if foo}} bar {{~/if}} ').toCompileTo(' bar ');

      expectTemplate(' {{^if foo}} bar {{/if}} ').toCompileTo('  bar  ');

      expectTemplate(
        ' \n\n{{~^if foo~}} \n\nbar \n\n{{~/if~}}\n\n '
      ).toCompileTo('bar');
    });

    it('should strip whitespace around complex block calls', function() {
      var hash = { foo: 'bar<' };

      expectTemplate('{{#if foo~}} bar {{~^~}} baz {{~/if}}')
        .withInput(hash)
        .toCompileTo('bar');

      expectTemplate('{{#if foo~}} bar {{^~}} baz {{/if}}')
        .withInput(hash)
        .toCompileTo('bar ');

      expectTemplate('{{#if foo}} bar {{~^~}} baz {{~/if}}')
        .withInput(hash)
        .toCompileTo(' bar');

      expectTemplate('{{#if foo}} bar {{^~}} baz {{/if}}')
        .withInput(hash)
        .toCompileTo(' bar ');

      expectTemplate('{{#if foo~}} bar {{~else~}} baz {{~/if}}')
        .withInput(hash)
        .toCompileTo('bar');

      expectTemplate(
        '\n\n{{~#if foo~}} \n\nbar \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n'
      )
        .withInput(hash)
        .toCompileTo('bar');

      expectTemplate(
        '\n\n{{~#if foo~}} \n\n{{{foo}}} \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n'
      )
        .withInput(hash)
        .toCompileTo('bar<');

      expectTemplate('{{#if foo~}} bar {{~^~}} baz {{~/if}}').toCompileTo(
        'baz'
      );

      expectTemplate('{{#if foo}} bar {{~^~}} baz {{/if}}').toCompileTo('baz ');

      expectTemplate('{{#if foo~}} bar {{~^}} baz {{~/if}}').toCompileTo(
        ' baz'
      );

      expectTemplate('{{#if foo~}} bar {{~^}} baz {{/if}}').toCompileTo(
        ' baz '
      );

      expectTemplate('{{#if foo~}} bar {{~else~}} baz {{~/if}}').toCompileTo(
        'baz'
      );

      expectTemplate(
        '\n\n{{~#if foo~}} \n\nbar \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n'
      ).toCompileTo('baz');
    });
  });

  it('should strip whitespace around partials', function() {
    expectTemplate('foo {{~> dude~}} ')
      .withPartials({ dude: 'bar' })
      .toCompileTo('foobar');

    expectTemplate('foo {{> dude~}} ')
      .withPartials({ dude: 'bar' })
      .toCompileTo('foo bar');

    expectTemplate('foo {{> dude}} ')
      .withPartials({ dude: 'bar' })
      .toCompileTo('foo bar ');

    expectTemplate('foo\n {{~> dude}} ')
      .withPartials({ dude: 'bar' })
      .toCompileTo('foobar');

    expectTemplate('foo\n {{> dude}} ')
      .withPartials({ dude: 'bar' })
      .toCompileTo('foo\n bar');
  });

  it('should only strip whitespace once', function() {
    expectTemplate(' {{~foo~}} {{foo}} {{foo}} ')
      .withInput({ foo: 'bar' })
      .toCompileTo('barbar bar ');
  });

  describe('performance', function() {
    // Each template below takes several seconds to compile, and so exceeds the
    // test timeout, if finding trailing whitespace is not linear in its length.
    var spaces = new Array(100001).join(' '),
      newlines = new Array(100001).join('\n');

    it('should strip whitespace in linear time', function() {
      expectTemplate(spaces + 'x' + spaces + '{{~foo}}')
        .withInput({ foo: 'bar' })
        .toCompileTo(spaces + 'xbar');
    });

    it('should detect standalone lines in linear time', function() {
      expectTemplate(newlines + 'x{{foo}}')
        .withInput({ foo: 'bar' })
        .toCompileTo(newlines + 'xbar');

      expectTemplate('{{foo}}' + newlines + 'x{{foo}}')
        .withInput({ foo: 'bar' })
        .toCompileTo('bar' + newlines + 'xbar');
    });

    it('should find partial indentation in linear time', function() {
      expectTemplate(spaces + 'x\n  {{> dude}}\n')
        .withPartials({ dude: 'bar\n' })
        .toCompileTo(spaces + 'x\n  bar\n');
    });
  });
});
