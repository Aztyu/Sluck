

var pseudo_string; //On sauvegarde le pseudo
var last_index = 0; //Dernier message reçu pour savoir lequel envoyer
var profile_image;

const ipc = require('electron').ipcRenderer

function openFile(){
  ipc.send('open-file-dialog');
}

ipc.on('selected-directory', function (event, path) {
  console.log(path[0]);

  var image_preview = document.getElementById('img_preview');
  image_preview.src = path[0];

  console.log(`You selected: ${path}`);
})

function loginAccount(){
  var name = document.getElementById('name_log').value;
  var password = document.getElementById('password_log').value;

  login(name, password).then(function (data) {
    connected_user = data;
    navigateTo('main');
    listConversation();
    startMessageUpdates();
    startLazyLoadUpdate();
  }, function (err) {
      console.log(err);
  });
}

function registerAccount(){
  var name = document.getElementById('name_reg').value;
  var password = document.getElementById('password_reg').value;
  var password_confirm = document.getElementById('password_confirm_reg').value;
  var profile_img = document.getElementById('img_preview').src;
  console.log(profile_img);
  console.log(document.getElementById('profile_img_reg'));
  if(password == password_confirm){
      register(name, password, profile_img.substring(8));    //On enlève le file:///
  }
}

function createConversation(){
  var conversation = document.getElementById('conversation_name').value;
  var shared = document.getElementById('conversation_shared').checked;

  newConversation(conversation, shared);
}

function startMessageUpdates(){
  let timeout = UPDATE_TIME;
  var action = updateMessageThread; //On récupère la liste
  setInterval(action, timeout);
  action();                         //On démarre la boucle
}

function updateMessageThread(){
  if(conversations){
    for(var i=0; i<conversations.length; i++){
      updateConversation(conversations[i]);
    }
  }
}

function startLazyLoadUpdate(){
  let timeout = 2000;
  var action = lazyLoadUpdateThread; //On récupère la liste
  setInterval(action, timeout);
  action();                         //On démarre la boucle
}

function lazyLoadUpdateThread(){
    loadUser();
}

function loadUser(){
  for(var i=0; i<user_to_load.length; i++){
    var user_id = user_to_load[i]
    var user = getUser(user_id);

    if(user){
      loadUserInfo(user);
    }else{
      getUserDetail(user_id).then(function (data) {
          user = data;
          user_map[user.id] = user;
          loadUserInfo(user);
      }, function (err) {
          console.log(err);
      });
    }
    user_to_load.splice(i, 1);
  }
}

function loadUserInfo(user){
  console.log(user);
  var elements = document.querySelectorAll('.lazy-load[data-id="' + user.id + '"]');

  for(var i=0; i< elements.length; i++){
    var element = elements[i];

    element.innerHTML = user.name;
    element.classList.remove('lazy-load');
  }
}

function updateConversation(conversation){
  var messages = conversation.messages;
  var last_message = 0;
  if(messages && messages.length > 0){                    //Si il y a déjà des messages on envoie l'ID du dernier
      last_message = messages[messages.length-1].id;
  }else{
      conversation.messages = [];
  }

  getMessageForConversation(conversation.id, last_message).then(function (data) {
      var debug = JSON.parse(data)    //On récupére une liste d'objet Message JSON
      conversation.messages = conversation.messages.concat(debug);           //On les rajoutent au message de la conversation

      if(debug.length > 0){
        var conv_div = document.querySelector('.conversation[data-id="' + conversation.id + '"]');
        conv_div.querySelector('.status').classList.add('new');

        if(conversation.id == current_conversation.id){
          for(var i = 0; i<debug.length; i++){
            addNewMessage(debug[i]);
          }
        }

      }
  }, function (err) {
      console.log(err);
  });
}
