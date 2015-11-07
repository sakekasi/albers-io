var color = require('dominant-color'),
    fs    = require('fs'),
    path  = require('path'),
    async = require('async');

var dirName = '../tumblrip/target/gurafiku-images/'

var images = fs.readdirSync(dirName)
               .filter(function(fileName){
                 return fileName.substring(fileName.length - 4) === ".png" ||
                        fileName.substring(fileName.length - 4) === ".jpg";
               });

var output = [];
var count = 0;
async.eachSeries(images,
  function(fileName, done){
    var c;
    console.log(fileName);
    try{
      color(path.join(dirName, fileName), {format: 'rgb'}, function(err, c){
        console.error(err, c);
        if(c.length >= 3){
          output.push(c.slice(0,3));
        }
        done();
      });
    } catch(e) {
      console.error(e);
      done();
    }
  },
  function(err){
    console.error(err);
    console.log("writing", output.length, "records to the file");
    var file = fs.openSync('./colors.json', 'w');
    fs.writeSync(file, JSON.stringify({colors: output}));
  }
);
