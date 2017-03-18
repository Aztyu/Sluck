var request = require('request');
var querystring = require('querystring');

var connected_user;
var conversations;
var user_map = {};
var user_to_load = new Array();

var current_conversation = 0;

function getAuthHeader(){
  if(connected_user){
    return {'Authorization': connected_user.token };
  }
}

function getAuth(){
  if(connected_user){
    return connected_user.token;
  }
}

function getUserDetail(user_id){
  return new Promise(function (resolve, reject) {
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/user/detail/' + user_id,
      method: 'GET'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(JSON.parse(body));
      }else{
        return reject(err);
      }
    });
  });
}

function login(name, password){
  return new Promise(function (resolve, reject) {
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
        resolve(JSON.parse(body));
      }else{
        return reject(err);
      }
    });
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
    listConversation();
  });
}

function createMessage(message, current_conversation){
  return new Promise(function (resolve, reject) {
    var form = {
       content: message
    };

    var formData = querystring.stringify(form);
    var contentLength = formData.length;

    request({
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': getAuth()
      },
      uri: SERVER_URL + '/api/message/send/' + current_conversation,
      body: formData,
      method: 'POST'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  });
}

function searchPublicConversation(){
  return new Promise(function (resolve, reject) {
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/conversation/search',
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

function joinConversation(id){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/conversation/join/' + id,
    method: 'GET'
  }, function (err, res, body) {
    listConversation();
  });
}
