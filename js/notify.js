function doNotify() {
	Notification.requestPermission().then(function (result){
		var notif = new Notification('New Message', {
			'body': 'Bro, you received a new message'
		});
	});
}