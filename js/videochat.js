var peer;
var connection;
var mediastream;
var localstream;
var current_call;

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
    document.getElementById('call_status').innerHTML = 'Appel en cours...';
  });
}

function actionCall(action){
  navigator.getUserMedia({video: true, audio: true}, function(stream) {
    if(action === 'accept'){
      current_call.answer(stream); // Answer the call with an A/V stream.
      document.getElementById('call_status').innerHTML = 'Appel accepté';

      localstream = stream;
      var video_local = document.getElementById('localvideo');    //On ajoute le stream local
      video_local.src = (URL || webkitURL || mozURL).createObjectURL(stream);
      video_local.play();
      video_local.volume = 0;     //On le mute pour ne pas s'entendre parler

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
      current_call.answer(); // Answer the call with an A/V stream.

      current_call.on('stream', function(toto){
        console.log('Call stream');
        setTimeout(function(){
            current_call.close();
            document.getElementById('call_status').innerHTML = 'Appel refusé';
        }, 1500);
        //current_call.close();

      });
    }
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
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
    var call = peer.call(id, stream);

    call.on('stream', function(remoteStream) {
      console.log('Appel sortant' + remoteStream);

      var video = document.getElementById('webrtcvideo');
      video.src = (URL || webkitURL || mozURL).createObjectURL(remoteStream);
      video.play();
    });

    call.on('close', function(){
      console.log("Appel refusé");
    });

  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
}

function videoStreamDisconnect(event){
    console.log("Inactif");
    console.log(event);

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
