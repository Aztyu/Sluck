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
  SERVER_URL = "http://localhost:8080/server";
  UPDATE_MESSAGE_TIME = 2000;
  PSEUDO_TIME = 50;
  UPDATE_INVITE = 5000;
  UPDATE_CONTACT = 5000;
});
