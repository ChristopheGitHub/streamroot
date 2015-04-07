app.controller('MessengerController', function ($scope, $stateParams, socket) {

	$scope.user = $stateParams.user;

	console.log($scope.user.username);	
	console.log($scope.user.peerId);

	socket.emit('getList', function() {
		console.log("Get List");
	});

	socket.on('directory', function (data) {
		console.log('directory');
		$scope.directory = data;
	});

	socket.on('newUser', function (data) {
		console.log('newUser');
		$scope.directory = data;
	});

});