# Raphael 1.5.2
ENV["RAPHAEL_URL"] ||= "https://github.com/DmitryBaranovskiy/raphael/raw/dbe241f4c5310dd9bf3b451c538d78c6c4a0e288/raphael.js"

# Underscore 1.1.2
ENV["UNDERSCORE_URL"] ||= "https://github.com/documentcloud/underscore/raw/1.1.2/underscore.js"

task(:default => "js:install")

namespace :js do

  desc "Download necessary javascript libs to lib/"
  task(:install => ["lib/raphael.js", "lib/underscore.js"] )

  directory "lib"

  file("lib/raphael.js" => "lib") do
    sh "wget #{ENV["RAPHAEL_URL"]} -nv -O lib/raphael.js --no-check-certificate"
  end
  
  file("lib/underscore.js" => "lib") do
    sh "wget #{ENV["UNDERSCORE_URL"]} -nv -O lib/underscore.js --no-check-certificate"
  end

end
