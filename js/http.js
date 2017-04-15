var request = require('request');
var querystring = require('querystring');
var restler = require('restler');
var mime = require('mime');

var connected_user;     //L'utilisateur actuellement connecté
var conversations;      //La liste de tous les objets Conversation
var user_map = {};      //On stocke les utilisateurs déjà rencontrés par leur ID (clé: ID, valeur: Objet User)
var user_to_load = new Array();   //Une liste des utilisateurs à récupérer

var current_conversation = 0;     //L'iD de la conversation actuellement affichée

//La fonction renvoie le header a faire passer au serveur pour la gestion des droits
function getAuthHeader(){
  if(connected_user){
    return {'Authorization': connected_user.token };
  }
}

//La fonction renvoie une partie intégrable à un header via Authorization a faire passer au serveur pour la gestion des droits
function getAuth(){
  if(connected_user){
    return connected_user.token;
  }
}

//Fonction qui permet de récupérer l'objet User pour un id
//param user_id Id de l'utilisateur dont on veut les informations
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

//La fonction permet de connecter un utilisateur à l'API pour pouvoir utiliser les autres fonctions
//param name Le nom de l'utilisateur
//param password Le mot de passe de l'utilisateur
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
        return reject(body);
      }
    });
  });
}

function logout(){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/logout',
    method: 'GET'
  }, function (err, res, body) {
    if(res.statusCode == 200){
      connected_user = null;
      conversations = null;
      navigateTo('login');
    }else{
      console.log('Erreur de déconnexion');
    }
  });
}

function quitConversation(conversation_id){
  return new Promise(function (resolve, reject){
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/conversation/quit/' + conversation_id,
      method: 'DELETE'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  });
}

//La fonction permet de récupérer tous les messages d'une conversation depuis un certain id de message
//param conversation_id L'id de la conversation
//param last_message L'id du dernier message ou 0
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

//La fonction permet de faire passer des infos pour enregistrer un nouvel utilisateur
//param name Le nom du nouvel utilisateur
//param password Le mot de passe
//param profile_img Le lien vers l'image de profil sur le disque ou undefined
function register(name, password, profile_img){
  if(profile_img){    //Si profile_img est défini alors on récupére la photo
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
  }else{    //Sinon on envoie sans photo de profil
    var user = {name: name, password: password};
    restler.post(SERVER_URL + '/register', {
        multipart: true,
        data: {
            "user": JSON.stringify(user),
        }
    }).on("complete", function(data) {
        console.log(data);
    });
  }
}

//La fonction permet de récupérer une liste des conversations dans lequel l'utilisateur est enregistré
function listConversation(){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/conversation/list',
    method: 'GET'
  }, function (err, res, body) {
    if(res.statusCode == 200){
      conversations = JSON.parse(body);
      updateConversations(conversations);   //On appelle la fonction pour ajouter la conversation à la liste dans l'affichage
    }
  });
}

//La fonction permet de créer une nouvelle conversation
//param conversation Le nom de la nouvelle conversation
//param shared Si la conversation est publique ou privée
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
    listConversation();   //Mise à jour de la liste des conversations
  });
}

//la fonction permet d'envoyer un message
//param message Le contenu du message
//param current_conversation L'id de la conversation sur laquelle envoyer le message
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

//la fonction permet de chercher toutes les conversations publiques
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


//La fonction permet de rejoindre une conversation publique existante
function joinConversation(id){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/conversation/join/' + id,
    method: 'GET'
  }, function (err, res, body) {
    listConversation();
  });
}
