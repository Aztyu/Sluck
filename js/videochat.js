var peer;
var connection;

function startPeerConnection(){
  peer = new Peer({
    /*config: {
      'iceServers': [
          { url: 'stun:stun.l.google.com:19302' },
      ]
    },*/
    key: PEERJS_KEY,
    debug: 3
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
    /*connection.on('open', function(data){
      console.log(data);
    });

    connection.on('data', function(data) {
      console.log('Received', data);
    });*/
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
