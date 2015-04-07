app.controller('MessengerController', function ($scope, $stateParams, socket) {

	$scope.user = $stateParams.user;
	$scope.peer = $stateParams.peer;
	$scope.query = "";
	$scope.directory = null;
	$scope.conversations = [];

	// To remember who's banned when the directory is updated
	var banned = [];

	console.log($scope.user.username);	
	console.log($scope.user.peerId);
	console.log($scope.peer);

	var setBanned = function(){
		angular.forEach($scope.directory, function(user){
			if(banned.indexOf(user.username) !== -1){
				user.banned = 'true';
			} else {
				user.banned = 'false';
			}
		});
	};

	$scope.switchBan = function(user){
		user.banned = (user.banned == 'true') ? 'false' : 'true';
		if (user.banned) {
			banned.push(user.username);
		} else {
			var index = banned.indexOf(user.username);
			banned.splice(index, 1);
		}
		console.log($scope.directory);
	};

	var setDirectory = function(data) {
		delete data[$scope.user.username];
		$scope.directory = data;
		setBanned();
	};

	var getUserFromPeerId = function(id){
		var res = "";
		angular.forEach($scope.directory, function(user){
			if (user.peerId === id){
				res = user.username;
			}
		});
		return res;
	};

	// Messages events operations

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

	// Conversations operations

	$scope.createConversation = function(user){
		console.log('createConversation');
		var dataConnection = $scope.peer.connect(user.peerId);
		var conversation = {
			title: user.username,
			dataConnection: dataConnection,
			messages: []
		};
		$scope.conversations.push(conversation);
	};

	$scope.peer.on('connection', function(connection){
		var user = getUserFromPeerId(connection.peer);
		console.log('user ' + user + "want to start conv");
		var conversation = {
			title: user,
			dataConnection: connection,
			messages: []
		};
		$scope.$apply($scope.conversations.push(conversation));
		console.log($scope.conversations);
		
		connection.on('data', function(message){
			conversation.messages.push(message);
			$scope.$apply($scope.conversations);
		});
	});

	$scope.send = function(conversation, text){
		var message = {
			author: $scope.user.username,
			text: text
		};
		conversation.dataConnection.send(message);
		conversation.messages.push(message);
		text = "";
	};

});