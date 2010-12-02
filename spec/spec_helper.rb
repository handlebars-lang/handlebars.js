require "v8"

# Monkey patches due to bugs in RubyRacer
class V8::JSError
  def initialize(try, to)
    @to = to
    begin
      super(initialize_unsafe(try))
    rescue Exception => e
      # Original code does not make an Array here
      @boundaries = [Boundary.new(:rbframes => e.backtrace)]
      @value = e
      super("BUG! please report. JSError#initialize failed!: #{e.message}")
    end
  end

  def parse_js_frames(try)
    raw = @to.rb(try.StackTrace())
    if raw && !raw.empty?
      raw.split("\n")[1..-1].tap do |frames|
        # Original code uses strip!, and the frames are not guaranteed to be strippable
        frames.each {|frame| frame.strip.chomp!(",")}
      end
    else
      []
    end
  end
end

module Handlebars
  module Spec
    CONTEXT = V8::Context.new
    CONTEXT.instance_eval do |context|
      context.eval("exports = null")
      context.eval("Handlebars = {}")

      context.load('lib/handlebars/ast.js')
      context.load('lib/handlebars/jison_ext.js')
      context.load('lib/handlebars/handlebars_lexer.js')
      context.load('lib/handlebars/printer.js')
      context.load('lib/handlebars/parser.js')
      context.load('lib/handlebars/runtime.js')
      context.load('lib/handlebars/utils.js')
      context.load('lib/handlebars.js')
    end
  end
end


require "test/unit/assertions"

RSpec.configure do |config|
  config.include Test::Unit::Assertions

  config.before(:all) do
    @context = Handlebars::Spec::CONTEXT
  end
end
