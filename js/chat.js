var pseudo_string; //On sauvegarde le pseudo
var last_index = 0; //Dernier message reçu pour savoir lequel envoyer

function loginAccount(){
  var name = document.getElementById('name_log').value;
  var password = document.getElementById('password_log').value;

  login(name, password);
}

function registerAccount(){
  var name = document.getElementById('name_reg').value;
  var password = document.getElementById('password_reg').value;
  var password_confirm = document.getElementById('password_confirm_reg').value;

  register(name, password);
}

function testLogin(){
  login('kiki', 'boucher');
}

function testList(){
  listConversation();
}

$(document).ready(function() {
    console.log("ready!");

    /*let timeout = 2000; //Toute les deux secondes
    var action = updateMessageThread; //On récupère la liste
    setInterval(action, timeout);
    action(); //On démarre la boucle*/
});

function updateMessageThread(){
  $.ajax({
    type: "GET",
    url: "http://localhost:8080/server/message/list/"+last_index,
    success: function(data) {
      console.log(data);

      var messages = document.getElementById('messages'); //On récupére la div du chat

      if(data && data.messages){ //Si il y a au moins un message
        for(var i = 0; i < data.messages.length; i++){
          var msg = data.messages[i];
          var msg_node = document.createElement('p');
          msg_node.innerHTML = msg.pseudo + ' : ' + msg.content;
          last_index = msg.id; //On met à jour le dernier message reçu

          messages.appendChild(msg_node);
        }
      }
    },
  });
}

function sendMessage(){
  if(!pseudo_string){
    pseudo_string = document.getElementById('pseudo').value;
  }
  var message = document.getElementById('message').value;
  document.getElementById('message').value = '';

  $.ajax({
    type: "POST",
    url: "http://localhost:8080/server/message",
    data: {
      pseudo: pseudo_string,
      content: message
    },
    success: function(data) {},
  });
}
