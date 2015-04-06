app.controller('LoginController', function ($scope, $state, socket) {

	$scope.login = function (login) {
		socket.emit('login', login);
	};

	socket.on('loginOk', function () {
		console.log('loginOk');
		$state.go('messenger');
	});

	socket.on('loginNotOk', function () {
		console.log('loginNotOk');
	});

});