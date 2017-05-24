function doNotify() {
	Notification.requestPermission().then(function (result){
		var notif = new Notification('Nouvelle invitation reçue !', {
			'body': 'Vous avez reçu une nouvelle demande de contact.'
		});
	});
}