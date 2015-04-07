app.controller('LoginController', function ($scope, $state, socket) {

	$scope.peer = new Peer({host: 'localhost', port: 8000, path: '/peerjs'});

	$scope.user = {
		username: "",
		peerId: null
	};
	
	$scope.peer.on('open', function(id) {
	    console.log('My peer ID is: ' + id);
	    $scope.user.peerId = id;
	});

	$scope.login = function () {
		var data = {
			login: $scope.user.username,
			peerId: $scope.user.peerId
		};

		socket.emit('clientSendUsername', data);
	};

	socket.on('serverUsernameSaved', function () {
		console.log('serverUsernameSaved');
		$state.go('messenger', {user: $scope.user, peer: $scope.peer});
	});

	socket.on('serverUsernameAlreadyTaken', function () {
		console.log('serverUsernameAlreadyTaken');
	});

});