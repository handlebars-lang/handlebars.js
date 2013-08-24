require "rubygems"
require "bundler/setup"

task :default => [:build]

task :build do |task|
  system "grunt"
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
