var invite_contact_interval;
var contact_interval;

function startInviteUpdate(){
  let timeout = UPDATE_INVITE;
  var action = getContactInviteList; //On récupère la liste
  invite_contact_interval = setInterval(action, timeout);
  action();                         //On démarre la boucle
}

function startContactUpdate(){
  let timeout = UPDATE_CONTACT;
  var action = getContactList; //On récupère la liste
  contact_interval = setInterval(action, timeout);
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
          var contact_li = document.createElement('li');
          contact_li.classList.add('contact');
          contact_li.setAttribute('data-id', contacts[i].contact.id);
          contact_li.setAttribute('data-name', contacts[i].contact.name);
          contact_li.setAttribute('data-peerjs', contacts[i].peerjs_id);

          var contact_a = document.createElement('a');
          contact_a.innerHTML = contacts[i].contact.name;   //On utilise le nom du contact qui peut être modifié

          var status_color;

          switch (contacts[i].status) {
            case 1:
              status_color = 'green';
              break;
            case 2:
              status_color = 'yellow';
              break;
            case 3:
              status_color = 'red';
              break;
            default:
              status_color = 'white';
          }
          contact_a.innerHTML += ' <span class="ball ' + status_color + '"></span>';

          contact_li.appendChild(contact_a);
          contact_li.onclick = openContactPage;

          contact_list.appendChild(contact_li);
      }
      initContextMenu();
    }
  }, function (err) {
    console.log(err);
  });
}

function openContactPage(event){
  var elem = event.target.parentNode;

  showAnotherProfil();
  current_contact_id = elem.getAttribute('data-id');

  var peerjs = elem.getAttribute('data-peerjs');

  if(peerjs == "null"){
    document.querySelector('#video_call').disabled = true;
    document.querySelector('#audio_call').disabled = true;
  }else{
    document.querySelector('#video_call').disabled = false;
    document.querySelector('#audio_call').disabled = false;

    document.querySelector('#video_call').onclick = function() {
      connectVideo(peerjs);
    }
  }

  document.querySelector('#contact_name').value = elem.getAttribute('data-name');
  document.querySelector('#contact_image').src = "http://cdn.qwirkly.fr/profile/" + current_contact_id;
}

function getContactInviteList(){
  contactInviteList().then(function (data) {
      if(data && data !== ''){
        var invitations = JSON.parse(data);
        var invite_list = document.getElementById('pending-invitations');
        invite_list.innerHTML = '';

        for(var i = 0; i<invitations.length; i++){
          var requester_id = invitations[i].requester_id;
          var invitation_id = invitations[i].invitation_id;

          var contact = document.createElement('li');
          contact.setAttribute('data-id', invitation_id);

          var contact_link = document.createElement('a');
          contact_link.setAttribute('href', '#');
          contact_link.className += 'contact-link';

          var username = getUserDiv(requester_id);
          if(username){     //On vérifie si le username est connu
            contact_link.innerHTML = username;   //On l'affiche
          }else{
            contact_link.classList.add('lazy-load');
            contact_link.setAttribute('data-id', invitation_id);
            if(!user_to_load.includes(requester_id)){
              user_to_load.push(requester_id);
            }
          }

          var accept_button = document.createElement('i');
          accept_button.className += 'zmdi zmdi-check zmdi-hc-lg choice-button';
          accept_button.setAttribute('data-id', invitation_id);
          accept_button.onclick = acceptInvitation;

          var refuse_button = document.createElement('i');
          refuse_button.className += 'zmdi zmdi-close-circle-o  zmdi-hc-lg choice-button';
          refuse_button.setAttribute('data-id', invitation_id);
          refuse_button.onclick = refuseInvitation;

          contact.appendChild(refuse_button);
          contact.appendChild(accept_button);
          contact.appendChild(contact_link);
          invite_list.appendChild(contact);
          doNotify(invitation_id);
        }
      }
  });
}

function acceptInvitation(event){
  var id = event.srcElement.getAttribute('data-id');
  var li = event.srcElement.parentNode;
  acceptInvite(id).then(function (data){
    li.parentNode.removeChild(li);
    console.log(data);
  }, function (err){
    console.log(err);
  });
}

function showAnotherProfil(){
  navigateToTab('profiluserbox');
  hideSearchBar();
}

function showAndLoadProfil(){
  navigateToTab('profilbox');
  hideSearchBar();

  document.getElementById("pseudo_user").value = 'Pseudo ' + connected_user.name;
  document.getElementById("addressmail_user").value = connected_user.email;
}

function hideSearchBar(){
  var divsToHide = document.getElementsByClassName("morphsearch");
    for(var i = 0; i < divsToHide.length; i++)
    {
    divsToHide[i].style.visibility="hidden";
    }
}

function showSearchBar(){
  var divsToHide = document.getElementsByClassName("morphsearch");
    for(var i = 0; i < divsToHide.length; i++)
    {
    divsToHide[i].style.visibility="visible";
    }
}

function clearInfoProfil(){
  
  document.getElementById("addressmail_user").value = '';
  document.getElementById("pwd_user").value = '';
  document.getElementById("confirmpwd_user").value = '';
  document.getElementById("slogan_user").value = '';
}

function refuseInvitation(event){
  var id = event.srcElement.getAttribute('data-id');
  var li = event.srcElement.parentNode;
  refuseInvite(id).then(function (data){

    li.parentNode.removeChild(li);
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

function initContextMenu(){   //TODO bouger sur les photos de profil dans les conversations
  /*$.contextMenu({
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
  });*/
}
