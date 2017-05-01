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
    console.log(data);

    if(data && data !== ''){
      var contacts = JSON.parse(data);

      for(var i = 0; i<contacts.length; i++){
        if(!document.querySelector(".contact[data-id='" + contacts[i].id + "']")){
          var contact_div = document.createElement('div');
          contact_div.classList.add('contact');
          contact_div.setAttribute('data-id', contacts[i].id);

          var contact_p = document.createElement('p');
          contact_p.innerHTML = contacts[i].name;   //On utilise le nom du contact qui peut être modifié

          var contact_list = document.getElementById('contacts');

          contact_div.appendChild(contact_p);
          contact_list.appendChild(contact_div);
        }
      }
    }
  }, function (err) {
    console.log(err);
  });
}

function getContactInviteList(){
  contactInviteList().then(function (data) {    //Si on se connecte
    if(data && data !== ''){
      var invitations = JSON.parse(data);

      for(var i = 0; i<invitations.length; i++){
        var requester_id = invitations[i].requester_id;
        var invitation_id = invitations[i].invitation_id;

        if(!document.querySelector(".invite[data-id='" + invitation_id + "']")){
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
          refuse_button.innerHTML = 'Accepter';
          refuse_button.setAttribute('data-id', invitation_id)
          refuse_button.onclick = refuseInvitation;

          var invite_list = document.getElementById('invitations');

          invite_div.appendChild(invite_p);
          invite_div.appendChild(accept_button);
          invite_div.appendChild(refuse_button);

          invite_list.appendChild(invite_div);
        }
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

      for(var i = 0; i<contact.length; i++){
        if(!document.querySelector(".search[data-id='" + contact[i].id + "']")){
          var contact_div = document.createElement('div');
          contact_div.classList.add('search');
          contact_div.setAttribute('data-id', contact[i].id);

          var contact_p = document.createElement('p');
          contact_p.innerHTML = contact[i].name;

          var contact_search = document.getElementById('searches');
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
        }
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
