describe('allowedVariables', function() {
  it('should compile when all variables are allowed', function() {
    expectTemplate('{{foo}} {{bar}}')
      .withInput({ foo: 'a', bar: 'b' })
      .withCompileOptions({ allowedVariables: ['foo', 'bar'] })
      .toCompileTo('a b');
  });

  it('should throw if a variable is not allowed', function() {
    expectTemplate('{{foo}} {{baz}}')
      .withInput({ foo: 'a', baz: 'c' })
      .withCompileOptions({ allowedVariables: ['foo'] })
      .toThrow(/baz/);
  });

  it('should not require known helpers to be allowed', function() {
    expectTemplate('{{#if var}}ok{{/if}}')
      .withInput({ var: true })
      .withCompileOptions({
        allowedVariables: ['var']
      })
      .toCompileTo('ok');
  });

  // Test cases for object property access
  describe('object variables', function() {
    it('should allow access to object properties when root variable is allowed', function() {
      expectTemplate('{{user.name}} {{user.email}}')
        .withInput({
          user: { name: 'John', email: 'john@example.com' }
        })
        .withCompileOptions({ allowedVariables: ['user'] })
        .toCompileTo('John john@example.com');
    });

    it('should throw if root object variable is not allowed', function() {
      expectTemplate('{{user.name}}')
        .withInput({
          user: { name: 'John' }
        })
        .withCompileOptions({ allowedVariables: [] })
        .toThrow(/user/);
    });

    it('should allow deep nested property access when root is allowed', function() {
      expectTemplate('{{person.address.city}}')
        .withInput({
          person: {
            address: {
              city: 'New York'
            }
          }
        })
        .withCompileOptions({ allowedVariables: ['person'] })
        .toCompileTo('New York');
    });

    it('should allow mixed simple and object variables', function() {
      expectTemplate('{{title}}: {{user.name}} ({{age}})')
        .withInput({
          title: 'User',
          user: { name: 'John' },
          age: 30
        })
        .withCompileOptions({ allowedVariables: ['title', 'user', 'age'] })
        .toCompileTo('User: John (30)');
    });

    it('should throw if any root variable is not allowed in mixed access', function() {
      expectTemplate('{{title}}: {{user.name}} ({{age}})')
        .withInput({
          title: 'User',
          user: { name: 'John' },
          age: 30
        })
        .withCompileOptions({ allowedVariables: ['title', 'user'] })
        .toThrow(/age/);
    });

    it('should work with array access notation', function() {
      expectTemplate('{{users.[0].name}}')
        .withInput({
          users: [{ name: 'Alice' }, { name: 'Bob' }]
        })
        .withCompileOptions({ allowedVariables: ['users'] })
        .toCompileTo('Alice');
    });
  });

  // Test cases for comprehensive coverage
  describe('decorators', function() {
    it('should not require decorator names to be in allowedVariables', function() {
      expectTemplate('{{#helper}}{{*decorator}}{{/helper}}')
        .withHelper('helper', function(options) {
          return options.fn.run;
        })
        .withDecorator('decorator', function(fn) {
          fn.run = 'success';
          return fn;
        })
        .withCompileOptions({
          allowedVariables: [],
          knownHelpers: { helper: true }
        })
        .toCompileTo('success');
    });

    it('should require decorator parameters to be in allowedVariables', function() {
      expectTemplate('{{#helper}}{{*decorator param1}}{{/helper}}')
        .withHelper('helper', function(options) {
          return options.fn.result || 'default';
        })
        .withDecorator('decorator', function(fn, props, container, options) {
          fn.result = options.args[0];
          return fn;
        })
        .withInput({ param1: 'success' })
        .withCompileOptions({
          allowedVariables: ['param1'],
          knownHelpers: { helper: true }
        })
        .toCompileTo('success');
    });

    it('should throw if decorator parameters are not allowed', function() {
      expectTemplate('{{#helper}}{{*decorator forbiddenParam}}{{/helper}}')
        .withHelper('helper', function(options) {
          return options.fn.result || 'default';
        })
        .withDecorator('decorator', function(fn, props, container, options) {
          fn.result = options.args[0];
          return fn;
        })
        .withInput({ forbiddenParam: 'fail' })
        .withCompileOptions({
          allowedVariables: [],
          knownHelpers: { helper: true }
        })
        .toThrow(/forbiddenParam/);
    });

    it('should handle block decorators', function() {
      expectTemplate(
        '{{#helper}}{{#*decorator}}content{{/decorator}}{{/helper}}'
      )
        .withHelper('helper', function(options) {
          return options.fn.result || 'default';
        })
        .withDecorator('decorator', function(fn, props, container, options) {
          fn.result = options.fn();
          return fn;
        })
        .withCompileOptions({
          allowedVariables: [],
          knownHelpers: { helper: true }
        })
        .toCompileTo('content');
    });

    it('should allow object properties in decorator parameters', function() {
      expectTemplate('{{#helper}}{{*decorator config.value}}{{/helper}}')
        .withHelper('helper', function(options) {
          return options.fn.result || 'default';
        })
        .withDecorator('decorator', function(fn, props, container, options) {
          fn.result = options.args[0];
          return fn;
        })
        .withInput({ config: { value: 'configured' } })
        .withCompileOptions({
          allowedVariables: ['config'],
          knownHelpers: { helper: true }
        })
        .toCompileTo('configured');
    });
  });

  describe('partial blocks', function() {
    it('should handle partial block parameters', function() {
      expectTemplate(
        '{{#> partialBlock param1}}default content{{/partialBlock}}'
      )
        .withPartial('partialBlock', '{{> @partial-block}}')
        .withInput({ param1: 'success' })
        .withCompileOptions({ allowedVariables: ['param1'] })
        .toCompileTo('default content');
    });

    it('should throw if partial block parameters are not allowed', function() {
      expectTemplate(
        '{{#> partialBlock forbiddenParam}}default content{{/partialBlock}}'
      )
        .withPartial('partialBlock', '{{> @partial-block}}')
        .withInput({ forbiddenParam: 'fail' })
        .withCompileOptions({ allowedVariables: [] })
        .toThrow(/forbiddenParam/);
    });

    it('should handle partial blocks with programs', function() {
      expectTemplate('{{#> partialBlock}}{{programVar}}{{/partialBlock}}')
        .withPartial('partialBlock', '{{> @partial-block}}')
        .withInput({ programVar: 'success' })
        .withCompileOptions({ allowedVariables: ['programVar'] })
        .toCompileTo('success');
    });

    it('should allow object properties in partial block parameters', function() {
      expectTemplate(
        '{{#> partialBlock settings.theme}}default content{{/partialBlock}}'
      )
        .withPartial('partialBlock', '{{> @partial-block}}')
        .withInput({ settings: { theme: 'dark' } })
        .withCompileOptions({ allowedVariables: ['settings'] })
        .toCompileTo('default content');
    });

    it('should handle object properties in partial block programs', function() {
      expectTemplate(
        '{{#> partialBlock}}{{user.profile.displayName}}{{/partialBlock}}'
      )
        .withPartial('partialBlock', '{{> @partial-block}}')
        .withInput({ user: { profile: { displayName: 'John Doe' } } })
        .withCompileOptions({ allowedVariables: ['user'] })
        .toCompileTo('John Doe');
    });
  });

  // Test cases for built-in helpers
  describe('built-in helpers', function() {
    it('should allow if/else conditions with allowed variables', function() {
      expectTemplate('{{#if isVisible}}{{content}}{{else}}{{fallback}}{{/if}}')
        .withInput({
          isVisible: true,
          content: 'visible content',
          fallback: 'hidden content'
        })
        .withCompileOptions({
          allowedVariables: ['isVisible', 'content', 'fallback']
        })
        .toCompileTo('visible content');
    });

    it('should throw if variables in if condition are not allowed', function() {
      expectTemplate('{{#if isVisible}}{{content}}{{/if}}')
        .withInput({
          isVisible: true,
          content: 'visible content'
        })
        .withCompileOptions({ allowedVariables: ['content'] })
        .toThrow(/isVisible/);
    });

    it('should throw if variables in if body are not allowed', function() {
      expectTemplate('{{#if isVisible}}{{secretContent}}{{/if}}')
        .withInput({
          isVisible: true,
          secretContent: 'secret'
        })
        .withCompileOptions({ allowedVariables: ['isVisible'] })
        .toThrow(/secretContent/);
    });

    it('should throw if variables in else block are not allowed', function() {
      expectTemplate(
        '{{#if isVisible}}allowed{{else}}{{forbiddenContent}}{{/if}}'
      )
        .withInput({
          isVisible: false,
          forbiddenContent: 'forbidden'
        })
        .withCompileOptions({ allowedVariables: ['isVisible'] })
        .toThrow(/forbiddenContent/);
    });

    it('should work with unless helper', function() {
      expectTemplate('{{#unless isHidden}}{{content}}{{/unless}}')
        .withInput({
          isHidden: false,
          content: 'visible content'
        })
        .withCompileOptions({ allowedVariables: ['isHidden', 'content'] })
        .toCompileTo('visible content');
    });

    it('should work with nested if conditions', function() {
      expectTemplate(
        '{{#if user.isActive}}{{#if user.hasAccess}}{{user.name}}{{/if}}{{/if}}'
      )
        .withInput({
          user: {
            isActive: true,
            hasAccess: true,
            name: 'John'
          }
        })
        .withCompileOptions({ allowedVariables: ['user'] })
        .toCompileTo('John');
    });
  });
});
