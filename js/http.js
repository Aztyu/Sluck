var request = require('request');
var querystring = require('querystring');

var connected_user;
var conversations;
var SERVER_URL = 'http://localhost:8080/server';

function getAuthHeader(){
  if(user){
    return {'Authorization': user.token };
  }
}

function login(name, password){
  var form = {
      name: name,
      password: password
  };

  var formData = querystring.stringify(form);
  var contentLength = formData.length;

  request({
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: SERVER_URL + '/login',
    body: formData,
    method: 'POST'
  }, function (err, res, body) {
    console.log(err);
    console.log(res);
    console.log(body);
    if(res.statusCode == 200){
      user = JSON.parse(body);
    }
  });
}

function listConversation(){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/conversation/list',
    method: 'GET'
  }, function (err, res, body) {
    console.log(err);
    console.log(res);
    console.log(body);
    if(res.statusCode == 200){
      conversations = JSON.parse(body);
    }
  });
}
