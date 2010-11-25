file "lib/handlebars/parser.js" => "src/handlebars.yy" do
  system "jison src/handlebars.yy"
  sh "mv handlebars.js lib/handlebars/parser.js"
end

task :default => "lib/handlebars/parser.js"
