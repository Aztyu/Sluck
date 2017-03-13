var request = require('request');
var querystring = require('querystring');

var connected_user;
var conversations;
let SERVER_URL = 'http://localhost:8080/server';    //Adresse de base utilisée pour appeler l'API

function getAuthHeader(){
  if(user){
    return {'Authorization': user.token };
  }
}

function getAuth(){
  if(user){
    return user.token;
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
    if(res.statusCode == 200){
      user = JSON.parse(body);
      navigateTo('main');
      listConversation();
    }
  });
}

function getMessageForConversation(conversation_id, last_message){
  return new Promise(function (resolve, reject) {
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/message/list/' + conversation_id + '/' + last_message,
      method: 'GET'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  });
}

function register(name, password){
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
    uri: SERVER_URL + '/register',
    body: formData,
    method: 'POST'
  }, function (err, res, body) {
    //Verifier les erreur
  });
}

function listConversation(){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/conversation/list',
    method: 'GET'
  }, function (err, res, body) {
    if(res.statusCode == 200){
      conversations = JSON.parse(body);
      updateConversations(conversations);
    }
  });
}

function newConversation(conversation, shared){
  var form = {
      name: conversation,
      shared: shared
  };

  var formData = querystring.stringify(form);
  var contentLength = formData.length;

  request({
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': getAuth()
    },
    uri: SERVER_URL + '/api/conversation/create',
    body: formData,
    method: 'POST'
  }, function (err, res, body) {
    console.log(body)
    listConversation();
  });
}
