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

    def self.remove_exports(string)
      match = string.match(%r{\A(.*?)^// BEGIN\(BROWSER\)\n(.*)\n^// END\(BROWSER\)(.*?)\Z}m)
      prelines = match ? match[1].count("\n") + 1 : 0
      ret = match ? match[2] : string
      ("\n" * prelines) + ret
    end

    def self.js_load(file)
      str = File.read(file)
      CONTEXT.eval(remove_exports(str), file)
    end

    CONTEXT = V8::Context.new
    CONTEXT.instance_eval do |context|
      context["exports"] = nil

      context["p"] = proc do |val|
        p val if ENV["DEBUG_JS"]
      end

      context["puts"] = proc do |val|
        puts val if ENV["DEBUG_JS"]
      end

      context["puts_node"] = proc do |val|
        puts context["Handlebars"]["PrintVisitor"].new.accept(val)
        puts
      end

      context["puts_caller"] = proc do
        puts "BACKTRACE:"
        puts Handlebars::Spec.js_backtrace(context)
        puts
      end

      Handlebars::Spec.js_load('lib/handlebars/parser.js')
      Handlebars::Spec.js_load('lib/handlebars/base.js');
      Handlebars::Spec.js_load('lib/handlebars/ast.js');
      Handlebars::Spec.js_load('lib/handlebars/visitor.js');
      Handlebars::Spec.js_load('lib/handlebars/printer.js')
      Handlebars::Spec.js_load('lib/handlebars/runtime.js')
      Handlebars::Spec.js_load('lib/handlebars/utils.js')
      Handlebars::Spec.js_load('lib/handlebars/vm.js')
      Handlebars::Spec.js_load('lib/handlebars.js')

      context["Handlebars"]["logger"]["level"] = ENV["DEBUG_JS"] ? context["Handlebars"]["logger"][ENV["DEBUG_JS"]] : 4

      context["Handlebars"]["logger"]["log"] = proc do |level, str|
        logger_level = context["Handlebars"]["logger"]["level"].to_i

        if logger_level <= level
          puts str
        end
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
