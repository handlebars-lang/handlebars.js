var Handlebars = require("handlebars/compiler").Handlebars;

Handlebars.AST                = require("handlebars/ast").AST;
Handlebars.HandlebarsLexer    = require("handlebars/handlebars_lexer").Lexer;
Handlebars.PrintVisitor       = require("handlebars/printer").PrintVisitor;
Handlebars.Runtime            = require("handlebars/runtime").Runtime;
Handlebars.Context            = require("Handlebars/runtime").Context;
Handlebars.Utils              = require("handlebars/utils").Utils;
Handlebars.SafeString         = require("handlebars/utils").SafeString;
Handlebars.Exception          = require("handlebars/utils").Exception;
Handlebars.Compiler           = require("handlebars/vm").Compiler;
Handlebars.JavaScriptCompiler = require("handlebars/vm").JavaScriptCompiler;
Handlebars.VM                 = require("handlebars/vm").VM;

// BEGIN(BROWSER)

// END(BROWSER)

exports.Handlebars = Handlebars;
