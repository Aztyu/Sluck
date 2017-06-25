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
//param name      Le nom de l'utilisateur
//param password  Le mot de passe de l'utilisateur
//param peer_id   L'id peerJS pour la communication
function login(name, password, peer_id){
  return new Promise(function (resolve, reject) {
    var form = {
        name: name,
        password: password,
        peerjs_id: peer_id
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


//La fonction qui déconnecte l'utilisateur dans l'API
function logout(){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/logout',
    method: 'GET'
  }, function (err, res, body) {
    if(res.statusCode == 200){
      clearPages();

      navigateTo('login');
    }else{
      console.log('Erreur de déconnexion');
    }
  });
}

//La fonction permet de quitter une conversation via l'API
//param conversation_id L'id de la conversation à supprimer
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

//La fonction permet de récupérer tous les messages d'un chat entre 2 contacts depuis un certain id de message
//param contact_id L'id du contact
//param last_message L'id du dernier message ou 0
function getMessageForChat(contact_id, last_message){
  return new Promise(function (resolve, reject) {
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/message/chat/' + contact_id + '/' + last_message,
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
function register(name, password, email, profile_img){
  if(profile_img){    //Si profile_img est défini alors on récupére la photo
    var data = {name: name, password: password, email: email};

    var formData = {
      'user': JSON.stringify(data),
      'file': fs.createReadStream(profile_img)
    }

    var url = SERVER_URL + '/register';
    var req = request.post({url : url, formData: formData}, function (err, resp, body) {
      if(!err){
        return body;
      }else{
        return err;
      }
    });
  }else{    //Sinon on envoie sans photo de profil
    var data = {name: name, password: password, email: email};

    var form = {
      user: data
    }

    var url = SERVER_URL + '/register';
    var req = request.post({url : url, form: {'user': JSON.stringify(data)}}, function (err, resp, body) {
      if(!err){
        return body;
      }else{
        return err;
      }
    });
  }
}

function askForReset(email){
  return new Promise(function (resolve, reject) {
    request({
      uri: SERVER_URL + '/reset?email=' + email,
      method: 'GET'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(body);
      }
    });
  });
}

function resetPassword(code, password){
  return new Promise(function (resolve, reject) {
    var form = {
        code: code,
        password: password
    };

    var formData = querystring.stringify(form);
    var contentLength = formData.length;

    request({
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      uri: SERVER_URL + '/reset',
      body: formData,
      method: 'POST'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(body);
      }
    });
  });
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

//La fonction permet de récupérer une liste des invitations à rejoindre une conversation
function listConversationInvite(){
  return new Promise(function (resolve, reject) {
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/conversation/invite/list',
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

//La fonction permet d'inviter un contact à une conversation privée
function inviteConversationContact(conversation_id, user_id){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/conversation/invite/' + conversation_id + "/" + user_id,
    method: 'POST'
  }, function (err, res, body) {
    if(err){
      console.log(err);
    }
  });
}

//La fonction permet d'inviter un contact à une conversation privée
function renameContact(contact_id, name){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/contact/rename/' + contact_id + "?name=" + name,
    method: 'POST'
  }, function (err, res, body) {
    if(err){
      console.log(err);
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
    if(message.file){    //Si on passe un fichier
      var formData = {
        'file': fs.createReadStream(message.file)
      }

      var url = SERVER_URL + '/api/message/send/' + current_conversation;
      var req = request.post({url : url, formData: formData, headers: getAuthHeader()}, function (err, resp, body) {
        if(!err){
          resolve(body);
        }else{
          reject(err);
        }
      });
    }else{    //Sinon on envoie juste le message
      var url = SERVER_URL + '/api/message/send/' + current_conversation;
      var req = request.post({url : url, form: {'message': message.content}, headers: getAuthHeader()}, function (err, resp, body) {
        if(!err){
          resolve(body);
        }else{
          reject(err);
        }
      });
    }
  });
}

//la fonction permet d'envoyer un message
//param message Le contenu du message
//param current_conversation L'id de la conversation sur laquelle envoyer le message
function createChatMessage(message, contact_id){
  return new Promise(function (resolve, reject) {
    if(message.file){    //Si on passe un fichier
      var formData = {
        'file': fs.createReadStream(message.file)
      }

      var url = SERVER_URL + '/api/chat/send/' + contact_id;
      var req = request.post({url : url, formData: formData, headers: getAuthHeader()}, function (err, resp, body) {
        if(!err){
          resolve(body);
        }else{
          reject(err);
        }
      });
    }else{    //Sinon on envoie juste le message
      var url = SERVER_URL + '/api/chat/send/' + contact_id;
      var req = request.post({url : url, form: {'message': message.content}, headers: getAuthHeader()}, function (err, resp, body) {
        if(!err){
          resolve(body);
        }else{
          reject(err);
        }
      });
    }
  });
}

//la fonction permet de chercher toutes les conversations publiques
function searchPublicConversation(search){
  var url = SERVER_URL + '/api/conversation/search';
  if(search && search !== ''){
    url += '?search=' + search;
  }

  return new Promise(function (resolve, reject) {
    request({
      headers: getAuthHeader(),
      uri: url,
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

//La fonction permet de récupérer la liste des contacts
function contactList(){
  return new Promise(function (resolve, reject){
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/contact/list',
      method: 'GET'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  })
}

//La fonction permet de récupérer les invitations
function contactInviteList(){
  return new Promise(function (resolve, reject){
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/contact/invitation/list',
      method: 'GET'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  })
}

//La fonction permet de chercher un contact
//param search Le pseudo ou bout de pseudo à chercher
function searchContact(search){
  var url = SERVER_URL + '/api/contact/search';
  if(search && search !== ''){
    url += '?search=' + search;
  }

  return new Promise(function (resolve, reject){
    request({
      headers: getAuthHeader(),
      uri: url,
      method: 'GET'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  })
}

//La fonction permet d'accepter une invitations
//param id L'id de l'invitation
function acceptInvite(id){
  return updateInvite(id, true);
}

//La focntion permet de refuser une invitations
//param id L'id de l'invitation
function refuseInvite(id){
  return updateInvite(id, false);
}

//La fonction permet de mettre à jour le status d'une invitation
//param id L'id de l'invitation
//param accept Boolean true si on accepte false si on refuse
function updateInvite(id, accept){
  var method;
  if(accept){
    method = 'POST';
  }else{
    method = 'DELETE';
  }

  return new Promise(function (resolve, reject){
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/contact/invitation/' + id,
      method: method
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  });
}

//La fonction permet d'accepter une invitations de conv
//param id L'id de l'invitation
function acceptConvInvite(id){
  return updateConvInvite(id, true);
}

//La focntion permet de refuser une invitations de conv
//param id L'id de l'invitation
function refuseConvInvite(id){
  return updateConvInvite(id, false);
}

//La fonction permet de mettre à jour le status d'une invitation de conversation
//param id L'id de l'invitation
//param accept Boolean true si on accepte false si on refuse
function updateConvInvite(id, accept){
  var method;
  if(accept){
    method = 'POST';
  }else{
    method = 'DELETE';
  }

  return new Promise(function (resolve, reject){
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/conversation/invitation/' + id,
      method: method
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  });
}

//La fonction permet de faire une demande de contact
//param id l'id du contact
function inviteContact(id){
  return new Promise(function (resolve, reject){
    request({
      headers: getAuthHeader(),
      uri: SERVER_URL + '/api/contact/add/' + id,
      method: 'POST'
    }, function (err, res, body) {
      if(res.statusCode == 200){
        resolve(body);
      }else{
        return reject(err);
      }
    });
  })
}

//La fonction permet de mettre à jour son status
//param status Le status de l'utilisateur
function updateUserStatus(status){
  request({
    headers: getAuthHeader(),
    uri: SERVER_URL + '/api/user/status/' + status,
    method: 'GET'
  }, function (err, res, body) {
    if(err){
      console.log(status);
    };
  });
}
