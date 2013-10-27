describe('whitespace control', function() {
  it('should strip whitespace around mustache calls', function() {
    var hash = {foo: 'bar<'};

    shouldCompileTo(' {{~foo~}} ', hash, 'bar&lt;');
    shouldCompileTo(' {{~foo}} ', hash, 'bar&lt; ');
    shouldCompileTo(' {{foo~}} ', hash, ' bar&lt;');

    shouldCompileTo(' {{~&foo~}} ', hash, 'bar<');
    shouldCompileTo(' {{~{foo}~}} ', hash, 'bar<');
  });

  describe('blocks', function() {
    it('should strip whitespace around simple block calls', function() {
      var hash = {foo: 'bar<'};

      shouldCompileTo(' {{~#if foo~}} bar {{~/if~}} ', hash, 'bar');
      shouldCompileTo(' {{#if foo~}} bar {{/if~}} ', hash, ' bar ');
      shouldCompileTo(' {{~#if foo}} bar {{~/if}} ', hash, ' bar ');
      shouldCompileTo(' {{#if foo}} bar {{/if}} ', hash, '  bar  ');
    });
    it('should strip whitespace around inverse block calls', function() {
      var hash = {};

      shouldCompileTo(' {{~^if foo~}} bar {{~/if~}} ', hash, 'bar');
      shouldCompileTo(' {{^if foo~}} bar {{/if~}} ', hash, ' bar ');
      shouldCompileTo(' {{~^if foo}} bar {{~/if}} ', hash, ' bar ');
      shouldCompileTo(' {{^if foo}} bar {{/if}} ', hash, '  bar  ');
    });
    it('should strip whitespace around complex block calls', function() {
      var hash = {foo: 'bar<'};

      shouldCompileTo('{{#if foo~}} bar {{~^~}} baz {{~/if}}', hash, 'bar');
      shouldCompileTo('{{#if foo~}} bar {{^~}} baz {{/if}}', hash, 'bar ');
      shouldCompileTo('{{#if foo}} bar {{~^~}} baz {{~/if}}', hash, ' bar');
      shouldCompileTo('{{#if foo}} bar {{^~}} baz {{/if}}', hash, ' bar ');

      shouldCompileTo('{{#if foo~}} bar {{~else~}} baz {{~/if}}', hash, 'bar');

      hash = {};

      shouldCompileTo('{{#if foo~}} bar {{~^~}} baz {{~/if}}', hash, 'baz');
      shouldCompileTo('{{#if foo}} bar {{~^~}} baz {{/if}}', hash, 'baz ');
      shouldCompileTo('{{#if foo~}} bar {{~^}} baz {{~/if}}', hash, ' baz');
      shouldCompileTo('{{#if foo~}} bar {{~^}} baz {{/if}}', hash, ' baz ');

      shouldCompileTo('{{#if foo~}} bar {{~else~}} baz {{~/if}}', hash, 'baz');
    });
  });

  it('should strip whitespace around partials', function() {
    shouldCompileToWithPartials('foo {{~> dude~}} ', [{}, {}, {dude: 'bar'}], true, 'foobar');
    shouldCompileToWithPartials('foo {{> dude~}} ', [{}, {}, {dude: 'bar'}], true, 'foo bar');
    shouldCompileToWithPartials('foo {{> dude}} ', [{}, {}, {dude: 'bar'}], true, 'foo bar ');
  });

  it('should only strip whitespace once', function() {
    var hash = {foo: 'bar'};

    shouldCompileTo(' {{~foo~}} {{foo}} {{foo}} ', hash, 'barbar bar ');
  });
});
