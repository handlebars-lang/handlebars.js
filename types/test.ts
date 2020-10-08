/* These test cases were imported from https://github.com/DefinitelyTyped/DefinitelyTyped
 * and includes previous contributions from the DefinitelyTyped community.
 * For full history prior to their migration to handlebars.js, please see:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/commits/1ce60bdc07f10e0b076778c6c953271c072bc894/types/handlebars/handlebars-tests.ts
 */

import Handlebars from 'handlebars';
import { HandlebarsTemplateDelegate, hbs } from 'handlebars';

const context = {
  author: { firstName: 'Alan', lastName: 'Johnson' },
  body: 'I Love Handlebars',
  comments: [{
    author: { firstName: 'Yehuda', lastName: 'Katz' },
    body: 'Me too!'
  }]
};
Handlebars.registerHelper('fullName', (person: typeof context.author) => {
  return person.firstName + ' ' + person.lastName;
});

Handlebars.registerHelper('agree_button', function(this: any) {
  return new Handlebars.SafeString(
    '<button>I agree. I ' + this.emotion + ' ' + this.name + '</button>'
  );
});

const source1 = '<p>Hello, my name is {{name}}. I am from {{hometown}}. I have ' +
                '{{kids.length}} kids:</p>' +
                '<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>';
const template1 = Handlebars.compile(source1);
template1({ name: "Alan", hometown: "Somewhere, TX", kids: [{name: "Jimmy", age: 12}, {name: "Sally", age: 4}]});

Handlebars.registerHelper('link_to', (context: typeof post) => {
  return '<a href="' + context.url + '">' + context.body + '</a>';
});
const post = { url: "/hello-world", body: "Hello World!" };
const context2 = { posts: [post] };
const source2 = '<ul>{{#posts}}<li>{{{link_to this}}}</li>{{/posts}}</ul>';
const template2: HandlebarsTemplateDelegate<{ posts: { url: string, body: string }[] }> = Handlebars.compile(source2);
template2(context2);

Handlebars.registerHelper('link_to', (title: string, context: typeof post) => {
  return '<a href="/posts' + context.url + '">' + title + '!</a>';
});
const context3 = { posts: [{url: '/hello-world', body: 'Hello World!'}] };
const source3 = '<ul>{{#posts}}<li>{{{link_to "Post" this}}}</li>{{/posts}}</ul>';
const template3 = Handlebars.compile<typeof context3>(source3);
template3(context3);

const source4 = '<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>';
Handlebars.registerHelper('link', function(this: any, context: any) {
  return '<a href="/people/' + this.id + '">' + context.fn(this) + '</a>';
});
const template4 = Handlebars.compile<{ people: { name: string, id: number }[] }>(source4);
const data2 = { 'people': [
    { 'name': 'Alan', 'id': 1 },
    { 'name': 'Yehuda', 'id': 2 }
]};
template4(data2);

const source5 = '<ul>{{#people}}<li>{{> link}}</li>{{/people}}</ul>';
Handlebars.registerPartial('link', '<a href="/people/{{id}}">{{name}}</a>');
const template5 = Handlebars.compile(source5);
const data3 = { 'people': [
    { 'name': 'Alan', 'id': 1 },
    { 'name': 'Yehuda', 'id': 2 }
]};
template5(data3);

const source6 = '{{#list nav}}<a href="{{url}}">{{title}}</a>{{/list}}';
const template6 = Handlebars.compile(source6);
Handlebars.registerHelper('list', (context, options: Handlebars.HelperOptions) => {
  let ret = "<ul>";
  for(let i=0, j=context.length; i<j; i++) {
    ret = ret + "<li>" + options.fn(context[i]) + "</li>";
  }
  return ret + "</ul>";
});
template6([{url:"", title:""}]);


const escapedExpression = Handlebars.Utils.escapeExpression('<script>alert(\'xss\');</script>');

Handlebars.helpers !== undefined;

const parsedTmpl = Handlebars.parse('<p>Hello, my name is {{name}}.</p>', {
  srcName: "/foo/bar/baz.hbs",
  ignoreStandalone: true
});

const parsedTmplWithoutOptions = Handlebars.parse('<p>Hello, my name is {{name}}.</p>');

// Custom partial resolution.
const originalResolvePartial = Handlebars.VM.resolvePartial;
Handlebars.VM.resolvePartial = <T>(partial: HandlebarsTemplateDelegate<T> | undefined, context: any, options: Handlebars.ResolvePartialOptions): HandlebarsTemplateDelegate<T> => {
  const name = options.name.replace(/my/,'your');
  // transform name.
  options.name = name;
  return originalResolvePartial(partial, context, options);
};


// #1544, allow custom helpers in knownHelpers
Handlebars.compile('test', {
  knownHelpers: {
    each: true,
    customHelper: true
  }
});

