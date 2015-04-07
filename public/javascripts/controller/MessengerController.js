app.controller('MessengerController', function ($scope, $stateParams, socket) {

	var peer = new Peer({host: 'localhost', port: 8000, path: '/peerjs'});

	$scope.login = $stateParams.login;

	peer.on('open', function(id) {
	    console.log('My peer ID is: ' + id);
	 //    var user = {
	 //    	login: "christo",
	 //    	id: id
	 //    };
			
		// socket.emit('ready', user, function(){
		// 	console.log('ready');
		// });
	});

});