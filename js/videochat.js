var peer;
var connection;

function startPeerConnection(){
  peer = new Peer({
    host: '193.70.38.229',
    port: 3389,
    path: '/'
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
