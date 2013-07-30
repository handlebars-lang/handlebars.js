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
task :spec => [:build] do
  rc = system "npm test"
  fail "npm test failed with exit code #{$?.exitstatus}" if (rc.nil? || ! rc || $?.exitstatus != 0)
end

task :default => [:compile, :spec]

def remove_exports(string)
  match = string.match(%r{^// BEGIN\(BROWSER\)\n(.*)\n^// END\(BROWSER\)}m)
  match ? match[1] : string
end

minimal_deps = %w(browser-prefix base compiler/parser compiler/base compiler/ast utils compiler/compiler compiler/javascript-compiler runtime browser-suffix).map do |file|
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

  contents = ["/*\n\n" + File.read('LICENSE') + "\n@license\n*/\n"]
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
  Rake::Task["dist/handlebars.js"].execute
  Rake::Task["dist/handlebars.runtime.js"].execute

  system "./node_modules/.bin/uglifyjs -m -c --comments -o dist/handlebars.min.js dist/handlebars.js"
  system "./node_modules/.bin/uglifyjs -m -c --comments -o dist/handlebars.runtime.min.js dist/handlebars.runtime.js"
end

# Updates the various version numbers.
desc "Updates the current release version"
task :version, [:version] => [] do |task, args|
  version = args.version
  fail "Must provide a version number" unless version

  changed = %x{git diff-index --name-only HEAD --}
  fail "The repository must be clean" unless $?.success? && changed.empty?

  puts "Updating to version #{version}"

  content = File.read("lib/handlebars/base.js")
  File.open("lib/handlebars/base.js", "w") do | file|
    file.puts content.gsub(/Handlebars.VERSION = "(.*)";/, "Handlebars.VERSION = \"#{version}\";")
  end

  content = File.read("bower.json")
  File.open("bower.json", "w") do |file|
    file.puts content.gsub(/"version":.*/, "\"version\": \"#{version}\",")
  end

  content = File.read("handlebars.js.nuspec")
  File.open("handlebars.js.nuspec", "w") do |file|
    file.puts content.gsub(/<version>.*<\/version>/, "<version>#{version}</version>")
  end

  Rake::Task[:build].invoke
  Rake::Task[:spec].invoke

  # TODO : Make sure that all of these files are updated properly in git then run npm version
end


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

def dist_files(&block)
  map = {}

  root = File.expand_path(File.dirname(__FILE__)) + '/dist/'

  files = ['handlebars.js', 'handlebars.min.js', 'handlebars.runtime.js', 'handlebars.runtime.min.js'].map { |file| root + file }
  files = files.map do |file|
    basename = Pathname.new(file).basename.sub_ext('')
    map[file] = yield basename
  end
  map
end

def publish_s3(files)
  access_key_id = ENV['S3_ACCESS_KEY_ID']
  secret_access_key = ENV['S3_SECRET_ACCESS_KEY']
  bucket_name = ENV['S3_BUCKET_NAME']

  if files && access_key_id && secret_access_key && bucket_name
    require 'aws-sdk'
    s3 = AWS::S3.new(access_key_id: access_key_id,secret_access_key: secret_access_key)
    bucket = s3.buckets[bucket_name]
    files.each do |source, outputs|
      s3_objs = outputs.map do |file|
        bucket.objects[file]
      end
      s3_objs.each { |obj| obj.write(Pathname.new(source)) }
    end
  else
    puts "Not uploading any files to S3!"
  end
end

task :publish do
  rev = `git rev-parse --short HEAD`.to_s.strip
  master_rev = `git rev-parse --short origin/master`.to_s.strip

  if rev == master_rev
    files = dist_files do |basename|
      ["#{basename}-latest.js", "#{basename}-#{rev}.js"]
    end
  end

  publish_s3 files
end

task :publish_version do
  tag = `git tag -l --points-at HEAD`.to_s.strip.split(/\n/)
  fail "The current commit must be tagged." if tag.empty?
  fail "Multiple tags, aborting: #{tag}" if tag.length > 1
  tag = tag.first

  files = dist_files do |basename|
    ["#{basename}-#{tag}.js"]
  end
  publish_s3 files
end
