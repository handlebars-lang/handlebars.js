describe('builtin helpers', function () {
  describe('#if', function () {
    it('if', function () {
      var string = '{{#if goodbye}}GOODBYE {{/if}}cruel {{world}}!';

      expectTemplate(string)
        .withInput({
          goodbye: true,
          world: 'world',
        })
        .withMessage('if with boolean argument shows the contents when true')
        .toCompileTo('GOODBYE cruel world!');

      expectTemplate(string)
        .withInput({
          goodbye: 'dummy',
          world: 'world',
        })
        .withMessage('if with string argument shows the contents')
        .toCompileTo('GOODBYE cruel world!');

      expectTemplate(string)
        .withInput({
          goodbye: false,
          world: 'world',
        })
        .withMessage(
          'if with boolean argument does not show the contents when false'
        )
        .toCompileTo('cruel world!');

      expectTemplate(string)
        .withInput({ world: 'world' })
        .withMessage('if with undefined does not show the contents')
        .toCompileTo('cruel world!');

      expectTemplate(string)
        .withInput({
          goodbye: ['foo'],
          world: 'world',
        })
        .withMessage('if with non-empty array shows the contents')
        .toCompileTo('GOODBYE cruel world!');

      expectTemplate(string)
        .withInput({
          goodbye: [],
          world: 'world',
        })
        .withMessage('if with empty array does not show the contents')
        .toCompileTo('cruel world!');

      expectTemplate(string)
        .withInput({
          goodbye: 0,
          world: 'world',
        })
        .withMessage('if with zero does not show the contents')
        .toCompileTo('cruel world!');

      expectTemplate(
        '{{#if goodbye includeZero=true}}GOODBYE {{/if}}cruel {{world}}!'
      )
        .withInput({
          goodbye: 0,
          world: 'world',
        })
        .withMessage('if with zero does not show the contents')
        .toCompileTo('GOODBYE cruel world!');
    });

    it('if with function argument', function () {
      var string = '{{#if goodbye}}GOODBYE {{/if}}cruel {{world}}!';

      expectTemplate(string)
        .withInput({
          goodbye: function () {
            return true;
          },
          world: 'world',
        })
        .withMessage(
          'if with function shows the contents when function returns true'
        )
        .toCompileTo('GOODBYE cruel world!');

      expectTemplate(string)
        .withInput({
          goodbye: function () {
            return this.world;
          },
          world: 'world',
        })
        .withMessage(
          'if with function shows the contents when function returns string'
        )
        .toCompileTo('GOODBYE cruel world!');

      expectTemplate(string)
        .withInput({
          goodbye: function () {
            return false;
          },
          world: 'world',
        })
        .withMessage(
          'if with function does not show the contents when returns false'
        )
        .toCompileTo('cruel world!');

      expectTemplate(string)
        .withInput({
          goodbye: function () {
            return this.foo;
          },
          world: 'world',
        })
        .withMessage(
          'if with function does not show the contents when returns undefined'
        )
        .toCompileTo('cruel world!');
    });

    it('should not change the depth list', function () {
      expectTemplate(
        '{{#with foo}}{{#if goodbye}}GOODBYE cruel {{../world}}!{{/if}}{{/with}}'
      )
        .withInput({
          foo: { goodbye: true },
          world: 'world',
        })
        .toCompileTo('GOODBYE cruel world!');
    });
  });

  describe('#with', function () {
    it('with', function () {
      expectTemplate('{{#with person}}{{first}} {{last}}{{/with}}')
        .withInput({
          person: {
            first: 'Alan',
            last: 'Johnson',
          },
        })
        .toCompileTo('Alan Johnson');
    });

    it('with with function argument', function () {
      expectTemplate('{{#with person}}{{first}} {{last}}{{/with}}')
        .withInput({
          person: function () {
            return {
              first: 'Alan',
              last: 'Johnson',
            };
          },
        })
        .toCompileTo('Alan Johnson');
    });

    it('with with else', function () {
      expectTemplate(
        '{{#with person}}Person is present{{else}}Person is not present{{/with}}'
      ).toCompileTo('Person is not present');
    });

    it('with provides block parameter', function () {
      expectTemplate('{{#with person as |foo|}}{{foo.first}} {{last}}{{/with}}')
        .withInput({
          person: {
            first: 'Alan',
            last: 'Johnson',
          },
        })
        .toCompileTo('Alan Johnson');
    });

    it('works when data is disabled', function () {
      expectTemplate('{{#with person as |foo|}}{{foo.first}} {{last}}{{/with}}')
        .withInput({ person: { first: 'Alan', last: 'Johnson' } })
        .withCompileOptions({ data: false })
        .toCompileTo('Alan Johnson');
    });
  });

  describe('#each', function () {
    beforeEach(function () {
      handlebarsEnv.registerHelper('detectDataInsideEach', function (options) {
        return options.data && options.data.exclaim;
      });
    });

    it('each', function () {
      var string = '{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!';

      expectTemplate(string)
        .withInput({
          goodbyes: [
            { text: 'goodbye' },
            { text: 'Goodbye' },
            { text: 'GOODBYE' },
          ],
          world: 'world',
        })
        .withMessage(
          'each with array argument iterates over the contents when not empty'
        )
        .toCompileTo('goodbye! Goodbye! GOODBYE! cruel world!');

      expectTemplate(string)
        .withInput({
          goodbyes: [],
          world: 'world',
        })
        .withMessage('each with array argument ignores the contents when empty')
        .toCompileTo('cruel world!');
    });

    it('each without data', function () {
      expectTemplate('{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!')
        .withInput({
          goodbyes: [
            { text: 'goodbye' },
            { text: 'Goodbye' },
            { text: 'GOODBYE' },
          ],
          world: 'world',
        })
        .withRuntimeOptions({ data: false })
        .withCompileOptions({ data: false })
        .toCompileTo('goodbye! Goodbye! GOODBYE! cruel world!');

      expectTemplate('{{#each .}}{{.}}{{/each}}')
        .withInput({ goodbyes: 'cruel', world: 'world' })
        .withRuntimeOptions({ data: false })
        .withCompileOptions({ data: false })
        .toCompileTo('cruelworld');
    });

    it('each without context', function () {
      expectTemplate('{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!')
        .withInput(undefined)
        .toCompileTo('cruel !');
    });

    it('each with an object and @key', function () {
      var string =
        '{{#each goodbyes}}{{@key}}. {{text}}! {{/each}}cruel {{world}}!';

      function Clazz() {
        this['<b>#1</b>'] = { text: 'goodbye' };
        this[2] = { text: 'GOODBYE' };
      }
      Clazz.prototype.foo = 'fail';
      var hash = { goodbyes: new Clazz(), world: 'world' };

      // Object property iteration order is undefined according to ECMA spec,
      // so we need to check both possible orders
      // @see http://stackoverflow.com/questions/280713/elements-order-in-a-for-in-loop
      var actual = compileWithPartials(string, hash);
      var expected1 =
        '&lt;b&gt;#1&lt;/b&gt;. goodbye! 2. GOODBYE! cruel world!';
      var expected2 =
        '2. GOODBYE! &lt;b&gt;#1&lt;/b&gt;. goodbye! cruel world!';

      equals(
        actual === expected1 || actual === expected2,
        true,
        'each with object argument iterates over the contents when not empty'
      );

      expectTemplate(string)
        .withInput({
          goodbyes: {},
          world: 'world',
        })
        .toCompileTo('cruel world!');
    });

    it('each with @index', function () {
      expectTemplate(
        '{{#each goodbyes}}{{@index}}. {{text}}! {{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: [
            { text: 'goodbye' },
            { text: 'Goodbye' },
            { text: 'GOODBYE' },
          ],
          world: 'world',
        })
        .withMessage('The @index variable is used')
        .toCompileTo('0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!');
    });

    it('each with nested @index', function () {
      expectTemplate(
        '{{#each goodbyes}}{{@index}}. {{text}}! {{#each ../goodbyes}}{{@index}} {{/each}}After {{@index}} {{/each}}{{@index}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: [
            { text: 'goodbye' },
            { text: 'Goodbye' },
            { text: 'GOODBYE' },
          ],
          world: 'world',
        })
        .withMessage('The @index variable is used')
        .toCompileTo(
          '0. goodbye! 0 1 2 After 0 1. Goodbye! 0 1 2 After 1 2. GOODBYE! 0 1 2 After 2 cruel world!'
        );
    });

    it('each with block params', function () {
      expectTemplate(
        '{{#each goodbyes as |value index|}}{{index}}. {{value.text}}! {{#each ../goodbyes as |childValue childIndex|}} {{index}} {{childIndex}}{{/each}} After {{index}} {{/each}}{{index}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }],
          world: 'world',
        })
        .toCompileTo(
          '0. goodbye!  0 0 0 1 After 0 1. Goodbye!  1 0 1 1 After 1 cruel world!'
        );
    });

    it('each with block params and strict compilation', function () {
      expectTemplate(
        '{{#each goodbyes as |value index|}}{{index}}. {{value.text}}!{{/each}}'
      )
        .withCompileOptions({ strict: true })
        .withInput({ goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }] })
        .toCompileTo('0. goodbye!1. Goodbye!');
    });

    it('each object with @index', function () {
      expectTemplate(
        '{{#each goodbyes}}{{@index}}. {{text}}! {{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: {
            a: { text: 'goodbye' },
            b: { text: 'Goodbye' },
            c: { text: 'GOODBYE' },
          },
          world: 'world',
        })
        .withMessage('The @index variable is used')
        .toCompileTo('0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!');
    });

    it('each with @first', function () {
      expectTemplate(
        '{{#each goodbyes}}{{#if @first}}{{text}}! {{/if}}{{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: [
            { text: 'goodbye' },
            { text: 'Goodbye' },
            { text: 'GOODBYE' },
          ],
          world: 'world',
        })
        .withMessage('The @first variable is used')
        .toCompileTo('goodbye! cruel world!');
    });

    it('each with nested @first', function () {
      expectTemplate(
        '{{#each goodbyes}}({{#if @first}}{{text}}! {{/if}}{{#each ../goodbyes}}{{#if @first}}{{text}}!{{/if}}{{/each}}{{#if @first}} {{text}}!{{/if}}) {{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: [
            { text: 'goodbye' },
            { text: 'Goodbye' },
            { text: 'GOODBYE' },
          ],
          world: 'world',
        })
        .withMessage('The @first variable is used')
        .toCompileTo(
          '(goodbye! goodbye! goodbye!) (goodbye!) (goodbye!) cruel world!'
        );
    });

    it('each object with @first', function () {
      expectTemplate(
        '{{#each goodbyes}}{{#if @first}}{{text}}! {{/if}}{{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: { foo: { text: 'goodbye' }, bar: { text: 'Goodbye' } },
          world: 'world',
        })
        .withMessage('The @first variable is used')
        .toCompileTo('goodbye! cruel world!');
    });

    it('each with @last', function () {
      expectTemplate(
        '{{#each goodbyes}}{{#if @last}}{{text}}! {{/if}}{{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: [
            { text: 'goodbye' },
            { text: 'Goodbye' },
            { text: 'GOODBYE' },
          ],
          world: 'world',
        })
        .withMessage('The @last variable is used')
        .toCompileTo('GOODBYE! cruel world!');
    });

    it('each object with @last', function () {
      expectTemplate(
        '{{#each goodbyes}}{{#if @last}}{{text}}! {{/if}}{{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: { foo: { text: 'goodbye' }, bar: { text: 'Goodbye' } },
          world: 'world',
        })
        .withMessage('The @last variable is used')
        .toCompileTo('Goodbye! cruel world!');
    });

    it('each with nested @last', function () {
      expectTemplate(
        '{{#each goodbyes}}({{#if @last}}{{text}}! {{/if}}{{#each ../goodbyes}}{{#if @last}}{{text}}!{{/if}}{{/each}}{{#if @last}} {{text}}!{{/if}}) {{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: [
            { text: 'goodbye' },
            { text: 'Goodbye' },
            { text: 'GOODBYE' },
          ],
          world: 'world',
        })
        .withMessage('The @last variable is used')
        .toCompileTo(
          '(GOODBYE!) (GOODBYE!) (GOODBYE! GOODBYE! GOODBYE!) cruel world!'
        );
    });

    it('each with function argument', function () {
      var string = '{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!';

      expectTemplate(string)
        .withInput({
          goodbyes: function () {
            return [
              { text: 'goodbye' },
              { text: 'Goodbye' },
              { text: 'GOODBYE' },
            ];
          },
          world: 'world',
        })
        .withMessage(
          'each with array function argument iterates over the contents when not empty'
        )
        .toCompileTo('goodbye! Goodbye! GOODBYE! cruel world!');

      expectTemplate(string)
        .withInput({
          goodbyes: [],
          world: 'world',
        })
        .withMessage(
          'each with array function argument ignores the contents when empty'
        )
        .toCompileTo('cruel world!');
    });

    it('each object when last key is an empty string', function () {
      expectTemplate(
        '{{#each goodbyes}}{{@index}}. {{text}}! {{/each}}cruel {{world}}!'
      )
        .withInput({
          goodbyes: {
            a: { text: 'goodbye' },
            b: { text: 'Goodbye' },
            '': { text: 'GOODBYE' },
          },
          world: 'world',
        })
        .withMessage('Empty string key is not skipped')
        .toCompileTo('0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!');
    });

    it('data passed to helpers', function () {
      expectTemplate(
        '{{#each letters}}{{this}}{{detectDataInsideEach}}{{/each}}'
      )
        .withInput({ letters: ['a', 'b', 'c'] })
        .withMessage('should output data')
        .withRuntimeOptions({
          data: {
            exclaim: '!',
          },
        })
        .toCompileTo('a!b!c!');
    });

    it('each on implicit context', function () {
      expectTemplate('{{#each}}{{text}}! {{/each}}cruel world!').toThrow(
        handlebarsEnv.Exception,
        'Must pass iterator to #each'
      );
    });

    it('each on Map', function () {
      var map = new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);

      expectTemplate('{{#each map}}{{@key}}(i{{@index}}) {{.}} {{/each}}')
        .withInput({ map: map })
        .toCompileTo('1(i0) one 2(i1) two 3(i2) three ');

      expectTemplate('{{#each map}}{{#if @first}}{{.}}{{/if}}{{/each}}')
        .withInput({ map: map })
        .toCompileTo('one');

      expectTemplate('{{#each map}}{{#if @last}}{{.}}{{/if}}{{/each}}')
        .withInput({ map: map })
        .toCompileTo('three');

      expectTemplate('{{#each map}}{{.}}{{/each}}not-in-each')
        .withInput({ map: new Map() })
        .toCompileTo('not-in-each');
    });

    it('each on Set', function () {
      var set = new Set([1, 2, 3]);

      expectTemplate('{{#each set}}{{@key}}(i{{@index}}) {{.}} {{/each}}')
        .withInput({ set: set })
        .toCompileTo('0(i0) 1 1(i1) 2 2(i2) 3 ');

      expectTemplate('{{#each set}}{{#if @first}}{{.}}{{/if}}{{/each}}')
        .withInput({ set: set })
        .toCompileTo('1');

      expectTemplate('{{#each set}}{{#if @last}}{{.}}{{/if}}{{/each}}')
        .withInput({ set: set })
        .toCompileTo('3');

      expectTemplate('{{#each set}}{{.}}{{/each}}not-in-each')
        .withInput({ set: new Set() })
        .toCompileTo('not-in-each');
    });

    if (global.Symbol && global.Symbol.iterator) {
      it('each on iterable', function () {
        function Iterator(arr) {
          this.arr = arr;
          this.index = 0;
        }
        Iterator.prototype.next = function () {
          var value = this.arr[this.index];
          var done = this.index === this.arr.length;
          if (!done) {
            this.index++;
          }
          return { value: value, done: done };
        };
        function Iterable(arr) {
          this.arr = arr;
        }
        Iterable.prototype[global.Symbol.iterator] = function () {
          return new Iterator(this.arr);
        };
        var string = '{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!';

        expectTemplate(string)
          .withInput({
            goodbyes: new Iterable([
              { text: 'goodbye' },
              { text: 'Goodbye' },
              { text: 'GOODBYE' },
            ]),
            world: 'world',
          })
          .withMessage(
            'each with array argument iterates over the contents when not empty'
          )
          .toCompileTo('goodbye! Goodbye! GOODBYE! cruel world!');

        expectTemplate(string)
          .withInput({
            goodbyes: new Iterable([]),
            world: 'world',
          })
          .withMessage(
            'each with array argument ignores the contents when empty'
          )
          .toCompileTo('cruel world!');
      });
    }
  });

  describe('#log', function () {
    /* eslint-disable no-console */
    if (typeof console === 'undefined') {
      return;
    }

    var $log, $info, $error;
    beforeEach(function () {
      $log = console.log;
      $info = console.info;
      $error = console.error;
    });
    afterEach(function () {
      console.log = $log;
      console.info = $info;
      console.error = $error;
    });

    it('should call logger at default level', function () {
      var levelArg, logArg;
      handlebarsEnv.log = function (level, arg) {
        levelArg = level;
        logArg = arg;
      };

      expectTemplate('{{log blah}}')
        .withInput({ blah: 'whee' })
        .withMessage('log should not display')
        .toCompileTo('');
      equals(1, levelArg, 'should call log with 1');
      equals('whee', logArg, "should call log with 'whee'");
    });

    it('should call logger at data level', function () {
      var levelArg, logArg;
      handlebarsEnv.log = function (level, arg) {
        levelArg = level;
        logArg = arg;
      };

      expectTemplate('{{log blah}}')
        .withInput({ blah: 'whee' })
        .withRuntimeOptions({ data: { level: '03' } })
        .withCompileOptions({ data: true })
        .toCompileTo('');
      equals('03', levelArg);
      equals('whee', logArg);
    });

    it('should output to info', function () {
      var called;

      console.info = function (info) {
        equals('whee', info);
        called = true;
        console.info = $info;
        console.log = $log;
      };
      console.log = function (log) {
        equals('whee', log);
        called = true;
        console.info = $info;
        console.log = $log;
      };

      expectTemplate('{{log blah}}')
        .withInput({ blah: 'whee' })
        .toCompileTo('');
      equals(true, called);
    });

    it('should log at data level', function () {
      var called;

      console.error = function (log) {
        equals('whee', log);
        called = true;
        console.error = $error;
      };

      expectTemplate('{{log blah}}')
        .withInput({ blah: 'whee' })
        .withRuntimeOptions({ data: { level: '03' } })
        .withCompileOptions({ data: true })
        .toCompileTo('');
      equals(true, called);
    });

    it('should handle missing logger', function () {
      var called = false;

      console.error = undefined;
      console.log = function (log) {
        equals('whee', log);
        called = true;
        console.log = $log;
      };

      expectTemplate('{{log blah}}')
        .withInput({ blah: 'whee' })
        .withRuntimeOptions({ data: { level: '03' } })
        .withCompileOptions({ data: true })
        .toCompileTo('');
      equals(true, called);
    });

    it('should handle string log levels', function () {
      var called;

      console.error = function (log) {
        equals('whee', log);
        called = true;
      };

      expectTemplate('{{log blah}}')
        .withInput({ blah: 'whee' })
        .withRuntimeOptions({ data: { level: 'error' } })
        .withCompileOptions({ data: true })
        .toCompileTo('');
      equals(true, called);

      called = false;

      expectTemplate('{{log blah}}')
        .withInput({ blah: 'whee' })
        .withRuntimeOptions({ data: { level: 'ERROR' } })
        .withCompileOptions({ data: true })
        .toCompileTo('');
      equals(true, called);
    });

    it('should handle hash log levels', function () {
      var called;

      console.error = function (log) {
        equals('whee', log);
        called = true;
      };

      expectTemplate('{{log blah level="error"}}')
        .withInput({ blah: 'whee' })
        .toCompileTo('');
      equals(true, called);
    });

    it('should handle hash log levels', function () {
      var called = false;

      console.info =
        console.log =
        console.error =
        console.debug =
          function () {
            called = true;
            console.info = console.log = console.error = console.debug = $log;
          };

      expectTemplate('{{log blah level="debug"}}')
        .withInput({ blah: 'whee' })
        .toCompileTo('');
      equals(false, called);
    });

    it('should pass multiple log arguments', function () {
      var called;

      console.info = console.log = function (log1, log2, log3) {
        equals('whee', log1);
        equals('foo', log2);
        equals(1, log3);
        called = true;
        console.log = $log;
      };

      expectTemplate('{{log blah "foo" 1}}')
        .withInput({ blah: 'whee' })
        .toCompileTo('');
      equals(true, called);
    });

    it('should pass zero log arguments', function () {
      var called;

      console.info = console.log = function () {
        expect(arguments.length).to.equal(0);
        called = true;
        console.log = $log;
      };

      expectTemplate('{{log}}').withInput({ blah: 'whee' }).toCompileTo('');
      expect(called).to.be.true();
    });
    /* eslint-enable no-console */
  });

  describe('#lookup', function () {
    it('should lookup arbitrary content', function () {
      expectTemplate('{{#each goodbyes}}{{lookup ../data .}}{{/each}}')
        .withInput({ goodbyes: [0, 1], data: ['foo', 'bar'] })
        .toCompileTo('foobar');
    });

    it('should not fail on undefined value', function () {
      expectTemplate('{{#each goodbyes}}{{lookup ../bar .}}{{/each}}')
        .withInput({ goodbyes: [0, 1], data: ['foo', 'bar'] })
        .toCompileTo('');
    });
  });
});
