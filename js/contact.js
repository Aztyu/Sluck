function startInviteUpdate(){
  let timeout = UPDATE_INVITE;
  var action = getContactInviteList; //On récupère la liste
  setInterval(action, timeout);
  action();                         //On démarre la boucle
}

function startContactUpdate(){
  let timeout = UPDATE_CONTACT;
  var action = getContactList; //On récupère la liste
  setInterval(action, timeout);
  action();                         //On démarre la boucle
}

function getContactList(){
  contactList().then(function (data) {    //Si on se connecte
    if(data && data !== ''){
      var contacts = JSON.parse(data);

      var contacts_label = document.querySelectorAll('.labels li:not(.title)'); //On vide les contacts
      var contact_list = document.querySelector('.labels');

      contacts_label.forEach(function(item){
        item.parentNode.removeChild(item);
      });
      /*foreach(var contact in contacts){
        contact.parentNode.removeChild(contact);
      }*/

      for(var i = 0; i<contacts.length; i++){
        //if(!document.querySelector(".contact[data-id='" + contacts[i].id + "']")){
          var contact_li = document.createElement('li');
          contact_li.classList.add('contact');
          contact_li.setAttribute('data-id', contacts[i].id);

          var contact_a = document.createElement('a');
          contact_a.href = '#';
          contact_a.innerHTML = contacts[i].name;   //On utilise le nom du contact qui peut être modifié
          contact_a.innerHTML += ' <span class="ball pink"></span>';
          /*var contact_settings = document.createElement('i');
          contact_settings.classList.add('material-icons');
          contact_settings.classList.add('context-contact');
          contact_settings.innerHTML = 'face';

          var contact_list = document.getElementById('contacts');*/

          contact_li.appendChild(contact_a);
          //contact_div.appendChild(contact_settings);

          contact_list.appendChild(contact_li);
        //}
      }
      initContextMenu();
    }
  }, function (err) {
    console.log(err);
  });
}

function getContactInviteList(){
  contactInviteList().then(function (data) {    //Si on se connecte
    if(data && data !== ''){
      var invitations = JSON.parse(data);
      var invite_list = document.getElementById('invitations');

      invite_list.innerHTML = '';

      for(var i = 0; i<invitations.length; i++){
        var requester_id = invitations[i].requester_id;
        var invitation_id = invitations[i].invitation_id;

        //if(!document.querySelector(".invite[data-id='" + invitation_id + "']")){
          var invite_div = document.createElement('div');
          invite_div.classList.add('invite');
          invite_div.setAttribute('data-id', invitation_id);

          var invite_p = document.createElement('p');

          var username = getUserDiv(requester_id);

          if(username){     //On vérifie si le username est connu
            invite_p.innerHTML = username;   //On l'affiche
          }else{
            invite_p.classList.add('lazy-load');   //On ajoute la class lazy-load + un attribut pour le charger plus tard
            invite_p.setAttribute('data-id', requester_id);
            if(!user_to_load.includes(requester_id)){    //Si l'id de l'user n'est pas déjà recherché alors on l'ajoute à la liste de recherche
              user_to_load.push(requester_id);
            }
          }

          var accept_button = document.createElement('button');
          accept_button.innerHTML = 'Accepter';
          accept_button.setAttribute('data-id', invitation_id)
          accept_button.onclick = acceptInvitation;

          var refuse_button = document.createElement('button');
          refuse_button.innerHTML = 'Refuser';
          refuse_button.setAttribute('data-id', invitation_id)
          refuse_button.onclick = refuseInvitation;

          invite_div.appendChild(invite_p);
          invite_div.appendChild(accept_button);
          invite_div.appendChild(refuse_button);

          invite_list.appendChild(invite_div);
          doNotify();
      //  }
      }
    }

  }, function (err) {
    console.log(err);
  });
}

function acceptInvitation(event){
  var id = event.srcElement.getAttribute('data-id');
  acceptInvite(id).then(function (data){
    console.log(data);
  }, function (err){
    console.log(err);
  });
}

function refuseInvitation(event){
  var id = event.srcElement.getAttribute('data-id');
  refuseInvite(id).then(function (data){
    console.log(data);
  }, function (err){
    console.log(err);
  });
}

function searchForContact(){
  var search = document.getElementById('contact_search').value;

  searchContact().then(function (data){
    if(data && data !== ''){
      var contact = JSON.parse(data);
      console.log(contact);

      var contact_search = document.getElementById('searches');
      contact_search.innerHTML = '';

      for(var i = 0; i<contact.length; i++){
        //if(!document.querySelector(".search[data-id='" + contact[i].id + "']")){
          var contact_div = document.createElement('div');
          contact_div.classList.add('search');
          contact_div.setAttribute('data-id', contact[i].id);

          var contact_p = document.createElement('p');
          contact_p.innerHTML = contact[i].name;


          contact_div.appendChild(contact_p);

          if(contact[i].accepted){    //Ça veut dire qu'on est déjà contact
            var contact_image = document.createElement('i');
            contact_image.classList.add('material-icons');
            contact_image.innerHTML = 'person';

            contact_div.appendChild(contact_image);
          }else{
            var contact_button = document.createElement('button');
            contact_button.innerHTML = 'Ajouter';
            contact_button.setAttribute('data-id', contact[i].id)
            contact_button.onclick = createContactInvite;

            contact_div.appendChild(contact_button);
          }

          contact_search.appendChild(contact_div);
        //}
      }
    }
  }, function (err){
    console.log(err);
  });
}

function createContactInvite(event){
  var id = event.srcElement.getAttribute('data-id');
  inviteContact(id);
}

function initContextMenu(){
  $.contextMenu({
      selector: '.contact',
      trigger: 'left',
      callback: function(key, options) {
          var m = "clicked: " + key;
          window.console && console.log(m) || alert(m);
      },
      items: {
          "profile": {
              name: "<i class='material-icons'>account_box</i><p>Voir profil</p>",
              isHtmlName: true
          },
          "direct_message": {
              name: "<i class='material-icons'>mail</i><p>Message direct</p>",
              isHtmlName: true
          },
          "audio_call": {
              name: "<i class='material-icons'>call</i><p>Appel audio</p>",
              isHtmlName: true
          },
          "video_call": {
              name: "<i class='material-icons'>video_call</i><p>Appel video</p>",
              isHtmlName: true
          }
      }
  });
}
