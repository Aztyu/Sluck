//La fonction permet d' afficher une page voulue en cachant les autres
//param page_dest Une String qui contient l'élément à afficher
function navigateTo(page_dest){
  var pages = document.querySelectorAll('[data-page]');   //Récupération de tous les événements
  for(var i=0; i<pages.length; i++){
    var page = pages[i];
    if(page.getAttribute('data-page') == page_dest){    //Si l'élément est celui que l'on veut acheter
      page.classList.remove('hidden');    //On affiche l'élément
    }else{
      page.classList.add('hidden');       //Sinon on cache l'éléemnt
    }
  }
}

//La fonction permet d' afficher une page voulue en cachant les autres via une logique d'onglet
//param page_dest Une String qui contient l'élément à afficher
function navigateToTab(page_dest){
  var pages = document.querySelectorAll('[data-tab]');   //Récupération de tous les événements
  for(var i=0; i<pages.length; i++){
    var page = pages[i];
    if(page.getAttribute('data-tab') == page_dest){    //Si l'élément est celui que l'on veut acheter
      page.classList.remove('hidden');    //On affiche l'élément
    }else{
      page.classList.add('hidden');       //Sinon on cache l'éléemnt
    }
  }
}

//La fonction permet de mettre à jour la liste des conversations
//param conversations La liste de toutes les conversations
function updateConversations(conversations){
  var main_div = document.getElementById('conversations');

  for(var i=0; i<conversations.length; i++){
    var conversation = conversations[i];
    var conv_exist = document.querySelectorAll('.conversation[data-id="' + conversation.id + '"]'); //On vérifie si la conversation est déjà présente

    if(conv_exist.length == 0){  //Si la conversation n'existe pas encore alors on la rajoute
      var conv_div = document.createElement('div');
      conv_div.classList.add('conversation');
      conv_div.setAttribute('data-id', conversation.id);    //On stocke l'id de la conversation
      conv_div.addEventListener("click", switchConversation); //On défini le onClick

      var conv_status = document.createElement('div');
      conv_status.classList.add('status');

      var conv_name = document.createElement('p');
      conv_name.classList.add('name');
      conv_name.innerHTML = conversation.name;    //Affichage du nom de la conversation

      var conv_close = document.createElement('img');
      conv_close.src = 'img/close.png';
      conv_close.addEventListener("click", quitConversationEvt);

      conv_div.appendChild(conv_status);
      conv_div.appendChild(conv_name);
      conv_div.appendChild(conv_close);
      main_div.appendChild(conv_div);
    }
  }

  scrollMessages();   //On scroll les messages
}

//La fonction permet de changer les messages
//param event L' événement du bouton
function switchConversation(event){
  var target = event.target;

  var conversation_div = target;
  if(!conversation_div.getAttribute('data-id')){    //On récupére l'id la conversation sélectionnée
      conversation_div = target.parentNode;
  }

  var conversation_id = conversation_div.getAttribute('data-id');
  var status = conversation_div.querySelector('.status');
  status.classList.remove('new');   //On reset le status

  var conversation;
  for(var i=0; i<conversations.length; i++){    //On cherche la conversation dans la liste en JS pour définir la conversation actuelle
    if(conversations[i].id == conversation_id){
      conversation = conversations[i];
      break;
    }
  }

  clearMessages();    //On vide les messages

  document.getElementById('conversation_title').innerHTML = conversation.name;    //On rempli le nom de la conversation

  var current_messages = conversation.messages;
  if(current_messages){     //Si on a déjà chargé des messages alors on les ajoutent
    for(var j=0; j<current_messages.length; j++){
      addNewMessage(current_messages[j]);
    }
  }

  current_conversation = conversation;
}

//La fonction permet de quitter une conversation
function quitConversationEvt(event){
  var target = event.target;

  var conversation_div = target.parentNode;
  if(!conversation_div.getAttribute('data-id')){    //On récupére l'id la conversation sélectionnée
      conversation_div = target.parentNode;
  }

  var conversation_id = conversation_div.getAttribute('data-id');

  //Appeler le code pour quitter une conversation
  quitConversation(conversation_id).then(function (data) {
     console.log(data);
     removeConversation(conversation_id);
  }, function(data){
    console.log(data);
  });
}

function removeConversation(conversation_id){
  var conversation = document.querySelector('.conversation[data-id="' + conversation_id + '"]');
  conversation.remove();

  for(var i = 0; i < conversations.length; i++){
    if(conversations[i].id == conversation_id){
      conversations.splice(i, 1);   //On en enlève la conversation du tableau des conversations
    }
  }
}

