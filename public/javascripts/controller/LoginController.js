app.controller('LoginController', function ($scope, $state, socket) {

	$scope.username = "";

	$scope.login = function (username) {
		socket.emit('login', username);
	};

	socket.on('loginOk', function () {
		console.log('loginOk');
		$state.go('messenger', {login: $scope.username});
	});

	socket.on('loginNotOk', function () {
		console.log('loginNotOk');
	});

});