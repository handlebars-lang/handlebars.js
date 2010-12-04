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
    def self.js_backtrace(context)
      begin
        context.eval("throw")
      rescue V8::JSError => e
        return e.backtrace(:javascript)
      end
    end

    CONTEXT = V8::Context.new
    CONTEXT.instance_eval do |context|
      context.load('dist/handlebars.debug.js')

      context["p"] = proc do |val|
        p val
      end

      context["puts"] = proc do |val|
        puts context["Handlebars"]["PrintVisitor"].new.accept(val)
        puts
      end

      context["puts_caller"] = proc do
        puts "BACKTRACE:"
        puts Handlebars::Spec.js_backtrace(context)
        puts
      end
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
