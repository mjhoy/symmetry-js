ENV["RAPHAEL_URL"] ||= "https://github.com/DmitryBaranovskiy/raphael/raw/master/raphael.js"
ENV["UNDERSCORE_URL"] ||= "http://documentcloud.github.com/underscore/underscore.js"

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
