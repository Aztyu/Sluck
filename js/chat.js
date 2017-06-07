

var pseudo_string; //On sauvegarde le pseudo
var last_index = 0; //Dernier message reçu pour savoir lequel envoyer
var profile_image;

var message_interval;   //On stocke tous les intervaux ici pour les stopper à la déconnection
var chat_interval;
var lazyload_interval;

var chats = {};

const ipc = require('electron').ipcRenderer

//Demarre la pop-up pour récupérer la photo de profil
function openFile(){
  ipc.send('open-image-dialog');
}

//Une fois sélectionné le chemin du fichier est renvoyé
ipc.on('selected-directory', function (event, path) {
  var image_preview = document.getElementById('img_preview');
  image_preview.src = path[0];
})

//La fonction appelée quand on veut se connecter
function loginAccount(){
  var name = document.getElementById('name_log').value;           //On récupére les valeurs dans le HTML
  var password = document.getElementById('password_log').value;
  var peer_id = peer.id;

  document.getElementById('status_log').value = '';               //On vide le message d'erreur

  login(name, password, peer_id).then(function (data) {    //Si on se connecte
    connected_user = data;                          //On rempli l'utilisateur connecté
    user_map[connected_user.id] = connected_user;   //On ajoute l'utilisateur à la map des utilisateurs
    navigateTo('main');                             //alors on passe sur l'affichage principal
    listConversation();
    startBackgroundUpdates();
    initProfile(connected_user);                          //et des pseudos
  }, function (err) {
    document.getElementById('name_log').value = '';             //En cas d'erreur on remets les champs à zéro
    document.getElementById('password_log').value = '';

    var login_status = document.getElementById('status_log');   //On affiche l'erreur
    login_status.innerHTML = err;
  });
}

//la fonction permet de lancer toutes les requêtes en fond
function startBackgroundUpdates(){
  startMessageUpdates();                          //on démarre la récupération des messages
  startChatUpdates()
  startLazyLoadUpdate();
  startContactUpdate();
  startInviteUpdate();
}

//La fonction appelée quand on veut créer un utilisateur
function registerAccount(){
  var name = document.getElementById('name_reg').value;             //On récupére les valeurs dans le HTML
  var password = document.getElementById('password_reg').value;
  var password_confirm = document.getElementById('password_confirm_reg').value;
  var email = document.getElementById('email_reg').value;
  var email_confirm = document.getElementById('email_confirm_reg').value;
  var profile_img = document.getElementById('img_preview');

  if(profile_img){      //Pour la photo de profil on récupére la source
    profile_img_src = profile_img.src;
  }else{
    profile_img_src = '';
  }

  if(profile_img_src){    //Si profile img n'est pas undefined alors on enlève le 'file:///' pour utiliser avec FS
    profile_img_src = profile_img_src.substring(8);
  }

  if(password == password_confirm && email == email_confirm){           //Si les password coïncident
      register(name, password, email, profile_img_src);
  }
}

function resetAccount(){
  var email = document.getElementById('email_reset').value;
  document.getElementById('status_log_reset').value = '';               //On vide le message d'erreur

  if(email && email !== ''){
    askForReset(email).then(function (data) {
      var reset_status = document.getElementById('status_log_reset');   //On affiche l'erreur
      reset_status.innerHTML = 'Le code a été envoyé par mail';
    }, function (err) {
      document.getElementById('email_reset').value = '';             //En cas d'erreur on remets les champs à zéro

      var reset_status = document.getElementById('status_log_reset');   //On affiche l'erreur
      reset_status.innerHTML = err;
    });
  }else{
    document.getElementById('status_log_reset').value = 'Merci de renseigner un mail';
  }
}

