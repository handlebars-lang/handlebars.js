require "rubygems"
require "bundler/setup"

def compile_parser
  system "./node_modules/jison/lib/jison/cli-wrapper.js src/handlebars.yy src/handlebars.l"
  if $?.success?
    File.open("lib/handlebars/compiler/parser.js", "w") do |file|
      file.puts File.read("handlebars.js") + ";"
    end

    sh "rm handlebars.js"
  else
    puts "Failed to run Jison."
  end
end

file "lib/handlebars/compiler/parser.js" => ["src/handlebars.yy","src/handlebars.l"] do
  if File.exists?('./node_modules/jison/lib/jison/cli-wrapper.js')
    compile_parser
  else
    puts "Jison is not installed. Trying `npm install jison`."
    sh "npm install jison"
    compile_parser
  end
end

task :compile => "lib/handlebars/compiler/parser.js"

desc "run the spec suite"
task :spec => [:release] do
  rc = system "rspec -cfs spec"
  fail "rspec spec failed with exit code #{$?.exitstatus}" if (rc.nil? || ! rc || $?.exitstatus != 0)
end

task :default => [:compile, :spec]

def remove_exports(string)
  match = string.match(%r{^// BEGIN\(BROWSER\)\n(.*)\n^// END\(BROWSER\)}m)
  match ? match[1] : string
end

minimal_deps = %w(base compiler/parser compiler/base compiler/ast utils compiler/compiler runtime).map do |file|
  "lib/handlebars/#{file}.js"
end

runtime_deps = %w(base utils runtime).map do |file|
  "lib/handlebars/#{file}.js"
end

directory "dist"

minimal_deps.unshift "dist"

def build_for_task(task)
  FileUtils.rm_rf("dist/*") if File.directory?("dist")
  FileUtils.mkdir_p("dist")

  contents = []
  task.prerequisites.each do |filename|
    next if filename == "dist"

    contents << "// #{filename}\n" + remove_exports(File.read(filename)) + ";"
  end

  File.open(task.name, "w") do |file|
    file.puts contents.join("\n")
  end
end

file "dist/handlebars.js" => minimal_deps do |task|
  build_for_task(task)
end

file "dist/handlebars.runtime.js" => runtime_deps do |task|
  build_for_task(task)
end

task :build => [:compile, "dist/handlebars.js"]
task :runtime => [:compile, "dist/handlebars.runtime.js"]

desc "build the build and runtime version of handlebars"
task :release => [:build, :runtime]

directory "vendor"

desc "benchmark against dust.js and mustache.js"
task :bench => "vendor" do
  require "open-uri"
  #File.open("vendor/mustache.js", "w") do |file|
    #file.puts open("https://github.com/janl/mustache.js/raw/master/mustache.js").read
    #file.puts "module.exports = Mustache;"
  #end

  File.open("vendor/benchmark.js", "w") do |file|
    file.puts open("https://raw.github.com/bestiejs/benchmark.js/master/benchmark.js").read
  end

  #if File.directory?("vendor/dustjs")
    #system "cd vendor/dustjs && git pull"
  #else
    #system "git clone git://github.com/akdubya/dustjs.git vendor/dustjs"
  #end

  #if File.directory?("vendor/coffee")
    #system "cd vendor/coffee && git pull"
  #else
    #system "git clone git://github.com/jashkenas/coffee-script.git vendor/coffee"
  #end

  #if File.directory?("vendor/eco")
    #system "cd vendor/eco && git pull && npm update"
  #else
    #system "git clone git://github.com/sstephenson/eco.git vendor/eco && cd vendor/eco && npm update"
  #end

  system "node bench/handlebars.js"
end
