describe('builtin helpers', function() {
  describe('#if', function() {
    it('if', function() {
      var string = '{{#if goodbye}}GOODBYE {{/if}}cruel {{world}}!';
      shouldCompileTo(string, {goodbye: true, world: 'world'}, 'GOODBYE cruel world!',
                      'if with boolean argument shows the contents when true');
      shouldCompileTo(string, {goodbye: 'dummy', world: 'world'}, 'GOODBYE cruel world!',
                      'if with string argument shows the contents');
      shouldCompileTo(string, {goodbye: false, world: 'world'}, 'cruel world!',
                      'if with boolean argument does not show the contents when false');
      shouldCompileTo(string, {world: 'world'}, 'cruel world!',
                      'if with undefined does not show the contents');
      shouldCompileTo(string, {goodbye: ['foo'], world: 'world'}, 'GOODBYE cruel world!',
                      'if with non-empty array shows the contents');
      shouldCompileTo(string, {goodbye: [], world: 'world'}, 'cruel world!',
                      'if with empty array does not show the contents');
      shouldCompileTo(string, {goodbye: 0, world: 'world'}, 'cruel world!',
                      'if with zero does not show the contents');
      shouldCompileTo('{{#if goodbye includeZero=true}}GOODBYE {{/if}}cruel {{world}}!',
                      {goodbye: 0, world: 'world'}, 'GOODBYE cruel world!',
                      'if with zero does not show the contents');
    });

    it('if with function argument', function() {
      var string = '{{#if goodbye}}GOODBYE {{/if}}cruel {{world}}!';
      shouldCompileTo(string, {goodbye: function() {return true; }, world: 'world'}, 'GOODBYE cruel world!',
                      'if with function shows the contents when function returns true');
      shouldCompileTo(string, {goodbye: function() {return this.world; }, world: 'world'}, 'GOODBYE cruel world!',
                      'if with function shows the contents when function returns string');
      shouldCompileTo(string, {goodbye: function() {return false; }, world: 'world'}, 'cruel world!',
                      'if with function does not show the contents when returns false');
      shouldCompileTo(string, {goodbye: function() {return this.foo; }, world: 'world'}, 'cruel world!',
                      'if with function does not show the contents when returns undefined');
    });
  });

  describe('#with', function() {
    it('with', function() {
      var string = '{{#with person}}{{first}} {{last}}{{/with}}';
      shouldCompileTo(string, {person: {first: 'Alan', last: 'Johnson'}}, 'Alan Johnson');
    });
    it('with with function argument', function() {
      var string = '{{#with person}}{{first}} {{last}}{{/with}}';
      shouldCompileTo(string, {person: function() { return {first: 'Alan', last: 'Johnson'}; }}, 'Alan Johnson');
    });
    it('with with else', function() {
      var string = '{{#with person}}Person is present{{else}}Person is not present{{/with}}';
      shouldCompileTo(string, {}, 'Person is not present');
    });
    it('with should change context', function() {
      var string = '{{#with foo}}{{foo}}{{bar}}{{baz}}/{{.}}{{/with}}/{{foo}}{{bar}}{{baz}}';
      shouldCompileTo(string, {foo: 'a', bar: 'b', baz: 'c'}, '/a/abc');
    });
    it('with with block params', function() {
      var string = '{{#with person as |p|}}{{p.first}} {{p.last}}{{/with}}';
      shouldCompileTo(string, {person: {first: 'Alan', last: 'Johnson'}}, 'Alan Johnson');
    });
    it('with with block params should not change context', function() {
      var string = '{{#with foo as |bar|}}{{foo}}{{bar}}{{baz}}/{{.}}{{/with}}/{{foo}}{{bar}}{{baz}}';
      shouldCompileTo(string, {foo: 'a', bar: 'b', baz: 'c', toString: function() { return 'd'; }}, 'aac/d/abc');
    });
    it('with with block params should nest', function() {
      var string = '{{#with foo as |bar|}}{{#with bar as |baz|}}{{foo}}{{bar}}{{baz}}{{/with}}/{{foo}}{{bar}}{{baz}}{{/with}}/{{foo}}{{bar}}{{baz}}';
      shouldCompileTo(string, {foo: 'a'}, 'aaa/aa/a');
    });
  });

  describe('#each', function() {
    beforeEach(function() {
      handlebarsEnv.registerHelper('detectDataInsideEach', function(options) {
        return options.data && options.data.exclaim;
      });
    });

    it('each', function() {
      var string = '{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};
      shouldCompileTo(string, hash, 'goodbye! Goodbye! GOODBYE! cruel world!',
                      'each with array argument iterates over the contents when not empty');
      shouldCompileTo(string, {goodbyes: [], world: 'world'}, 'cruel world!',
                      'each with array argument ignores the contents when empty');
    });

    it('each without data', function() {
      var string = '{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};
      shouldCompileTo(string, [hash,,,, false], 'goodbye! Goodbye! GOODBYE! cruel world!');

      hash = {goodbyes: 'cruel', world: 'world'};
      shouldCompileTo('{{#each .}}{{.}}{{/each}}', [hash,,,, false], 'cruelworld');
    });

    it('each without context', function() {
      var string = '{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!';
      shouldCompileTo(string, [,,,, ], 'cruel !');
    });

    it('each with an object and @key', function() {
      var string = '{{#each goodbyes}}{{@key}}. {{text}}! {{/each}}cruel {{world}}!';

      function Clazz() {
        this['<b>#1</b>'] = {text: 'goodbye'};
        this[2] = {text: 'GOODBYE'};
      }
      Clazz.prototype.foo = 'fail';
      var hash = {goodbyes: new Clazz(), world: 'world'};

      // Object property iteration order is undefined according to ECMA spec,
      // so we need to check both possible orders
      // @see http://stackoverflow.com/questions/280713/elements-order-in-a-for-in-loop
      var actual = compileWithPartials(string, hash);
      var expected1 = '&lt;b&gt;#1&lt;/b&gt;. goodbye! 2. GOODBYE! cruel world!';
      var expected2 = '2. GOODBYE! &lt;b&gt;#1&lt;/b&gt;. goodbye! cruel world!';

      equals(actual === expected1 || actual === expected2, true, 'each with object argument iterates over the contents when not empty');
      shouldCompileTo(string, {goodbyes: {}, world: 'world'}, 'cruel world!');
    });

    it('each with @index', function() {
      var string = '{{#each goodbyes}}{{@index}}. {{text}}! {{/each}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, '0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!', 'The @index variable is used');
    });

    it('each with nested @index', function() {
      var string = '{{#each goodbyes}}{{@index}}. {{text}}! {{#each ../goodbyes}}{{@index}} {{/each}}After {{@index}} {{/each}}{{@index}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, '0. goodbye! 0 1 2 After 0 1. Goodbye! 0 1 2 After 1 2. GOODBYE! 0 1 2 After 2 cruel world!', 'The @index variable is used');
    });

    it('each should change context', function() {
      var string = '{{#each foo}}{{.}}{{bar}}{{@key}} {{@index}} {{@first}} {{@last}} {{baz}}{{/each}}';
      var hash = {foo: ['a', 'b', 'c'], bar: 'd', baz: 'e'};
      shouldCompileTo(string, hash, 'a0 0 true false b1 1 false false c2 2 false true ', 'should change context');
    });

    it('each with block params', function() {
      var string = '{{#each goodbyes as |value index|}}{{index}}. {{value.text}}! {{#each goodbyes as |childValue childIndex|}} {{index}} {{childIndex}}{{/each}} After {{index}} {{/each}}{{index}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}], world: 'world'};
      shouldCompileTo(string, hash, '0. goodbye!  0 0 0 1 After 0 1. Goodbye!  1 0 1 1 After 1 cruel world!', 'should work with block params');
    });

    it('each with block params should not change context', function() {
      var string = '{{#each foo as |bar barKey barIndex barFirst barLast|}}{{.}}{{bar}}{{barKey}} {{barIndex}} {{barFirst}} {{barLast}} {{baz}}{{/each}}';
      var hash = {foo: ['a', 'b', 'c'], bar: 'd', baz: 'e', toString: function() { return 'f'; } };
      shouldCompileTo(string, hash, 'fa0 0 true false efb1 1 false false efc2 2 false true e', 'should not change context when using block params');
    });

    it('each with block params should nest', function() {
      var string = '{{#each foo as |bar|}}{{#each bar as |baz|}}{{baz}}{{/each}}/{{/each}}';
      var hash = {foo: [ ['a', 'b', 'c'], ['d', 'e', 'f'] ] };
      shouldCompileTo(string, hash, 'abc/def/', 'should work with nested block params');
    });

    it('each with empty string property', function() {
      var string = '{{#each obj}}{{.}}({{@key}} {{@index}} {{@first}} {{@last}})/{{/each}}';
      var hash = {obj: {'': 'Please Select', 'selected': 'Selected'} };

      // Object property iteration order is undefined according to ECMA spec,
      // so we need to check both possible orders
      // @see http://stackoverflow.com/questions/280713/elements-order-in-a-for-in-loop
      var actual = compileWithPartials(string, hash);
      equals(actual === 'Please Select( 0 true false)/Selected(selected 1 false true)/' ||
             actual === 'Selected(selected 0 true false)/Please Select( 1 false true)/', true, 'should iterate over empty string property');
    });

    it('each object with @index', function() {
      var string = '{{#each goodbyes}}{{@index}}. {{text}}! {{/each}}cruel {{world}}!';
      var hash = {goodbyes: {'a': {text: 'goodbye'}, b: {text: 'Goodbye'}, c: {text: 'GOODBYE'}}, world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, '0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!', 'The @index variable is used');
    });


    it('each with @first', function() {
      var string = '{{#each goodbyes}}{{#if @first}}{{text}}! {{/if}}{{/each}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, 'goodbye! cruel world!', 'The @first variable is used');
    });

    it('each with nested @first', function() {
      var string = '{{#each goodbyes}}({{#if @first}}{{text}}! {{/if}}{{#each ../goodbyes}}{{#if @first}}{{text}}!{{/if}}{{/each}}{{#if @first}} {{text}}!{{/if}}) {{/each}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, '(goodbye! goodbye! goodbye!) (goodbye!) (goodbye!) cruel world!', 'The @first variable is used');
    });

    it('each object with @first', function() {
      var string = '{{#each goodbyes}}{{#if @first}}{{text}}! {{/if}}{{/each}}cruel {{world}}!';
      var hash = {goodbyes: {'foo': {text: 'goodbye'}, bar: {text: 'Goodbye'}}, world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, 'goodbye! cruel world!', 'The @first variable is used');
    });

    it('each with @last', function() {
      var string = '{{#each goodbyes}}{{#if @last}}{{text}}! {{/if}}{{/each}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, 'GOODBYE! cruel world!', 'The @last variable is used');
    });

    it('each object with @last', function() {
      var string = '{{#each goodbyes}}{{#if @last}}{{text}}! {{/if}}{{/each}}cruel {{world}}!';
      var hash = {goodbyes: {'foo': {text: 'goodbye'}, bar: {text: 'Goodbye'}}, world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, 'Goodbye! cruel world!', 'The @last variable is used');
    });

    it('each with nested @last', function() {
      var string = '{{#each goodbyes}}({{#if @last}}{{text}}! {{/if}}{{#each ../goodbyes}}{{#if @last}}{{text}}!{{/if}}{{/each}}{{#if @last}} {{text}}!{{/if}}) {{/each}}cruel {{world}}!';
      var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, '(GOODBYE!) (GOODBYE!) (GOODBYE! GOODBYE! GOODBYE!) cruel world!', 'The @last variable is used');
    });

    it('each with function argument', function() {
      var string = '{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!';
      var hash = {goodbyes: function() { return [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}]; }, world: 'world'};
      shouldCompileTo(string, hash, 'goodbye! Goodbye! GOODBYE! cruel world!',
                'each with array function argument iterates over the contents when not empty');
      shouldCompileTo(string, {goodbyes: [], world: 'world'}, 'cruel world!',
                'each with array function argument ignores the contents when empty');
    });

    it('data passed to helpers', function() {
      var string = '{{#each letters}}{{this}}{{detectDataInsideEach}}{{/each}}';
      var hash = {letters: ['a', 'b', 'c']};

      var template = CompilerContext.compile(string);
      var result = template(hash, {
        data: {
          exclaim: '!'
        }
      });
      equal(result, 'a!b!c!', 'should output data');
    });

    it('each on implicit context', function() {
      shouldThrow(function() {
        var template = CompilerContext.compile('{{#each}}{{text}}! {{/each}}cruel world!');
        template({});
      }, handlebarsEnv.Exception, 'Must pass iterator to #each');
    });
  });

  describe('#log', function() {
    /*eslint-disable no-console */
    if (typeof console === 'undefined') {
      return;
    }

    var $log,
        $info,
        $error;
    beforeEach(function() {
      $log = console.log;
      $info = console.info;
      $error = console.error;
    });
    afterEach(function() {
      console.log = $log;
      console.info = $info;
      console.error = $error;
    });

    it('should call logger at default level', function() {
      var string = '{{log blah}}';
      var hash = { blah: 'whee' };

      var levelArg, logArg;
      handlebarsEnv.log = function(level, arg) {
        levelArg = level;
        logArg = arg;
      };

      shouldCompileTo(string, hash, '', 'log should not display');
      equals(1, levelArg, 'should call log with 1');
      equals('whee', logArg, "should call log with 'whee'");
    });
    it('should call logger at data level', function() {
      var string = '{{log blah}}';
      var hash = { blah: 'whee' };

      var levelArg, logArg;
      handlebarsEnv.log = function(level, arg) {
        levelArg = level;
        logArg = arg;
      };

      shouldCompileTo(string, [hash,,,, {level: '03'}], '');
      equals(3, levelArg);
      equals('whee', logArg);
    });
    it('should output to info', function() {
      var string = '{{log blah}}';
      var hash = { blah: 'whee' };
      var called;

      console.info = function(info) {
        equals('whee', info);
        called = true;
      };
      console.log = function(log) {
        equals('whee', log);
        called = true;
      };

      shouldCompileTo(string, hash, '');
      equals(true, called);
    });
    it('should log at data level', function() {
      var string = '{{log blah}}';
      var hash = { blah: 'whee' };
      var called;

      console.error = function(log) {
        equals('whee', log);
        called = true;
      };

      shouldCompileTo(string, [hash,,,, {level: '03'}], '');
      equals(true, called);
    });
    it('should handle missing logger', function() {
      var string = '{{log blah}}';
      var hash = { blah: 'whee' };

      console.error = undefined;

      shouldCompileTo(string, [hash,,,, {level: '03'}], '');
    });
    /*eslint-enable no-console */
  });


  describe('#lookup', function() {
    it('should lookup arbitrary content', function() {
      var string = '{{#each goodbyes}}{{lookup ../data .}}{{/each}}',
          hash = {goodbyes: [0, 1], data: ['foo', 'bar']};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, 'foobar');
    });
    it('should not fail on undefined value', function() {
      var string = '{{#each goodbyes}}{{lookup ../bar .}}{{/each}}',
          hash = {goodbyes: [0, 1], data: ['foo', 'bar']};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, '');
    });
  });
});
