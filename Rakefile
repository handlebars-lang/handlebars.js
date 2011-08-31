require "rubygems"
require "bundler/setup"

file "lib/handlebars/compiler/parser.js" => ["src/handlebars.yy","src/handlebars.l"] do
  if ENV['PATH'].split(':').any? {|folder| File.exists?(folder+'/jison')}
    system "jison src/handlebars.yy src/handlebars.l"
    File.open("lib/handlebars/compiler/parser.js", "w") do |file|
      file.puts File.read("handlebars.js") + ";"
    end

    sh "rm handlebars.js"
  else
    puts "Jison is not installed. Try running `npm install jison`."
  end
end

task :compile => "lib/handlebars/compiler/parser.js"

desc "run the spec suite"
task :spec => [:release] do
  system "rspec -cfs spec"
end

task :default => [:compile, :spec]

def remove_exports(string)
  match = string.match(%r{^// BEGIN\(BROWSER\)\n(.*)\n^// END\(BROWSER\)}m)
  match ? match[1] : string
end

minimal_deps = %w(base compiler/parser compiler/base compiler/ast utils compiler/compiler vm).map do |file|
  "lib/handlebars/#{file}.js"
end

vm_deps = %w(base utils vm).map do |file|
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

file "dist/handlebars.vm.js" => vm_deps do |task|
  build_for_task(task)
end

task :build => [:compile, "dist/handlebars.js"]
task :vm => [:compile, "dist/handlebars.vm.js"]

desc "build the build and vm version of handlebars"
task :release => [:build, :vm]

directory "vendor"

desc "benchmark against dust.js and mustache.js"
task :bench => "vendor" do
  require "open-uri"
  File.open("vendor/mustache.js", "w") do |file|
    file.puts open("https://github.com/janl/mustache.js/raw/master/mustache.js").read
    file.puts "module.exports = Mustache;"
  end

  File.open("vendor/benchmark.js", "w") do |file|
    file.puts open("https://github.com/mathiasbynens/benchmark.js/raw/master/benchmark.js").read
  end

  if File.directory?("vendor/dustjs")
    system "cd vendor/dustjs && git pull"
  else
    system "git clone git://github.com/akdubya/dustjs.git vendor/dustjs"
  end

  if File.directory?("vendor/coffee")
    system "cd vendor/coffee && git pull"
  else
    system "git clone git://github.com/jashkenas/coffee-script.git vendor/coffee"
  end

  if File.directory?("vendor/eco")
    system "cd vendor/eco && git pull && npm update"
  else
    system "git clone git://github.com/sstephenson/eco.git vendor/eco && cd vendor/eco && npm update"
  end

  system "node bench/handlebars.js"
end
