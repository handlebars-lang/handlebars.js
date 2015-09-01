describe('partials', function() {
  it('basic partials', function() {
    var string = 'Dudes: {{#dudes}}{{> dude}}{{/dudes}}';
    var partial = '{{name}} ({{url}}) ';
    var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, 'Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial},, false], true, 'Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
  });

  it('dynamic partials', function() {
    var string = 'Dudes: {{#dudes}}{{> (partial)}}{{/dudes}}';
    var partial = '{{name}} ({{url}}) ';
    var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    var helpers = {
      partial: function() {
        return 'dude';
      }
    };
    shouldCompileToWithPartials(string, [hash, helpers, {dude: partial}], true, 'Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
    shouldCompileToWithPartials(string, [hash, helpers, {dude: partial},, false], true, 'Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
  });
  it('failing dynamic partials', function() {
    var string = 'Dudes: {{#dudes}}{{> (partial)}}{{/dudes}}';
    var partial = '{{name}} ({{url}}) ';
    var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    var helpers = {
      partial: function() {
        return 'missing';
      }
    };
    shouldThrow(function() {
      shouldCompileToWithPartials(string, [hash, helpers, {dude: partial}], true, 'Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
    }, Handlebars.Exception, 'The partial missing could not be found');
  });

  it('partials with context', function() {
    var string = 'Dudes: {{>dude dudes}}';
    var partial = '{{#this}}{{name}} ({{url}}) {{/this}}';
    var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, 'Dudes: Yehuda (http://yehuda) Alan (http://alan) ',
                    'Partials can be passed a context');
  });

  it('partials with no context', function() {
    var partial = '{{name}} ({{url}}) ';
    var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    shouldCompileToWithPartials(
        'Dudes: {{#dudes}}{{>dude}}{{/dudes}}',
        [hash, {}, {dude: partial}, {explicitPartialContext: true}],
        true,
        'Dudes:  ()  () ');
    shouldCompileToWithPartials(
        'Dudes: {{#dudes}}{{>dude name="foo"}}{{/dudes}}',
        [hash, {}, {dude: partial}, {explicitPartialContext: true}],
        true,
        'Dudes: foo () foo () ');
  });

  it('partials with string context', function() {
    var string = 'Dudes: {{>dude "dudes"}}';
    var partial = '{{.}}';
    var hash = {};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, 'Dudes: dudes');
  });

  it('partials with undefined context', function() {
    var string = 'Dudes: {{>dude dudes}}';
    var partial = '{{foo}} Empty';
    var hash = {};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, 'Dudes:  Empty');
  });

  it('partials with duplicate parameters', function() {
    shouldThrow(function() {
      CompilerContext.compile('Dudes: {{>dude dudes foo bar=baz}}');
    }, Error, 'Unsupported number of partial arguments: 2 - 1:7');
  });

  it('partials with parameters', function() {
    var string = 'Dudes: {{#dudes}}{{> dude others=..}}{{/dudes}}';
    var partial = '{{others.foo}}{{name}} ({{url}}) ';
    var hash = {foo: 'bar', dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, 'Dudes: barYehuda (http://yehuda) barAlan (http://alan) ',
                    'Basic partials output based on current context.');
  });

  it('partial in a partial', function() {
    var string = 'Dudes: {{#dudes}}{{>dude}}{{/dudes}}';
    var dude = '{{name}} {{> url}} ';
    var url = '<a href="{{url}}">{{url}}</a>';
    var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: dude, url: url}], true, 'Dudes: Yehuda <a href="http://yehuda">http://yehuda</a> Alan <a href="http://alan">http://alan</a> ', 'Partials are rendered inside of other partials');
  });

  it('rendering undefined partial throws an exception', function() {
    shouldThrow(function() {
      var template = CompilerContext.compile('{{> whatever}}');
      template();
    }, Handlebars.Exception, 'The partial whatever could not be found');
  });

  it('registering undefined partial throws an exception', function() {
    shouldThrow(function() {
      var undef;
      handlebarsEnv.registerPartial('undefined_test', undef);
    }, Handlebars.Exception, 'Attempting to register a partial as undefined');
  });

  it('rendering template partial in vm mode throws an exception', function() {
    shouldThrow(function() {
      var template = CompilerContext.compile('{{> whatever}}');
      template();
    }, Handlebars.Exception, 'The partial whatever could not be found');
  });

  it('rendering function partial in vm mode', function() {
    var string = 'Dudes: {{#dudes}}{{> dude}}{{/dudes}}';
    function partial(context) {
      return context.name + ' (' + context.url + ') ';
    }
    var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    shouldCompileTo(string, [hash, {}, {dude: partial}], 'Dudes: Yehuda (http://yehuda) Alan (http://alan) ',
                    'Function partials output based in VM.');
  });

  it('GH-14: a partial preceding a selector', function() {
    var string = 'Dudes: {{>dude}} {{anotherDude}}';
    var dude = '{{name}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash, {}, {dude: dude}], true, 'Dudes: Jeepers Creepers', 'Regular selectors can follow a partial');
  });

  it('Partials with slash paths', function() {
    var string = 'Dudes: {{> shared/dude}}';
    var dude = '{{name}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash, {}, {'shared/dude': dude}], true, 'Dudes: Jeepers', 'Partials can use literal paths');
  });

  it('Partials with slash and point paths', function() {
    var string = 'Dudes: {{> shared/dude.thing}}';
    var dude = '{{name}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash, {}, {'shared/dude.thing': dude}], true, 'Dudes: Jeepers', 'Partials can use literal with points in paths');
  });

  it('Global Partials', function() {
    handlebarsEnv.registerPartial('globalTest', '{{anotherDude}}');

    var string = 'Dudes: {{> shared/dude}} {{> globalTest}}';
    var dude = '{{name}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash, {}, {'shared/dude': dude}], true, 'Dudes: Jeepers Creepers', 'Partials can use globals or passed');

    handlebarsEnv.unregisterPartial('globalTest');
    equals(handlebarsEnv.partials.globalTest, undefined);
  });

  it('Multiple partial registration', function() {
    handlebarsEnv.registerPartial({
      'shared/dude': '{{name}}',
      globalTest: '{{anotherDude}}'
    });

    var string = 'Dudes: {{> shared/dude}} {{> globalTest}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash], true, 'Dudes: Jeepers Creepers', 'Partials can use globals or passed');
  });

  it('Partials with integer path', function() {
    var string = 'Dudes: {{> 404}}';
    var dude = '{{name}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash, {}, {404: dude}], true, 'Dudes: Jeepers', 'Partials can use literal paths');
  });

  it('Partials with complex path', function() {
    var string = 'Dudes: {{> 404/asdf?.bar}}';
    var dude = '{{name}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash, {}, {'404/asdf?.bar': dude}], true, 'Dudes: Jeepers', 'Partials can use literal paths');
  });

  it('Partials with escaped', function() {
    var string = 'Dudes: {{> [+404/asdf?.bar]}}';
    var dude = '{{name}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash, {}, {'+404/asdf?.bar': dude}], true, 'Dudes: Jeepers', 'Partials can use literal paths');
  });

  it('Partials with string', function() {
    var string = 'Dudes: {{> \'+404/asdf?.bar\'}}';
    var dude = '{{name}}';
    var hash = {name: 'Jeepers', anotherDude: 'Creepers'};
    shouldCompileToWithPartials(string, [hash, {}, {'+404/asdf?.bar': dude}], true, 'Dudes: Jeepers', 'Partials can use literal paths');
  });

  it('should handle empty partial', function() {
    var string = 'Dudes: {{#dudes}}{{> dude}}{{/dudes}}';
    var partial = '';
    var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, 'Dudes: ');
  });

  it('throw on missing partial', function() {
    var compile = handlebarsEnv.compile;
    handlebarsEnv.compile = undefined;
    shouldThrow(function() {
      shouldCompileTo('{{> dude}}', [{}, {}, {dude: 'fail'}], '');
    }, Error, /The partial dude could not be compiled/);
    handlebarsEnv.compile = compile;
  });

  describe('partial blocks', function() {
    it('should render partial block as default', function() {
      shouldCompileToWithPartials(
        '{{#> dude}}success{{/dude}}',
        [{}, {}, {}],
        true,
        'success');
    });
    it('should execute default block with proper context', function() {
      shouldCompileToWithPartials(
        '{{#> dude context}}{{value}}{{/dude}}',
        [{context: {value: 'success'}}, {}, {}],
        true,
        'success');
    });
    it('should propagate block parameters to default block', function() {
      shouldCompileToWithPartials(
        '{{#with context as |me|}}{{#> dude}}{{me.value}}{{/dude}}{{/with}}',
        [{context: {value: 'success'}}, {}, {}],
        true,
        'success');
    });

    it('should not use partial block if partial exists', function() {
      shouldCompileToWithPartials(
        '{{#> dude}}fail{{/dude}}',
        [{}, {}, {dude: 'success'}],
        true,
        'success');
    });

    it('should render block from partial', function() {
      shouldCompileToWithPartials(
        '{{#> dude}}success{{/dude}}',
        [{}, {}, {dude: '{{> @partial-block }}'}],
        true,
        'success');
    });
    it('should render block from partial with context', function() {
      shouldCompileToWithPartials(
        '{{#> dude}}{{value}}{{/dude}}',
        [{context: {value: 'success'}}, {}, {dude: '{{#with context}}{{> @partial-block }}{{/with}}'}],
        true,
        'success');
    });
    it('should render block from partial with context', function() {
      shouldCompileToWithPartials(
        '{{#> dude}}{{../context/value}}{{/dude}}',
        [{context: {value: 'success'}}, {}, {dude: '{{#with context}}{{> @partial-block }}{{/with}}'}],
        true,
        'success');
    });
    it('should render block from partial with block params', function() {
      shouldCompileToWithPartials(
        '{{#with context as |me|}}{{#> dude}}{{me.value}}{{/dude}}{{/with}}',
        [{context: {value: 'success'}}, {}, {dude: '{{> @partial-block }}'}],
        true,
        'success');
    });
  });

  describe('inline partials', function() {
    it('should define inline partials for template', function() {
      shouldCompileTo('{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}', {}, 'success');
    });
    it('should overwrite multiple partials in the same template', function() {
      shouldCompileTo('{{#*inline "myPartial"}}fail{{/inline}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}', {}, 'success');
    });
    it('should define inline partials for block', function() {
      shouldCompileTo('{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}{{/with}}', {}, 'success');
      shouldThrow(function() {
        shouldCompileTo('{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{/with}}{{> myPartial}}', {}, 'success');
      }, Error, /myPartial could not/);
    });
    it('should override global partials', function() {
      shouldCompileTo('{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}', {hash: {}, partials: {myPartial: function() { return 'fail'; }}}, 'success');
    });
    it('should override template partials', function() {
      shouldCompileTo('{{#*inline "myPartial"}}fail{{/inline}}{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}{{/with}}', {}, 'success');
    });
    it('should override partials down the entire stack', function() {
      shouldCompileTo('{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{#with .}}{{#with .}}{{> myPartial}}{{/with}}{{/with}}{{/with}}', {}, 'success');
    });

    it('should define inline partials for partial call', function() {
      shouldCompileToWithPartials(
        '{{#*inline "myPartial"}}success{{/inline}}{{> dude}}',
        [{}, {}, {dude: '{{> myPartial }}'}],
        true,
        'success');
    });
    it('should define inline partials in partial block call', function() {
      shouldCompileToWithPartials(
        '{{#> dude}}{{#*inline "myPartial"}}success{{/inline}}{{/dude}}',
        [{}, {}, {dude: '{{> myPartial }}'}],
        true,
        'success');
    });
  });

  it('should pass compiler flags', function() {
    if (Handlebars.compile) {
      var env = Handlebars.create();
      env.registerPartial('partial', '{{foo}}');
      var template = env.compile('{{foo}} {{> partial}}', {noEscape: true});
      equal(template({foo: '<'}), '< <');
    }
  });

  describe('standalone partials', function() {
    it('indented partials', function() {
      var string = 'Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}';
      var dude = '{{name}}\n';
      var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
      shouldCompileToWithPartials(string, [hash, {}, {dude: dude}], true,
            'Dudes:\n  Yehuda\n  Alan\n');
    });
    it('nested indented partials', function() {
      var string = 'Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}';
      var dude = '{{name}}\n {{> url}}';
      var url = '{{url}}!\n';
      var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
      shouldCompileToWithPartials(string, [hash, {}, {dude: dude, url: url}], true,
            'Dudes:\n  Yehuda\n   http://yehuda!\n  Alan\n   http://alan!\n');
    });
    it('prevent nested indented partials', function() {
      var string = 'Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}';
      var dude = '{{name}}\n {{> url}}';
      var url = '{{url}}!\n';
      var hash = {dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
      shouldCompileToWithPartials(string, [hash, {}, {dude: dude, url: url}, {preventIndent: true}], true,
            'Dudes:\n  Yehuda\n http://yehuda!\n  Alan\n http://alan!\n');
    });
  });

  describe('compat mode', function() {
    it('partials can access parents', function() {
      var string = 'Dudes: {{#dudes}}{{> dude}}{{/dudes}}';
      var partial = '{{name}} ({{url}}) {{root}} ';
      var hash = {root: 'yes', dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
      shouldCompileToWithPartials(string, [hash, {}, {dude: partial}, true], true, 'Dudes: Yehuda (http://yehuda) yes Alan (http://alan) yes ');
    });
    it('partials can access parents with custom context', function() {
      var string = 'Dudes: {{#dudes}}{{> dude "test"}}{{/dudes}}';
      var partial = '{{name}} ({{url}}) {{root}} ';
      var hash = {root: 'yes', dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
      shouldCompileToWithPartials(string, [hash, {}, {dude: partial}, true], true, 'Dudes: Yehuda (http://yehuda) yes Alan (http://alan) yes ');
    });
    it('partials can access parents without data', function() {
      var string = 'Dudes: {{#dudes}}{{> dude}}{{/dudes}}';
      var partial = '{{name}} ({{url}}) {{root}} ';
      var hash = {root: 'yes', dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
      shouldCompileToWithPartials(string, [hash, {}, {dude: partial}, true, false], true, 'Dudes: Yehuda (http://yehuda) yes Alan (http://alan) yes ');
    });
    it('partials inherit compat', function() {
      var string = 'Dudes: {{> dude}}';
      var partial = '{{#dudes}}{{name}} ({{url}}) {{root}} {{/dudes}}';
      var hash = {root: 'yes', dudes: [{name: 'Yehuda', url: 'http://yehuda'}, {name: 'Alan', url: 'http://alan'}]};
      shouldCompileToWithPartials(string, [hash, {}, {dude: partial}, true], true, 'Dudes: Yehuda (http://yehuda) yes Alan (http://alan) yes ');
    });
  });
});