Handlebars.compile('test')({},{allowCallsToHelperMissing: true});

Handlebars.compile('test')({},{});


const allthings = {} as hbs.AST.MustacheStatement |
  hbs.AST.BlockStatement |
  hbs.AST.PartialStatement |
  hbs.AST.PartialBlockStatement |
  hbs.AST.ContentStatement |
  hbs.AST.CommentStatement |
  hbs.AST.SubExpression |
  hbs.AST.PathExpression |
  hbs.AST.StringLiteral |
  hbs.AST.BooleanLiteral |
  hbs.AST.NumberLiteral |
  hbs.AST.UndefinedLiteral |
  hbs.AST.NullLiteral |
  hbs.AST.Hash |
  hbs.AST.HashPair;

switch(allthings.type) {
  case "MustacheStatement":
    let mustacheStatement: hbs.AST.MustacheStatement;
    mustacheStatement = allthings;
    break;
  case "BlockStatement":
    let blockStatement: hbs.AST.BlockStatement;
    blockStatement = allthings;
    break;
  case "PartialStatement":
    let partialStatement: hbs.AST.PartialStatement;
    partialStatement = allthings;
    break;
  case "PartialBlockStatement":
    let partialBlockStatement: hbs.AST.PartialBlockStatement;
    partialBlockStatement = allthings;
    break;
  case "ContentStatement":
    let ContentStatement: hbs.AST.ContentStatement;
    ContentStatement = allthings;
    break;
  case "CommentStatement":
    let CommentStatement: hbs.AST.CommentStatement;
    CommentStatement = allthings;
    break;
  case "SubExpression":
    let SubExpression: hbs.AST.SubExpression;
    SubExpression = allthings;
    break;
  case "PathExpression":
    let PathExpression: hbs.AST.PathExpression;
    PathExpression = allthings;
    break;
  case "StringLiteral":
    let StringLiteral: hbs.AST.StringLiteral;
    StringLiteral = allthings;
    break;
  case "BooleanLiteral":
    let BooleanLiteral: hbs.AST.BooleanLiteral;
    BooleanLiteral = allthings;
    break;
  case "NumberLiteral":
    let NumberLiteral: hbs.AST.NumberLiteral;
    NumberLiteral = allthings;
    break;
  case "UndefinedLiteral":
    let UndefinedLiteral: hbs.AST.UndefinedLiteral;
    UndefinedLiteral = allthings;
    break;
  case "NullLiteral":
    let NullLiteral: hbs.AST.NullLiteral;
    NullLiteral = allthings;
    break;
  case "Hash":
    let Hash: hbs.AST.Hash;
    Hash = allthings;
    break;
  case "HashPair":
    let HashPair: hbs.AST.HashPair;
    HashPair = allthings;
    break;
  default:
    break;
}

function testParseWithoutProcessing() {
  const parsedTemplate: hbs.AST.Program = Handlebars.parseWithoutProcessing('<p>Hello, my name is {{name}}.</p>', {
    srcName: "/foo/bar/baz.hbs",
  });

  const parsedTemplateWithoutOptions: hbs.AST.Program = Handlebars.parseWithoutProcessing('<p>Hello, my name is {{name}}.</p>');
}

function testExceptionTypings() {
  // Test exception constructor with a single argument - message.
  let exception: Handlebars.Exception = new Handlebars.Exception('message');

  // Fields
  let message: string = exception.message;
  let lineNumber: number = exception.lineNumber;
  let column: number = exception.column;
  let endLineNumber: number = exception.endLineNumber;
  let endColumn: number = exception.endColumn;
  let description = exception.description;
  let name: string = exception.name;
  let fileName: string = exception.fileName;
  let stack: string | undefined = exception.stack;
}

function testExceptionWithNodeTypings() {
  // Test exception constructor with both arguments.
  const exception: Handlebars.Exception = new Handlebars.Exception('message', {
    type: 'MustacheStatement',
    loc: {
      source: 'source',
      start: { line: 1, column: 5 },
      end: { line: 10, column: 2 }
    }
  });

  // Fields
  let message: string = exception.message;
  let lineNumber: number = exception.lineNumber;
  let column: number = exception.column;
  let endLineNumber: number = exception.endLineNumber;
  let endColumn: number = exception.endColumn;
  let description = exception.description;
  let name: string = exception.name;
  let fileName: string = exception.fileName;
  let stack: string | undefined = exception.stack;
}

function testProtoAccessControlControlOptions() {
  Handlebars.compile('test')(
    {},
    {
      allowedProtoMethods: { allowedMethod: true, forbiddenMethod: false },
      allowedProtoProperties: { allowedProperty: true, forbiddenProperty: false },
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: false,
      partials: {
        link: '<a href="/people/{{id}}">{{name}}</a>'
      }
    }
  );
}

function testHandlebarsVersion() {
  let version: string = Handlebars.VERSION;
}
