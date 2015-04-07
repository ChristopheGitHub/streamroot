app.controller('MessengerController', function ($scope, $stateParams, socket) {

	$scope.user = $stateParams.user;
	$scope.peer = $stateParams.peer;
	$scope.query = "";
	$scope.directory = null;
	$scope.conversations = [];

	console.log($scope.user.username);	
	console.log($scope.user.peerId);
	console.log($scope.peer);

	var getUserFromPeerId = function(id){
		var res = "";
		angular.forEach($scope.directory, function(user){
			if (user.peerId === id){
				res = user.username;
			}
		});
		return res;
	};

	socket.emit('getList', function() {
		console.log("Get List");
	});

	socket.on('directory', function (data) {
		console.log('directory');
		setDirectory(data);
	});

	socket.on('newUser', function (data) {
		console.log('newUser');
		setDirectory(data);
	});

	setDirectory = function(data) {
		delete data[$scope.user.username];
		$scope.directory = data;
		console.log($scope.directory);
	};

	$scope.createConversation = function(user){
		console.log('createConversation');
		var dataConnection = $scope.peer.connect(user.peerId);
		var conversation = {
			title: user.username,
			dataConnection: dataConnection
		};
		$scope.conversations.push(conversation);
	};

	$scope.peer.on('connection', function(connection){
		var user = getUserFromPeerId(connection.peer);
		console.log('user ' + user + "want to start conv");
		var conversation = {
			title: user,
			dataConnection: connection
		};
		$scope.$apply($scope.conversations.push(conversation));
		console.log($scope.conversations);
	});

});