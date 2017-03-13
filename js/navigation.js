function navigateTo(page_dest){
  var pages = document.querySelectorAll('[data-page]');
  for(var i=0; i<pages.length; i++){
    var page = pages[i];
    if(page.getAttribute('data-page') == page_dest){
      page.classList.remove('hidden');
    }else{
      page.classList.add('hidden');
    }
  }
}

function updateConversations(conversations){
  var main_div = document.getElementById('conversations');

  for(var i=0; i<conversations.length; i++){
    var conversation = conversations[i];
    var conv_exist = document.querySelectorAll('.conversation[data-id="' + conversation.id + '"]');

    if(conv_exist.length == 0){  //Si la conversation n'existe pas encore alors on la rajoute
      var conv_div = document.createElement('div');
      conv_div.classList.add('conversation');
      conv_div.setAttribute('data-id', conversation.id);
      conv_div.addEventListener("click", switchConversation);

      var conv_status = document.createElement('div');
      conv_status.classList.add('status');

      var conv_name = document.createElement('p');
      conv_name.classList.add('name');
      conv_name.innerHTML = conversation.name;

      conv_div.appendChild(conv_status);
      conv_div.appendChild(conv_name);
      main_div.appendChild(conv_div);
    }
  }
}

function switchConversation(event){
  console.log(event);
  var target = event.target;

  var conversation_div = target;
  if(!conversation_div.getAttribute('data-id')){
      conversation_div = target.parentNode;
  }

  var conversation_id = conversation_div.getAttribute('data-id');
  var status = conversation_div.querySelector('.status');
  status.classList.remove('new');

  var conversation;
  for(var i=0; i<conversations.length; i++){
    if(conversations[i].id == conversation_id){
      conversation = conversations[i];
      break;
    }
  }

  clearMessages();

  document.getElementById('conversation_title').innerHTML = conversation.name;

  var current_messages = conversation.messages;
  if(current_messages){
    for(var j=0; j<current_messages.length; j++){
      addNewMessage(current_messages[j]);
    }
  }

  current_conversation = conversation;
}

function addNewMessage(message){
  var message_div = document.getElementById('messages');
  message_div.appendChild(getMessageDiv(message));
}

function clearMessages(){
  var message_div = document.getElementById('messages');
  message_div.innerHTML = '';
}

function getUser(user_id){
  if(user_map[user_id]){
    return user_map[user_id];
  }else{
    getUserDetail(user_id, function(data){
        console.log(data);
        var user = JSON.parse(data);

        user_map[user.id] = user;
        return user;
    });
  }
}

function getUserDiv(user_id){
  var user = getUser(user_id);

  if(user){
    return user.name;
  }
}

function getMessageDiv(message){
  var message_div = document.createElement('p');
  message_div.classList.add('message');
  message_div.innerHTML = getUserDiv(message.user_id) + ' - ' + message.content;
  return message_div;
}

function sendNewMessage(){
  var message = document.getElementById('chat_box').value;

  createMessage(message, current_conversation.id).then(function (data) {
      console.log(data);
      var message_obj = JSON.parse(data)    //On récupére une liste d'objet Message JSON

      if(!current_conversation.messages){
          current_conversation.messages = [];
      }

      current_conversation.messages.push(message_obj);
      addNewMessage(message_obj);
  }, function (err) {
      console.log(err);
  });

}

function searchConversation(){
  searchPublicConversation().then(function (data) {
      console.log(data);
      var debug = JSON.parse(data)    //On récupére une liste d'objet Message JSON

      var conv_div = document.getElementById('conversations_join');
      conv_div.innerHTML = '';
      for(var i =0; i<debug.length; i++){
        var new_conv = document.createElement('div');

        var conv_text = document.createElement('p');
        conv_text.innerHTML = debug[i].name;

        var conv_button = document.createElement('button');
        conv_button.setAttribute('data-id', debug[i].id);
        conv_button.addEventListener("click", function(elem){
            console.log(elem);
            var button = elem.target;
            var conversation_id = button.getAttribute('data-id');
            joinConversation(conversation_id);
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
