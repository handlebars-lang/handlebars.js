require "rubygems"
require "bundler/setup"

file "lib/handlebars/parser.js" => "src/handlebars.yy" do
  system "jison src/handlebars.yy"
  sh "mv handlebars.js lib/handlebars/parser.js"
end

task :build => "lib/handlebars/parser.js"

task :test => :build do
  system "rspec -cfs spec"
end

task :default => [:build, :test]