//La fonction permet d'afficher un nouveau message dans l'affichage principal
//param message Un objet message
function addNewMessage(message){
  var message_div = document.getElementById('messages');
  message_div.appendChild(getMessageDiv(message));

  scrollMessages();
}

//La fonction va vider les messages dans l'affichage principal
function clearMessages(){
  var message_div = document.getElementById('messages');
  message_div.innerHTML = '';
}

//La fonction permet de récupérer des infos un utilisateur déjà chargé selon son id
//param user_id L'id de l'utilisateur à récupérer
function getUser(user_id){
  if(user_map[user_id]){
    return user_map[user_id];
  }
}

//La fonction récupére le nom de l'utilisateur si il est déjà chargé
//param user_id L'id de l'utilisateur à récupérer
function getUserDiv(user_id){
  var user = getUser(user_id);

  if(user){   //Si l' username est dejà récupéré alors en l'envoi sinon on le charge plus tard
    return user.name;
  }
}

//La fonction permet de créer une div de message compléte
//param message Un objet message avec le contenu du message et l'id de l'utilisateur
function getMessageDiv(message){
  var message_div = document.createElement('div');
  message_div.classList.add('message');
  message_div.setAttribute('data-id', message.id);    //On stocke l'id du message

  var profil_img = document.createElement('img');
  profil_img.classList.add('profile');
  profil_img.src = SERVER_URL + '/user/profile/' + message.user_id;   //On initialise l'url de la photo de profil

  var message_elem = document.createElement('div');
  message_elem.classList.add('chat');

  var username_elem = document.createElement('p');
  username_elem.setAttribute('data-id', message.user_id);
  username_elem.classList.add('name');

  var username = getUserDiv(message.user_id);

  if(username){     //On vérifie si le username est connu
    username_elem.innerHTML = username;   //On l'affiche
  }else{
    username_elem.classList.add('lazy-load');   //On ajoute la class lazy-load + un attribut pour le charger plus tard
    if(!user_to_load.includes(message.user_id)){    //Si l'id de l'user n'est pas déjà recherché alors on l'ajoute à la liste de recherche
      user_to_load.push(message.user_id);
    }
  }

  var content_elem = document.createElement('p');     //Remplissage du contenu du message
  content_elem.setAttribute('data-id', message.id);
  content_elem.classList.add('content');
  content_elem.innerHTML = message.content;

  message_elem.appendChild(username_elem);
  message_elem.appendChild(content_elem);

  message_div.appendChild(profil_img);
  message_div.appendChild(message_elem);

  return message_div;
}

//La fonction qui est appelée quand on appuye sur envoyer
function sendNewMessage(){
  var message = document.getElementById('chat_box').value;    //On récupére le contenu du message

  createMessage(message, current_conversation.id).then(function (data) {    //Envoie du message à l'API
      var message_obj = JSON.parse(data)    //On récupére une liste d'objet Message JSON

      if(!current_conversation.messages){   //Si la conversation n'a pas de message alors on l'initialise
          current_conversation.messages = [];
      }

      current_conversation.messages.push(message_obj);    //On ajoute le message
      addNewMessage(message_obj);     //On affiche le message
  }, function (err) {
      console.log(err);
  });

}

//La fonction est appelé quand on cherche une nouvelle conversation
function searchConversation(){
  searchPublicConversation().then(function (data) {
      var debug = JSON.parse(data)    //On récupére une liste d'objet Conversation JSON

      var conv_div = document.getElementById('conversations_join');   //On crée les éléments qui seront affichés dans la liste
      conv_div.innerHTML = '';
      for(var i =0; i<debug.length; i++){
        var new_conv = document.createElement('div');

        var conv_text = document.createElement('p');
        conv_text.innerHTML = debug[i].name;

        var conv_button = document.createElement('button');
        conv_button.setAttribute('data-id', debug[i].id);   //On donne l'id de la conversation
        conv_button.addEventListener("click", function(elem){   //On ajoute la possiblité de rejoindre en cliquant sur un bouton
            var button = elem.target;
            var conversation_id = button.getAttribute('data-id');
            joinConversation(conversation_id);    //On appelle la fonction pour rejoindre
        });
        conv_button.innerHTML = "Join";

        new_conv.appendChild(conv_text);
        new_conv.appendChild(conv_button);

        conv_div.appendChild(new_conv);
      }
  }, function (err) {
      console.log(err);
  });
}

//La fonction permet de faire scroller vers les messages tout en bas
function scrollMessages(){
  var messages = document.getElementById('messages');
  messages.scrollTop = messages.scrollHeight
}
