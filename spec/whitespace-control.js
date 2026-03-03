describe('whitespace control', function () {
  it('should strip whitespace around mustache calls', function () {
    var hash = { foo: 'bar<' };

    expectTemplate(' {{~foo~}} ').withInput(hash).toCompileTo('bar&lt;');

    expectTemplate(' {{~foo}} ').withInput(hash).toCompileTo('bar&lt; ');

    expectTemplate(' {{foo~}} ').withInput(hash).toCompileTo(' bar&lt;');

    expectTemplate(' {{~&foo~}} ').withInput(hash).toCompileTo('bar<');

    expectTemplate(' {{~{foo}~}} ').withInput(hash).toCompileTo('bar<');

    expectTemplate('1\n{{foo~}} \n\n 23\n{{bar}}4').toCompileTo('1\n23\n4');
  });

  describe('blocks', function () {
    it('should strip whitespace around simple block calls', function () {
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

    it('should strip whitespace around inverse block calls', function () {
      expectTemplate(' {{~^if foo~}} bar {{~/if~}} ').toCompileTo('bar');

      expectTemplate(' {{^if foo~}} bar {{/if~}} ').toCompileTo(' bar ');

      expectTemplate(' {{~^if foo}} bar {{~/if}} ').toCompileTo(' bar ');

      expectTemplate(' {{^if foo}} bar {{/if}} ').toCompileTo('  bar  ');

      expectTemplate(
        ' \n\n{{~^if foo~}} \n\nbar \n\n{{~/if~}}\n\n '
      ).toCompileTo('bar');
    });

    it('should strip whitespace around complex block calls', function () {
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

  it('should strip whitespace around partials', function () {
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

  it('should only strip whitespace once', function () {
    expectTemplate(' {{~foo~}} {{foo}} {{foo}} ')
      .withInput({ foo: 'bar' })
      .toCompileTo('barbar bar ');
  });
});
