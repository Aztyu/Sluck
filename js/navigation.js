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

      var conv_name = document.createElement('p');
      conv_name.classList.add('name');
      conv_name.innerHTML = conversation.name;

      conv_div.appendChild(conv_name);
      main_div.appendChild(conv_div);
    }
  }
}
