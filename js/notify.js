var invitation_notif = {};

function doNotify(id) {
	if(!invitation_notif[id]) {
		Notification.requestPermission().then(function (result){
			var notif = new Notification('Nouvelle invitation reçue !', {
				'body': 'Vous avez reçu une nouvelle demande de contact.'
			});
		});
		invitation_notif[id] = true;
	}
}