import { expect, test, describe } from 'tstyche';
import Handlebars from 'handlebars';
import runtime from 'handlebars/runtime';
import * as runtimeModule from 'handlebars/runtime';
import type runtimeRequire = require('handlebars/runtime');
import {
  HandlebarsTemplatable,
  HandlebarsTemplateDelegate,
  HandlebarsTemplates,
  TemplateSpecification,
  KnownHelpers,
  BuiltinHelperName,
  CustomHelperName,
  Logger,
  CompilerInfo,
  hbs,
} from 'handlebars';

// ---------------------------------------------------------------------------
// Handlebars.compile
// ---------------------------------------------------------------------------
describe('Handlebars.compile', () => {
  test('returns a HandlebarsTemplateDelegate', () => {
    expect(Handlebars.compile('{{name}}')).type.toBe<
      HandlebarsTemplateDelegate<any>
    >();
  });

  test('returns a typed delegate when generic is specified', () => {
    expect(Handlebars.compile<{ name: string }>('{{name}}')).type.toBe<
      HandlebarsTemplateDelegate<{ name: string }>
    >();
  });

  test('compiled template returns string', () => {
    const template = Handlebars.compile('{{name}}');
    expect(template({})).type.toBe<string>();
  });

  test('accepts CompileOptions', () => {
    expect(
      Handlebars.compile('test', { strict: true, noEscape: true })
    ).type.not.toRaiseError();
  });

  test('accepts knownHelpers with built-in and custom names', () => {
    expect(
      Handlebars.compile('test', {
        knownHelpers: { each: true, customHelper: true },
      })
    ).type.not.toRaiseError();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.precompile
// ---------------------------------------------------------------------------
describe('Handlebars.precompile', () => {
  test('returns TemplateSpecification', () => {
    expect(
      Handlebars.precompile('{{name}}')
    ).type.toBe<TemplateSpecification>();
  });

  test('accepts PrecompileOptions', () => {
    expect(
      Handlebars.precompile('test', { srcName: 'a.hbs', destName: 'a.js' })
    ).type.not.toRaiseError();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.template
// ---------------------------------------------------------------------------
describe('Handlebars.template', () => {
  test('returns HandlebarsTemplateDelegate', () => {
    const spec = {} as TemplateSpecification;
    expect(Handlebars.template(spec)).type.toBe<
      HandlebarsTemplateDelegate<any>
    >();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.registerHelper / unregisterHelper
// ---------------------------------------------------------------------------
describe('Handlebars.registerHelper', () => {
  test('accepts name and function', () => {
    expect(
      Handlebars.registerHelper('myHelper', (ctx: any) => 'result')
    ).type.toBe<void>();
  });

  test('accepts a spec object', () => {
    expect(
      Handlebars.registerHelper({ myHelper: () => 'result' })
    ).type.toBe<void>();
  });
});

describe('Handlebars.unregisterHelper', () => {
  test('accepts a name', () => {
    expect(Handlebars.unregisterHelper('myHelper')).type.toBe<void>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.registerPartial / unregisterPartial
// ---------------------------------------------------------------------------
describe('Handlebars.registerPartial', () => {
  test('accepts name and string', () => {
    expect(
      Handlebars.registerPartial('myPartial', '<div>{{name}}</div>')
    ).type.toBe<void>();
  });

  test('accepts spec object', () => {
    expect(
      Handlebars.registerPartial({ myPartial: '<div>{{name}}</div>' })
    ).type.toBe<void>();
  });
});

describe('Handlebars.unregisterPartial', () => {
  test('accepts a name', () => {
    expect(Handlebars.unregisterPartial('myPartial')).type.toBe<void>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.registerDecorator / unregisterDecorator
// ---------------------------------------------------------------------------
describe('Handlebars.registerDecorator', () => {
  test('accepts name and function', () => {
    expect(
      Handlebars.registerDecorator('myDecorator', () => {})
    ).type.toBe<void>();
  });
});

describe('Handlebars.unregisterDecorator', () => {
  test('accepts a name', () => {
    expect(Handlebars.unregisterDecorator('myDecorator')).type.toBe<void>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars utility functions
// ---------------------------------------------------------------------------
describe('Handlebars utility functions', () => {
  test('K returns void', () => {
    expect(Handlebars.K()).type.toBe<void>();
  });

  test('createFrame returns any', () => {
    expect(Handlebars.createFrame({})).type.toBe<any>();
  });

  test('blockParams returns any[]', () => {
    expect(Handlebars.blockParams([], [])).type.toBe<any[]>();
  });

  test('log returns void', () => {
    expect(Handlebars.log(1, 'message')).type.toBe<void>();
  });

  test('noConflict returns typeof Handlebars', () => {
    expect(Handlebars.noConflict()).type.toBe<typeof Handlebars>();
  });

  test('escapeExpression is exported at top level', () => {
    expect(Handlebars.escapeExpression('test')).type.toBe<string>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.HelperOptions
// ---------------------------------------------------------------------------
describe('Handlebars.HelperOptions', () => {
  test('fn and inverse are callable TemplateDelegates', () => {
    const options = {} as Handlebars.HelperOptions;
    expect(options.fn({})).type.toBe<string>();
    expect(options.inverse({})).type.toBe<string>();
  });

  test('hash is a Record', () => {
    const options = {} as Handlebars.HelperOptions;
    expect(options.hash).type.toBe<Record<string, any>>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.SafeString
// ---------------------------------------------------------------------------
describe('Handlebars.SafeString', () => {
  test('is constructable with string', () => {
    expect(
      new Handlebars.SafeString('<b>bold</b>')
    ).type.toBe<Handlebars.SafeString>();
  });

  test('toString returns string', () => {
    const safe = new Handlebars.SafeString('test');
    expect(safe.toString()).type.toBe<string>();
  });

  test('toHTML returns string', () => {
    const safe = new Handlebars.SafeString('test');
    expect(safe.toHTML()).type.toBe<string>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.Exception
// ---------------------------------------------------------------------------
describe('Handlebars.Exception', () => {
  test('is constructable with message only', () => {
    expect(new Handlebars.Exception('error')).type.toBe<Handlebars.Exception>();
  });

  test('is constructable with message and node', () => {
    expect(
      new Handlebars.Exception('error', {
        type: 'MustacheStatement',
        loc: {
          source: 'source',
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      })
    ).type.not.toRaiseError();
  });

  test('has all expected fields', () => {
    const ex = new Handlebars.Exception('msg');
    expect(ex.message).type.toBe<string>();
    expect(ex.name).type.toBe<string>();
    expect(ex.description).type.toBe<string>();
    expect(ex.fileName).type.toBe<string>();
    expect(ex.number).type.toBe<number>();
    expect(ex.lineNumber).type.toBe<any>();
    expect(ex.endLineNumber).type.toBe<any>();
    expect(ex.column).type.toBe<any>();
    expect(ex.endColumn).type.toBe<any>();
    expect(ex.stack).type.toBe<string | undefined>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.Utils
// ---------------------------------------------------------------------------
describe('Handlebars.Utils', () => {
  test('escapeExpression returns string', () => {
    expect(Handlebars.Utils.escapeExpression('<script>')).type.toBe<string>();
  });

  test('createFrame returns any', () => {
    expect(Handlebars.Utils.createFrame({})).type.toBe<any>();
  });

  test('blockParams returns any[]', () => {
    expect(Handlebars.Utils.blockParams([], [])).type.toBe<any[]>();
  });

  test('isEmpty returns boolean', () => {
    expect(Handlebars.Utils.isEmpty(null)).type.toBe<boolean>();
  });

  test('extend returns any', () => {
    expect(Handlebars.Utils.extend({}, {})).type.toBe<any>();
  });

  test('toString returns string', () => {
    expect(Handlebars.Utils.toString(42)).type.toBe<string>();
  });

  test('isArray returns boolean', () => {
    expect(Handlebars.Utils.isArray([])).type.toBe<boolean>();
  });

  test('isFunction returns boolean', () => {
    expect(Handlebars.Utils.isFunction(() => {})).type.toBe<boolean>();
  });

  test('isMap returns boolean', () => {
    expect(Handlebars.Utils.isMap(new Map())).type.toBe<boolean>();
  });

  test('isSet returns boolean', () => {
    expect(Handlebars.Utils.isSet(new Set())).type.toBe<boolean>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars namespace constants
// ---------------------------------------------------------------------------
describe('Handlebars constants', () => {
  test('VERSION is string', () => {
    expect(Handlebars.VERSION).type.toBe<string>();
  });

  test('helpers is a record of HelperDelegate', () => {
    expect(Handlebars.helpers).type.toBe<{
      [name: string]: Handlebars.HelperDelegate;
    }>();
  });

  test('templates is HandlebarsTemplates', () => {
    expect(Handlebars.templates).type.toBe<HandlebarsTemplates>();
  });

  test('partials is a record', () => {
    expect(Handlebars.partials).type.toBe<{ [name: string]: any }>();
  });

  test('decorators is a record', () => {
    expect(Handlebars.decorators).type.toBe<{ [name: string]: Function }>();
  });

  test('logger is Logger', () => {
    expect(Handlebars.logger).type.toBe<Logger>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.create
// ---------------------------------------------------------------------------
describe('Handlebars.create', () => {
  test('returns typeof Handlebars', () => {
    expect(Handlebars.create()).type.toBe<typeof Handlebars>();
  });

  test('retains compiler APIs on full environments', () => {
    const instance = Handlebars.create();
    expect(instance.compile<{ name: string }>('{{name}}')).type.toBe<
      HandlebarsTemplateDelegate<{ name: string }>
    >();
    expect(instance.precompile('{{name}}')).type.toBe<TemplateSpecification>();
    expect(
      Handlebars.noConflict().compile('{{name}}')
    ).type.toBe<HandlebarsTemplateDelegate>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars runtime
// ---------------------------------------------------------------------------
describe('Handlebars runtime', () => {
  test('does not expose compiler APIs', () => {
    expect(runtime.compile).type.toRaiseError(2339);
    expect(runtime.precompile).type.toRaiseError(2339);
    expect(runtime.parse).type.toRaiseError(2339);
    expect(runtime.parseWithoutProcessing).type.toRaiseError(2339);
    expect(runtime.AST).type.toRaiseError(2339);
    expect(runtime.Visitor).type.toRaiseError(2339);
  });

  test('creates runtime-only environments', () => {
    const instance = runtime.create();
    expect(instance.compile).type.toRaiseError(2339);
    expect(instance.precompile).type.toRaiseError(2339);
    expect(instance.parse).type.toRaiseError(2339);
    expect(instance.parseWithoutProcessing).type.toRaiseError(2339);
    expect(instance.AST).type.toRaiseError(2339);
    expect(instance.Visitor).type.toRaiseError(2339);
    expect(instance.create).type.toRaiseError(2339);
    expect(instance.noConflict).type.toRaiseError(2339);
    expect(instance.template<{ name: string }>({})).type.toBe<
      HandlebarsTemplateDelegate<{ name: string }>
    >();
    expect(
      instance.registerHelper('greet', (name: string) => name)
    ).type.toBe<void>();
  });

  test('noConflict preserves the runtime-only singleton', () => {
    const instance = runtime.noConflict();
    expect(instance).type.toBe<typeof runtime>();
    expect(instance.compile).type.toRaiseError(2339);
    expect(instance.precompile).type.toRaiseError(2339);
    expect(instance.create().compile).type.toRaiseError(2339);
    expect(instance.create().precompile).type.toRaiseError(2339);
    expect(instance.template({})).type.toBe<HandlebarsTemplateDelegate>();
  });

  test('namespace imports retain a runtime-only default export', () => {
    expect(runtimeModule.default).type.toBe<typeof runtime>();
    expect(runtimeModule.default.compile).type.toRaiseError(2339);
    expect(runtimeModule.default.precompile).type.toRaiseError(2339);
    expect(runtimeModule.default.create().compile).type.toRaiseError(2339);
    expect(runtimeModule.default.create().precompile).type.toRaiseError(2339);
    expect(
      runtimeModule.default.template({})
    ).type.toBe<HandlebarsTemplateDelegate>();
  });

  test('CommonJS imports retain a runtime-only default export', () => {
    expect<typeof runtimeRequire.default>().type.toBe<typeof runtime>();
    expect<typeof runtimeRequire.default>().type.not.toHaveProperty('compile');
    expect<typeof runtimeRequire.default>().type.not.toHaveProperty(
      'precompile'
    );
    expect<
      ReturnType<typeof runtimeRequire.default.create>
    >().type.not.toHaveProperty('compile');
    expect<
      ReturnType<typeof runtimeRequire.default.create>
    >().type.not.toHaveProperty('precompile');
    expect<
      ReturnType<typeof runtimeRequire.default.noConflict>
    >().type.not.toHaveProperty('compile');
    expect<
      ReturnType<typeof runtimeRequire.default.noConflict>
    >().type.not.toHaveProperty('precompile');
    expect<typeof runtimeRequire.default.template>().type.toBe<
      typeof Handlebars.template
    >();
    expect<typeof runtimeRequire.default.registerHelper>().type.toBe<
      typeof Handlebars.registerHelper
    >();
  });

  test('preserves template generics and runtime options', () => {
    const template = runtime.template<{ name: string }>({});
    expect(template).type.toBe<HandlebarsTemplateDelegate<{ name: string }>>();
    expect(
      template({ name: 'Ada' }, { data: { root: {} } })
    ).type.toBe<string>();
    expect(template({ name: 123 })).type.toRaiseError(2322);
    expect(runtime.template({})).type.toBe<HandlebarsTemplateDelegate>();
  });

  test('preserves registration overloads', () => {
    expect(
      runtime.registerHelper('greet', (name: string) => name)
    ).type.toBe<void>();
    expect(
      runtime.registerHelper({ greet: (name: string) => name })
    ).type.toBe<void>();
    expect(runtime.unregisterHelper('greet')).type.toBe<void>();
    expect(
      runtime.registerPartial('greeting', runtime.template({}))
    ).type.toBe<void>();
    expect(
      runtime.registerPartial({ greeting: runtime.template({}) })
    ).type.toBe<void>();
    expect(runtime.unregisterPartial('greeting')).type.toBe<void>();
    expect(runtime.registerDecorator('decorate', () => {})).type.toBe<void>();
    expect(runtime.unregisterDecorator('decorate')).type.toBe<void>();
  });

  test('preserves runtime classes, utilities, and registries', () => {
    expect(new runtime.SafeString('<b>')).type.toBe<Handlebars.SafeString>();
    expect(new runtime.Exception('error')).type.toBe<Handlebars.Exception>();
    expect(runtime.Utils).type.toBe<typeof Handlebars.Utils>();
    expect(runtime.VM).type.toBe<typeof Handlebars.VM>();
    expect(runtime.escapeExpression('<b>')).type.toBe<string>();
    expect(runtime.createFrame({})).type.toBe<any>();
    expect(runtime.VERSION).type.toBe<string>();
    expect(runtime.helpers).type.toBe<typeof Handlebars.helpers>();
    expect(runtime.partials).type.toBe<typeof Handlebars.partials>();
    expect(runtime.decorators).type.toBe<typeof Handlebars.decorators>();
    expect(runtime.logger).type.toBe<Logger>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.parse / parseWithoutProcessing
// ---------------------------------------------------------------------------
describe('Handlebars.parse', () => {
  test('returns hbs.AST.Program', () => {
    expect(Handlebars.parse('{{name}}')).type.toBe<hbs.AST.Program>();
  });

  test('accepts ParseOptions', () => {
    expect(
      Handlebars.parse('{{name}}', { srcName: 'test.hbs' })
    ).type.toBe<hbs.AST.Program>();
  });
});

describe('Handlebars.parseWithoutProcessing', () => {
  test('returns hbs.AST.Program', () => {
    expect(
      Handlebars.parseWithoutProcessing('{{name}}')
    ).type.toBe<hbs.AST.Program>();
  });
});

// ---------------------------------------------------------------------------
// RuntimeOptions
// ---------------------------------------------------------------------------
describe('RuntimeOptions', () => {
  test('compiled template accepts all RuntimeOptions fields', () => {
    const template = Handlebars.compile('test');
    expect(
      template(
        {},
        {
          partial: true,
          depths: [{}],
          helpers: { myHelper: () => '' },
          partials: { link: '<a>{{name}}</a>' },
          decorators: { myDec: () => {} },
          data: { root: {} },
          blockParams: [[]],
          allowCallsToHelperMissing: true,
          allowedProtoMethods: { foo: true },
          allowedProtoProperties: { bar: false },
          allowProtoMethodsByDefault: true,
          allowProtoPropertiesByDefault: false,
        }
      )
    ).type.toBe<string>();
  });

  test('empty options object is valid', () => {
    const template = Handlebars.compile('test');
    expect(template({}, {})).type.toBe<string>();
  });
});

// ---------------------------------------------------------------------------
// HandlebarsTemplateDelegate generic
// ---------------------------------------------------------------------------
describe('HandlebarsTemplateDelegate generic', () => {
  test('accepts matching context type', () => {
    const template: HandlebarsTemplateDelegate<{ name: string }> =
      Handlebars.compile<{ name: string }>('{{name}}');
    expect(template({ name: 'test' })).type.toBe<string>();
  });
});

// ---------------------------------------------------------------------------
// Handlebars.VM.resolvePartial
// ---------------------------------------------------------------------------
describe('Handlebars.VM.resolvePartial', () => {
  test('accepts expected parameters and returns HandlebarsTemplateDelegate', () => {
    const partial = {} as HandlebarsTemplateDelegate | undefined;
    const context = {};
    const options = {} as Handlebars.ResolvePartialOptions;
    expect(Handlebars.VM.resolvePartial(partial, context, options)).type.toBe<
      HandlebarsTemplateDelegate<any>
    >();
  });

  test('ResolvePartialOptions has expected fields', () => {
    const options = {} as Handlebars.ResolvePartialOptions;
    expect(options.name).type.toBe<string>();
    expect(options.helpers).type.toBe<
      { [name: string]: Function } | undefined
    >();
    expect(options.partials).type.toBe<
      { [name: string]: HandlebarsTemplateDelegate } | undefined
    >();
    expect(options.decorators).type.toBe<
      { [name: string]: Function } | undefined
    >();
    expect(options.data).type.toBe<any>();
  });
});

// ---------------------------------------------------------------------------
// Visitor class
// ---------------------------------------------------------------------------
describe('Handlebars.Visitor', () => {
  test('implements ICompiler', () => {
    expect<Handlebars.Visitor>().type.toBeAssignableTo<Handlebars.ICompiler>();
  });
});

// ---------------------------------------------------------------------------
// Logger interface
// ---------------------------------------------------------------------------
describe('Logger', () => {
  test('has log level constants', () => {
    const logger = {} as Logger;
    expect(logger.DEBUG).type.toBe<number>();
    expect(logger.INFO).type.toBe<number>();
    expect(logger.WARN).type.toBe<number>();
    expect(logger.ERROR).type.toBe<number>();
    expect(logger.level).type.toBe<number>();
  });

  test('has methodMap and log', () => {
    const logger = {} as Logger;
    expect(logger.methodMap).type.toBe<{ [level: number]: string }>();
    expect(logger.log(0, 'msg')).type.toBe<void>();
  });
});

// ---------------------------------------------------------------------------
// Top-level exported types
// ---------------------------------------------------------------------------
describe('top-level exports', () => {
  test('HandlebarsTemplatable has template field', () => {
    const view = {} as HandlebarsTemplatable;
    expect(view.template).type.toBe<HandlebarsTemplateDelegate>();
  });

  test('CompilerInfo is a tuple', () => {
    expect<CompilerInfo>().type.toBe<[number, string]>();
  });

  test('BuiltinHelperName is a string union', () => {
    expect<BuiltinHelperName>().type.toBe<
      | 'helperMissing'
      | 'blockHelperMissing'
      | 'each'
      | 'if'
      | 'unless'
      | 'with'
      | 'log'
      | 'lookup'
    >();
  });

  test('CustomHelperName is string', () => {
    expect<CustomHelperName>().type.toBe<string>();
  });

  test('KnownHelpers accepts builtin and custom helper names', () => {
    expect<{
      each: true;
      myCustom: true;
    }>().type.toBeAssignableTo<KnownHelpers>();
  });
});

// ---------------------------------------------------------------------------
// hbs namespace
// ---------------------------------------------------------------------------
describe('hbs namespace', () => {
  test('hbs.SafeString aliases Handlebars.SafeString', () => {
    expect<hbs.SafeString>().type.toBe<Handlebars.SafeString>();
  });

  test('hbs.Utils aliases typeof Handlebars.Utils', () => {
    expect<hbs.Utils>().type.toBe<typeof Handlebars.Utils>();
  });
});

// ---------------------------------------------------------------------------
// AST discriminated union
// ---------------------------------------------------------------------------
describe('AST discriminated union', () => {
  test('type field narrows AST node types', () => {
    const node = {} as
      | hbs.AST.MustacheStatement
      | hbs.AST.BlockStatement
      | hbs.AST.PartialStatement
      | hbs.AST.PartialBlockStatement
      | hbs.AST.ContentStatement
      | hbs.AST.CommentStatement
      | hbs.AST.SubExpression
      | hbs.AST.PathExpression
      | hbs.AST.StringLiteral
      | hbs.AST.BooleanLiteral
      | hbs.AST.NumberLiteral
      | hbs.AST.UndefinedLiteral
      | hbs.AST.NullLiteral
      | hbs.AST.Hash
      | hbs.AST.HashPair;

    if (node.type === 'MustacheStatement') {
      expect(node).type.toBe<hbs.AST.MustacheStatement>();
    }
    if (node.type === 'BlockStatement') {
      expect(node).type.toBe<hbs.AST.BlockStatement>();
    }
    if (node.type === 'PartialStatement') {
      expect(node).type.toBe<hbs.AST.PartialStatement>();
    }
    if (node.type === 'PartialBlockStatement') {
      expect(node).type.toBe<hbs.AST.PartialBlockStatement>();
    }
    if (node.type === 'ContentStatement') {
      expect(node).type.toBe<hbs.AST.ContentStatement>();
    }
    if (node.type === 'CommentStatement') {
      expect(node).type.toBe<hbs.AST.CommentStatement>();
    }
    if (node.type === 'SubExpression') {
      expect(node).type.toBe<hbs.AST.SubExpression>();
    }
    if (node.type === 'PathExpression') {
      expect(node).type.toBe<hbs.AST.PathExpression>();
    }
    if (node.type === 'StringLiteral') {
      expect(node).type.toBe<hbs.AST.StringLiteral>();
    }
    if (node.type === 'BooleanLiteral') {
      expect(node).type.toBe<hbs.AST.BooleanLiteral>();
    }
    if (node.type === 'NumberLiteral') {
      expect(node).type.toBe<hbs.AST.NumberLiteral>();
    }
    if (node.type === 'UndefinedLiteral') {
      expect(node).type.toBe<hbs.AST.UndefinedLiteral>();
    }
    if (node.type === 'NullLiteral') {
      expect(node).type.toBe<hbs.AST.NullLiteral>();
    }
    if (node.type === 'Hash') {
      expect(node).type.toBe<hbs.AST.Hash>();
    }
    if (node.type === 'HashPair') {
      expect(node).type.toBe<hbs.AST.HashPair>();
    }
  });
});
