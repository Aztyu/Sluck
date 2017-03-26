let fs = require('fs');

var SERVER_URL;
var UPDATE_TIME;

//Lecture du fichier de configuration
fs.readFile('properties/configuration.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var conf = JSON.parse(data);
  SERVER_URL = conf.server_url;
  UPDATE_TIME = conf.update_time;
});
