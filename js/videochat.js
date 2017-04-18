var peer;
var connection;

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
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      call.answer(stream); // Answer the call with an A/V stream.

      call.on('stream', function(remoteStream) {
        console.log('Appel entrant' + remoteStream);

        var video = document.getElementById('webrtcvideo');
        video.src = (URL || webkitURL || mozURL).createObjectURL(remoteStream);
        video.play();
      });
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    });
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
  /*connection.on('open', function(data){
    console.log(data);
  });

  connection.on('data', function(data) {
    console.log('Received', data);
  });*/
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
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
}