function resetAccountPassword(){
  var code = document.getElementById('code_reset').value;
  var password = document.getElementById('password_reset').value;
  var password_verif = document.getElementById('password_confirm_reset').value;

  document.getElementById('status_log_change').value = '';               //On vide le message d'erreur

  if(password && password_verif && password_verif === password){
    resetPassword(code, password).then(function (data) {
      var reset_status = document.getElementById('status_log_reset');   //On affiche l'erreur
      reset_status.innerHTML = 'Le mot de passe a bien été changé';
    }, function (err) {
      document.getElementById('code_reset').value = '';             //En cas d'erreur on remets les champs à zéro
      document.getElementById('password_reset').value = '';
      document.getElementById('password_confirm_reset').value = '';

      var reset_status = document.getElementById('status_log_change');   //On affiche l'erreur
      reset_status.innerHTML = err;
    });
  }else{
    document.getElementById('status_log_change').value = 'Les mots de passe doivent être identique';
  }
}

//La fonction appelée quand on veut créer une nouvelle conversation
function createConversation(){

  var conversation = document.getElementById('conversation_name').value;  //On récupére les valeurs dans le HTML
  var shared = document.getElementById('conversation_shared').checked;    //On récupére l'état de la checkbox
  if(conversation.length > 0){
    $('#defaultModal').modal('hide')
    newConversation(conversation, shared);
  }
  else{
    document.getElementById('sa-input-error').style.backgroundColor = "red";
    document.getElementById('sa-input-error').innerHTML += '<p><i class="material-icons">warning</i> Vous devez écrire quelque chose !<p>';
  }

}

//La fonction démarre la mise à jour automatique des messages
function startMessageUpdates(){
  updateMessageThread();    //On le démarre une première fois
  let timeout = UPDATE_MESSAGE_TIME;
  var action = updateMessageThread; //On récupère la liste
  message_interval = setInterval(action, timeout);
  action();                         //On démarre la boucle
}

//La fonction démarre la mise à jour automatique des messages de chat 1-à-1
function startChatUpdates(){    //TODO implemetn
  updateChatThread();    //On le démarre une première fois
  let timeout = UPDATE_MESSAGE_TIME;
  var action = updateChatThread; //On récupère la liste
  chat_interval = setInterval(action, timeout);
  action();                         //On démarre la boucle
}

//La fonction gére la mise à jour des messages par conversation
function updateMessageThread(){
  if(conversations){                            //On récupére les conversations en JS
    for(var i=0; i<conversations.length; i++){
      updateConversation(conversations[i]);     //Pour chacune des conversations on récupére les nouveaux messages
    }
  }
}

//La fonction gére la mise à jour des messages par chat
function updateChatThread(){
  var contacts = document.querySelectorAll('.labels li:not(.title)');

  if(contacts){
    for(var i=0; i<contacts.length; i++){
      updateChat(contacts[i].getAttribute('data-id'));     //Pour chacuns des chats on récupére les nouveaux messages
    }
  }
}

//La fonction démarre la mise à jour automatique des pseudos
function startLazyLoadUpdate(){
  lazyLoadUpdateThread();//On le démarre une première fois
  let timeout = PSEUDO_TIME;
  var action = lazyLoadUpdateThread; //On récupère la liste
  lazyload_interval = setInterval(action, timeout);
  action();                         //On démarre la boucle
}

//La fonction gére la mise à jour des pseudos
function lazyLoadUpdateThread(){
  for(var i=0; i<user_to_load.length; i++){   //user_to_load contient les ids d'utilisateurs à récupérer
    var user_id = user_to_load[i]
    var user = getUser(user_id);    //On appelle la fonction pour récupérer l'utilisateur si il a déjà été chargé

    if(user){       //Si l'utilisateur est déjà défini alors on rempli les pseudos
      loadUserInfo(user);
    }else{          //Si l'utilisateur n'est pas trouvé alors on va faire la requête
      getUserDetail(user_id).then(function (data) {
          user = data;                //On récupére l'utilisateur
          user_map[user.id] = user;   //On le stocke dans le tableau
          loadUserInfo(user);         //On rempli les éléments où le pseudo doit être affiché
      }, function (err) {
          console.log(err);
      });
    }
    user_to_load.splice(i, 1);        //On supprime l'id de l'utilisateur qui a été chargé du tableau
  }
}

