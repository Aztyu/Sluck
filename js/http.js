var request = require('request');
var querystring = require('querystring');
var restler = require('restler');
var mime = require('mime');

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

function register(name, password, profile_img){
  fs.stat(profile_img, function(err, stats) {
    console.log(stats);

    var user = {name: name, password: password};
    restler.post(SERVER_URL + '/register', {
        multipart: true,
        data: {
            "user": JSON.stringify(user),
            "file": restler.file(profile_img, null, stats.size, null, mime.lookup(profile_img))
        }
    }).on("complete", function(data) {
        console.log(data);
    });
  });

  /*var req = request.post(SERVER_URL + '/register', function (err, resp, body) {
    if (err) {
      console.log('Error!');
    } else {
      console.log('URL: ' + body);
    }
  });

  var form = req.form();
  form.append('file', fs.createReadStream(profile_img));
  form.append('user', "{name: " + name + ", password: " + password + "}");

  form.getLength(function(err, length) {
    req.setHeader('Content-Length', length);
  });*/
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
