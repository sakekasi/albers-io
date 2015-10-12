var color = require('dominant-color'),
    fs    = require('fs'),
    path  = require('path'),
    async = require('async');

var dirName = '../images/prettycolors/'

var images = fs.readdirSync(dirName)
               .filter(function(fileName){
                 return fileName.substring(fileName.length - 4) === ".png";
               })
               .slice(0, 1000);

var output = [];
var count = 0;
async.each(images,
  function(fileName, done){
    var c;
    console.log(fileName);
    color(path.join(dirName, fileName), {format: 'rgb'}, function(err, c){
      console.log(err, c);
      if(c.length === 4){
        output.push(c.slice(0,3));
      }
      done();
    });
  },
  function(err){
    var file = fs.openSync('./colors.json', 'w');
    fs.writeSync(file, JSON.stringify({colors: output}));
  }
);
