require "v8"

RSpec.configure do |config|
  config.before(:all) do
    @context = V8::Context.new
    @context['exports'] = nil
    @context.eval("Handlebars = {}");

    @context.load('lib/handlebars/ast.js')
    @context.load('lib/handlebars/jison_ext.js')
    @context.load('lib/handlebars/handlebars_lexer.js')
    @context.load('lib/handlebars/printer.js')
    @context.load('lib/handlebars/parser.js')
    @context.load('lib/handlebars.js')
  end
end