//La fonction permet de remplir les infos d'un utilisateur passer en paramètre
//param user Un utilisateur qui posséde un id et un nom
function loadUserInfo(user){
  var elements = document.querySelectorAll('.lazy-load[data-id="' + user.id + '"]');    //Récupération des éléments qui attendent le chargement du pseudo

  for(var i=0; i< elements.length; i++){
    var element = elements[i];              //Pour chacun des éléments

    element.innerHTML = user.name;          //On rempli le pseudo
    element.classList.remove('lazy-load');  //On enlève la classe lazy-load pour éviter de charger plusieurs fois
  }
}

//La fonction permet de mettre à jour les messages pour une conversation
//param conversation Une Conversation qui posséde un id et un tableau de messages
function updateConversation(conversation){
  var messages = conversation.messages;
  var last_message = 0;
  if(messages && messages.length > 0){    //Si il y a déjà des messages on envoie l'ID du dernier
      last_message = messages[messages.length-1].id;
  }else{
      conversation.messages = [];         //Sinon on initialise le tableau de messages
  }

  getMessageForConversation(conversation.id, last_message).then(function (data) {
      if(data && data !== ''){
        var debug = JSON.parse(data)    //On récupére une liste d'objet Message JSON
        conversation.messages = conversation.messages.concat(debug);           //On les rajoutent au message de la conversation

        if(debug.length > 0){   //Si il y a des messages renvoyés
          var conv_div = document.querySelector('.conversation[data-id="' + conversation.id + '"]');    //On récupére la div de la conversation dans la liste

          if(debug[debug.length-1].time > connected_user.last_logout){   //Si le dernier message est plus récent que la dernière connexion
            conv_div.querySelector('.status').classList.add('new');   //Puis on ajoute une classe pour indiquer qu'il y a un nouveau message
          }

          if(conversation.id == current_conversation.id){   //Si la conversation mis à jour est la conversation actuelle en focus alors on ajoute les messages
            for(var i = 0; i<debug.length; i++){
              addNewMessage(debug[i]);      //On envoie l'objet message pour qu'il s'affiche dans la page
            }
          }

        }
      }
  }, function (err) {
      console.log(err);
  });
}

//La fonction permet de mettre à jour les messages pour un chat
//param conversation Une Conversation qui posséde un id et un tableau de messages
function updateChat(contact_id){
  var messages;
  if(!chats[contact_id]){
    chats[contact_id] = [];
  }
  messages = chats[contact_id].messages;
  var last_message = 0;
  if(messages && messages.length > 0){    //Si il y a déjà des messages on envoie l'ID du dernier
      last_message = messages[messages.length-1].id;
  }else{
      chats[contact_id].messages = [];         //Sinon on initialise le tableau de messages
  }

  getMessageForChat(contact_id, last_message).then(function (data) {
      if(data && data !== ''){
        var debug = JSON.parse(data);    //On récupére une liste d'objet Message JSON
        chats[contact_id].messages = chats[contact_id].messages.concat(debug);           //On les rajoutent au message de la conversation

        if(debug.length > 0){   //Si il y a des messages renvoyés
          var contact_li = document.querySelector('.contact[data-id="' + contact_id + '"]');

          //var conv_div = document.querySelector('.conversation[data-id="' + conversation.id + '"]');    //On récupére la div de la conversation dans la liste

          if(debug[debug.length-1].time > connected_user.last_logout){   //Si le dernier message est plus récent que la dernière connexion
            conv_div.querySelector('.status').classList.add('new');   //Puis on ajoute une classe pour indiquer qu'il y a un nouveau message
          }

          if(contact_id == current_contact_id){   //Si la conversation mis à jour est la conversation actuelle en focus alors on ajoute les messages
            for(var i = 0; i<debug.length; i++){
              addNewChat(debug[i]);      //On envoie l'objet message pour qu'il s'affiche dans la page
            }
          }
        }
      }
  }, function (err) {
      console.log(err);
  });
}

function initProfile(connected_user) {
  username.innerHTML = connected_user.name;
  $(".profile_picture").attr('src', 'http://cdn.qwirkly.fr/profile/' + connected_user.id);
}
