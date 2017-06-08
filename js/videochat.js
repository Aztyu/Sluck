var peer;
var peer_id;
var connection;

var mediastream;
var localstream;

var current_call;
var caller_id;

$(document).ready(function(){
  startPeerConnection();      //On démarre le composant webrtc
});

function startPeerConnection(){
  peer = new Peer({
    host: '193.70.38.229',
    port: 3389,
    path: '/',
    config: {'iceServers': [
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'turn:193.70.38.229', credential: 'sluck_kiki', username: 'sluck_api' }
    ]}
  });

  console.log(peer);

  peer.on('open', function(){
   console.log('Mon id est le ' + peer.id);
  });

  peer.on('connection', function(conn) {
    console.log(conn);
    connection = conn;

    connection.on('open', function() {
      // Receive messages
      connection.on('data', function(data) {
        console.log('Received', data);
      });

      // Send messages
      connection.send('Hello!');
    });
  });

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  peer.on('call', function(call) {
    current_call = call;

    console.log(call);

    showCall(call.peer);
  });
}

function showCall(peer_id){
  document.getElementById('webrtc_call_div').classList.remove('hidden');

  var contacts = document.querySelectorAll('li.contact');

  var caller_name = '...';

  for(var i=0; i<contacts.length; i++){
    if(contacts[i].getAttribute('data-peerjs') == peer_id){
      caller_name = contacts[i].getAttribute('data-name');
      caller_id = contacts[i].getAttribute('data-id');
      break;
    }
  }

  document.getElementById('call_status').innerHTML = 'Appel en cours de ' + caller_name;
}

function actionCall(action){
  navigator.getUserMedia({video: true, audio: true}, function(stream) {
    if(action === 'accept'){
      document.getElementById('webrtc_call_div').classList.add('hidden');

      if(caller_id){
        openContactPageLi(document.querySelector('li.contact[data-id="' + caller_id + '"]'));
      }

      current_call.answer(stream); // Answer the call with an A/V stream.
      document.getElementById('call_status').innerHTML = 'Appel accepté';

      localstream = stream;
      initLocalStream(localstream);

      current_call.on('stream', function(remoteStream) {
        console.log('Appel entrant' + remoteStream);
        var mediastream = remoteStream;

        mediastream.oninactive = videoStreamDisconnect;

        mediastream.onaddtrack = function(event){
          console.log("Add track");
          console.log(event);
        }

        mediastream.onactive = function(event){
          console.log("actif");
          console.log(event);
        }

        var video = document.getElementById('webrtcvideo');
        video.src = (URL || webkitURL || mozURL).createObjectURL(remoteStream);
        video.play();
      });
    }else{
      document.getElementById('webrtc_call_div').classList.add('hidden');

      current_call.answer(); // Answer the call with an A/V stream.

      current_call.on('stream', function(toto){
        console.log('Call stream');
        setTimeout(function(){
            current_call.close();
            document.getElementById('call_status').innerHTML = 'Appel refusé';
        }, 1500);
      });

      current_call.on('close', function(toto){
        console.log('Yolo close');
      });

      current_call.on('disconnected', function(toto){
        console.log('Yolo disconnect');
      });

      current_call.on('destroy', function(toto){
        console.log('Yolo destroy');
      });
    }
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
}

function initLocalStream(locale_stream){
  var video_local = document.getElementById('localvideo');    //On ajoute le stream local
  video_local.src = (URL || webkitURL || mozURL).createObjectURL(locale_stream);
  video_local.play();
  video_local.volume = 0;     //On le mute pour ne pas s'entendre parler
}

function connectTo(id){
  connection = peer.connect(id);

  connection.on('open', function() {
    // Receive messages
    connection.on('data', function(data) {
      console.log('Received', data);
    });

    // Send messages
    connection.send('Hello!');
  });
}

function sendMessage(message){
  connection.send(message);
}

function connectVideo(id){
  navigator.getUserMedia({video: true, audio: true}, function(stream) {
    localstream = stream;
    initLocalStream(localstream);

    var call = peer.call(id, stream);
    current_call = call;

    call.on('stream', function(remoteStream) {
      console.log('Appel sortant' + remoteStream);

      var video = document.getElementById('webrtcvideo');
      video.src = (URL || webkitURL || mozURL).createObjectURL(remoteStream);
      video.play();
    });

    call.on('close', function(){
      console.log("Appel refusé");

      videoStreamDisconnect(null);
    });

  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
}

function videoStreamDisconnect(event){
    console.log("Inactif");
    console.log(event);

    if(localstream){
      for (let track of localstream.getTracks()) {
          track.stop();
      }
    }

    if(mediastream){
      for (let track of mediastream.getTracks()) {
          track.stop();
      }
    }

    localstream = null;
    mediastream = null;

    document.getElementById('webrtcvideo').src = '';
    document.getElementById('localvideo').src = '';
}

function muteMicrophone(element){
  console.log(element);
  var status = element.getAttribute('data-mic');

  if(status === "on"){
    if(localstream){
      localstream.getAudioTracks()[0].enabled = false;
    }
    element.innerHTML = 'mic_off';
    element.setAttribute('data-mic', 'off');
  }else{
    if(localstream){
      localstream.getAudioTracks()[0].enabled = true;
    }
    element.innerHTML = 'mic_on';
    element.setAttribute('data-mic', 'on');
  }
}

function setVolume() {
   var volume_ctrl = document.getElementById("volume-stream");
   var stream_elem = document.getElementById("webrtcvideo");

   stream_elem.volume = volume_ctrl.value;
}
