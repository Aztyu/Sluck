var pseudo_string; //On sauvegarde le pseudo
var last_index = 0; //Dernier message reçu pour savoir lequel envoyer

let UPDATE_TIME = 2000; //Intervalle entre la récupération des messages

function loginAccount(){
  var name = document.getElementById('name_log').value;
  var password = document.getElementById('password_log').value;

  login(name, password);
}

function registerAccount(){
  var name = document.getElementById('name_reg').value;
  var password = document.getElementById('password_reg').value;
  var password_confirm = document.getElementById('password_confirm_reg').value;

  if(password == password_confirm){
      register(name, password);
  }
}

function createConversation(){
  var conversation = document.getElementById('conversation_name').value;
  var shared = document.getElementById('conversation_shared').checked;

  newConversation(conversation, shared);
}

function testLogin(){
  login('kiki', 'boucher');
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

function updateConversation(conversation){
  var messages = conversation.messages;
  var last_message = 0;
  if(messages && messages.length > 0){                    //Si il y a déjà des messages on envoie l'ID du dernier
      last_message = messages[messages.length-1].id;
  }else{
      conversation.messages = [];
  }

  getMessageForConversation(conversation.id, last_message).then(function (data) {
      console.log(data);
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
