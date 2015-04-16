describe('whitespace control', function() {
  it('should strip whitespace around mustache calls', function() {
    var hash = {foo: 'bar<'};

    shouldCompileTo(' {{~foo~}} ', hash, 'bar&lt;');
    shouldCompileTo(' {{~foo}} ', hash, 'bar&lt; ');
    shouldCompileTo(' {{foo~}} ', hash, ' bar&lt;');

    shouldCompileTo(' {{~&foo~}} ', hash, 'bar<');
    shouldCompileTo(' {{~{foo}~}} ', hash, 'bar<');

    shouldCompileTo('1\n{{foo~}} \n\n 23\n{{bar}}4', {}, '1\n23\n4');
  });

  describe('blocks', function() {
    it('should strip whitespace around simple block calls', function() {
      var hash = {foo: 'bar<'};

      shouldCompileTo(' {{~#if foo~}} bar {{~/if~}} ', hash, 'bar');
      shouldCompileTo(' {{#if foo~}} bar {{/if~}} ', hash, ' bar ');
      shouldCompileTo(' {{~#if foo}} bar {{~/if}} ', hash, ' bar ');
      shouldCompileTo(' {{#if foo}} bar {{/if}} ', hash, '  bar  ');

      shouldCompileTo(' \n\n{{~#if foo~}} \n\nbar \n\n{{~/if~}}\n\n ', hash, 'bar');
      shouldCompileTo(' a\n\n{{~#if foo~}} \n\nbar \n\n{{~/if~}}\n\na ', hash, ' abara ');
    });
    it('should strip whitespace around inverse block calls', function() {
      var hash = {};

      shouldCompileTo(' {{~^if foo~}} bar {{~/if~}} ', hash, 'bar');
      shouldCompileTo(' {{^if foo~}} bar {{/if~}} ', hash, ' bar ');
      shouldCompileTo(' {{~^if foo}} bar {{~/if}} ', hash, ' bar ');
      shouldCompileTo(' {{^if foo}} bar {{/if}} ', hash, '  bar  ');

      shouldCompileTo(' \n\n{{~^if foo~}} \n\nbar \n\n{{~/if~}}\n\n ', hash, 'bar');
    });
    it('should strip whitespace around complex block calls', function() {
      var hash = {foo: 'bar<'};

      shouldCompileTo('{{#if foo~}} bar {{~^~}} baz {{~/if}}', hash, 'bar');
      shouldCompileTo('{{#if foo~}} bar {{^~}} baz {{/if}}', hash, 'bar ');
      shouldCompileTo('{{#if foo}} bar {{~^~}} baz {{~/if}}', hash, ' bar');
      shouldCompileTo('{{#if foo}} bar {{^~}} baz {{/if}}', hash, ' bar ');

      shouldCompileTo('{{#if foo~}} bar {{~else~}} baz {{~/if}}', hash, 'bar');

      shouldCompileTo('\n\n{{~#if foo~}} \n\nbar \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n', hash, 'bar');
      shouldCompileTo('\n\n{{~#if foo~}} \n\n{{{foo}}} \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n', hash, 'bar<');

      hash = {};

      shouldCompileTo('{{#if foo~}} bar {{~^~}} baz {{~/if}}', hash, 'baz');
      shouldCompileTo('{{#if foo}} bar {{~^~}} baz {{/if}}', hash, 'baz ');
      shouldCompileTo('{{#if foo~}} bar {{~^}} baz {{~/if}}', hash, ' baz');
      shouldCompileTo('{{#if foo~}} bar {{~^}} baz {{/if}}', hash, ' baz ');

      shouldCompileTo('{{#if foo~}} bar {{~else~}} baz {{~/if}}', hash, 'baz');

      shouldCompileTo('\n\n{{~#if foo~}} \n\nbar \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n', hash, 'baz');
    });
  });

  it('should strip whitespace around partials', function() {
    shouldCompileToWithPartials('foo {{~> dude~}} ', [{}, {}, {dude: 'bar'}], true, 'foobar');
    shouldCompileToWithPartials('foo {{> dude~}} ', [{}, {}, {dude: 'bar'}], true, 'foo bar');
    shouldCompileToWithPartials('foo {{> dude}} ', [{}, {}, {dude: 'bar'}], true, 'foo bar ');

    shouldCompileToWithPartials('foo\n {{~> dude}} ', [{}, {}, {dude: 'bar'}], true, 'foobar');
    shouldCompileToWithPartials('foo\n {{> dude}} ', [{}, {}, {dude: 'bar'}], true, 'foo\n bar');
  });

  it('should only strip whitespace once', function() {
    var hash = {foo: 'bar'};

    shouldCompileTo(' {{~foo~}} {{foo}} {{foo}} ', hash, 'barbar bar ');
  });
});
