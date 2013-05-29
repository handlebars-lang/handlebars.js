require "rubygems"
require "bundler/setup"

def compile_parser
  system "./node_modules/.bin/jison -m js src/handlebars.yy src/handlebars.l"
  if $?.success?
    File.open("lib/handlebars/compiler/parser.js", "w") do |file|
      file.puts File.read("src/parser-prefix.js") + File.read("handlebars.js") + File.read("src/parser-suffix.js")
    end

    sh "rm handlebars.js"
  else
    fail "Failed to run Jison."
  end
end

file "lib/handlebars/compiler/parser.js" => ["src/handlebars.yy","src/handlebars.l"] do
  if File.exists?('./node_modules/jison')
    compile_parser
  else
    puts "Jison is not installed. Trying `npm install jison`."
    sh "npm install"
    compile_parser
  end
end

task :compile => "lib/handlebars/compiler/parser.js"

desc "run the spec suite"
task :spec => [:release] do
  rc = system "rspec -cfs spec"
  fail "rspec spec failed with exit code #{$?.exitstatus}" if (rc.nil? || ! rc || $?.exitstatus != 0)
end

desc "run the npm test suite"
task :npm_test => [:release] do
  rc = system "npm test"
  fail "npm test failed with exit code #{$?.exitstatus}" if (rc.nil? || ! rc || $?.exitstatus != 0)
end

task :default => [:compile, :spec, :npm_test]

def remove_exports(string)
  match = string.match(%r{^// BEGIN\(BROWSER\)\n(.*)\n^// END\(BROWSER\)}m)
  match ? match[1] : string
end

minimal_deps = %w(browser-prefix base compiler/parser compiler/base compiler/ast utils compiler/compiler runtime browser-suffix).map do |file|
  "lib/handlebars/#{file}.js"
end

runtime_deps = %w(browser-prefix base utils runtime browser-suffix).map do |file|
  "lib/handlebars/#{file}.js"
end

directory "dist"

minimal_deps.unshift "dist"

def build_for_task(task)
  FileUtils.rm_rf("dist/*") if File.directory?("dist")
  FileUtils.mkdir_p("dist")

  contents = ["/*\n\n" + File.read('LICENSE') + "\n*/\n"]
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

task :build => [:compile] do |task|
  # Since the tests are dependent on this always rebuild.
  Rake::Task["dist/handlebars.js"].execute
end
task :runtime => [:compile] do |task|
  # Since the tests are dependent on this always rebuild.
  Rake::Task["dist/handlebars.runtime.js"].execute
end

# Updates the various version numbers.
task :version => [] do |task|
  # TODO : Pull from package.json when the version numbers are synced
  version = File.read("lib/handlebars/base.js").match(/Handlebars.VERSION = "(.*)";/)[1]

  content = File.read("bower.json")
  File.open("bower.json", "w") do |file|
    file.puts content.gsub(/"version":.*/, "\"version\": \"#{version}\",")
  end

  content = File.read("handlebars.js.nuspec")
  File.open("handlebars.js.nuspec", "w") do |file|
    file.puts content.gsub(/<version>.*<\/version>/, "<version>#{version}</version>")
  end
end

task :minify => [] do |task|
  system "./node_modules/.bin/uglifyjs --comments -o dist/handlebars.min.js dist/handlebars.js"
  system "./node_modules/.bin/uglifyjs --comments -o dist/handlebars.runtime.min.js dist/handlebars.runtime.js"
end

desc "build the build and runtime version of handlebars"
task :release => [:version, :build, :runtime, :minify]

directory "vendor"

desc "benchmark against dust.js and mustache.js"
task :bench => "vendor" do
  require "open-uri"

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
