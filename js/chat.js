

var pseudo_string; //On sauvegarde le pseudo
var last_index = 0; //Dernier message reçu pour savoir lequel envoyer
var profile_image;

const ipc = require('electron').ipcRenderer

//Demarre la pop-up pour récupérer la photo de profil
function openFile(){
  ipc.send('open-file-dialog');
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

  document.getElementById('status_log').value = '';               //On vide le message d'erreur

  login(name, password).then(function (data) {    //Si on se connecte
    connected_user = data;                          //On rempli l'utilisateur connecté
    user_map[connected_user.id] = connected_user;   //On ajoute l'utilisateur à la map des utilisateurs
    navigateTo('main');                             //alors on passe sur l'affichage principal
    listConversation();
    startMessageUpdates();                          //on démarre la récupération des messages
    startLazyLoadUpdate();                          //et des pseudos
  }, function (err) {
    document.getElementById('name_log').value = '';             //En cas d'erreur on remets les champs à zéro
    document.getElementById('password_log').value = '';

    var login_status = document.getElementById('status_log');   //On affiche l'erreur
    login_status.innerHTML = err;
  });
}

//La fonction appelée quand on veut créer un utilisateur
function registerAccount(){
  var name = document.getElementById('name_reg').value;             //On récupére les valeurs dans le HTML
  var password = document.getElementById('password_reg').value;
  var password_confirm = document.getElementById('password_confirm_reg').value;
  var profile_img = document.getElementById('img_preview').src;     //Pour la photo de profil on récupére la source

  if(profile_img){    //Si profile img n'est pas undefined alors on enlève le 'file:///' pour utiliser avec FS
    profile_img.substring(8);
  }

  if(password == password_confirm){           //Si les password coïncident
      register(name, password, profile_img);
  }
}

//La fonction appelée quand on veut créer une nouvelle conversation
function createConversation(){
  var conversation = document.getElementById('conversation_name').value;  //On récupére les valeurs dans le HTML
  var shared = document.getElementById('conversation_shared').checked;    //On récupére l'état de la checkbox

  newConversation(conversation, shared);
}


//La fonction démarre la mise à jour automatique des messages
function startMessageUpdates(){
  updateMessageThread();    //On le démarre une première fois
  let timeout = UPDATE_TIME;
  var action = updateMessageThread; //On récupère la liste
  setInterval(action, timeout);
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

//La fonction démarre la mise à jour automatique des pseudos
function startLazyLoadUpdate(){
  lazyLoadUpdateThread();//On le démarre une première fois
  let timeout = 50;
  var action = lazyLoadUpdateThread; //On récupère la liste
  setInterval(action, timeout);
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
      var debug = JSON.parse(data)    //On récupére une liste d'objet Message JSON
      conversation.messages = conversation.messages.concat(debug);           //On les rajoutent au message de la conversation

      if(debug.length > 0){   //Si il y a des messages renvoyés
        var conv_div = document.querySelector('.conversation[data-id="' + conversation.id + '"]');    //On récupére la div de la conversation dans la liste
        conv_div.querySelector('.status').classList.add('new');   //Puis on ajoute une classe pour indiquer qu'il y a un nouveau message

        if(conversation.id == current_conversation.id){   //Si la conversation mis à jour est la conversation actuelle en focus alors on ajoute les messages
          for(var i = 0; i<debug.length; i++){
            addNewMessage(debug[i]);      //On envoie l'objet message pour qu'il s'affiche dans la page
          }
        }

      }
  }, function (err) {
      console.log(err);
  });
}
