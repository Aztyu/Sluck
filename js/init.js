let fs = require('fs');

var SERVER_URL;
var UPDATE_MESSAGE_TIME;
var PSEUDO_TIME;
var UPDATE_INVITE;
var UPDATE_CONTACT;

//Lecture du fichier de configuration
fs.readFile('properties/configuration.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var conf = JSON.parse(data);
  SERVER_URL = conf.server_url;
  UPDATE_MESSAGE_TIME = conf.update_time;
  PSEUDO_TIME = conf.pseudo_time;
  UPDATE_INVITE = conf.update_invite;
  UPDATE_CONTACT = conf.update_contact;
});
