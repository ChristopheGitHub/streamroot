'use strict';

app.controller('MessengerController', function ($scope, $stateParams, $modal, socket, peer) {

	//$scope.peer = $stateParams.peer;

	$scope.user = $stateParams.user;
	// $scope.peer = $stateParams.peer;
	$scope.query = "";
	$scope.directory = null;
	$scope.conversations = [];

	// To remember who's banned when the directory is updated
	var banned = [];

	console.log($scope.user.username);	
	console.log('ancien id: ' + $scope.user.peerId);
	console.log(peer);

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
				res = user;
			}
		});
		return res;
	};

	// Messages events operations

	socket.emit('clientAskDirectory', function() {
		console.log("Get List");
	});

	socket.on('serverSendDirectory', function (data) {
		console.log('serverSendDirectory');
		setDirectory(data);
	});

	socket.on('serverUserConnection', function (data) {
		console.log('newUser' + data.newUser);
		setDirectory(data.directory);
	});

	socket.on('serverUserDisconnection', function (data) {
		console.log('user : ' + data.username + ' disconnected.');
		setDirectory(data.directory);
	});

	// Conversations operations
	
	var displayUsersModal = function(callback) {
		var modalInstance = $modal.open({
	      templateUrl: '../../views/groupModal.html',
	      controller: 'GroupModalController',
	      resolve: {
	        directory: function () {
	        	return $scope.directory;
	        }
	      }
	    });

	    modalInstance.result.then(function (selected) {
	    	callback(selected);
	    });
	};
	
	$scope.startGroupConversation = function(){
		displayUsersModal(function(selected){
			createGroupConversation(selected);
		});
	};

	var createGroupConversation = function(usersArray) {
		$scope.createConversation(usersArray);
	};

	var createConvTitle = function (usersArray) {
		if (usersArray.length === 1) {
			return usersArray[0].username;
		} else {
			var convTitle = '';
			for (var i = 0; i < usersArray.length; i++) {
				convTitle = (i===usersArray.length-1) ? convTitle + (usersArray[i].username) : (usersArray[i].username) + " - ";
			}
			return convTitle;
		}
	};

	$scope.createConversation = function(usersArray){
		// Create conversation title
		var conversationTitle = createConvTitle(usersArray);
		var header = Date.now();

		// Create conversation object
		var conversation = {
			title: conversationTitle,
			header: header,
			members: usersArray,
			dataConnection: [],
			messages: []
		};

		// Push conversation in conversation collections, displays it
		$scope.conversations.push(conversation);
		
		// Connect to each members of the conversation and listen.
		usersArray.map(function(user){

			// Connect to the member
			var dataConnection = peer.connect(user.peerId);

			// Save the connection
			conversation.dataConnection.push(dataConnection);

			// Acknowledge this user of the conversation and its members
			console.log('envoi des paramtres');
			dataConnection.on('open', function() {
				var data = {
					type: 'new conversation',
					members: usersArray,
					header: header
				};
				this.send(data);
			});

			// Listen for messages
			dataConnection.on('data', function(message){
				$scope.$apply(conversation.messages.push(message));
			});
		});

	};

	peer.on('connection', function(connection){
		var sender = getUserFromPeerId(connection.peer);

		console.log('fonction connection');
		
		connection.on('open', function(){
			
			connection.on('data', function(data){
				
				if (data.type === 'new conversation') {

					var members = data.members; 

					// Set the correct members for this peers point of view;
					members.push(sender);	// Add the guy who send the new conversation msg
					var index = null;
					// remove it self
					for (var i = 0; i < members.length; i++) {
						index = (members[i].username == $scope.user.username) ? i : index;
					}
					members.splice(index, 1);

					// Create conversation title
					var conversationTitle = createConvTitle(members);
					console.log('conversationTitle');
					console.log(conversationTitle);

					var conversation = {
						title: conversationTitle,
						header: data.header,
						members: members,
						dataConnection: [],
						messages: []
					};

					// Push conversation in conversation collections,
					// therefore displaying it
					$scope.$apply($scope.conversations.push(conversation));

					// Save the connection
					conversation.dataConnection.push(connection);

					// New array without the sender of the 'new conversation event'
					// We're already listening him.
					var members2 = [];
					for (var j = 0; j < members.length; j++) {
						if(members[j].username !== sender.username){
							members2.push(members[j]);
						}
					}

					// Connect to each members of the conversation and listen.
					members2.map(function(user){
						// Connect to the member
						var dataConnection = peer.connect(user.peerId);

						// Save the connection
						conversation.dataConnection.push(dataConnection);
					});

				} else {
					// When type is 'message'
					angular.forEach($scope.conversations, function(conversation){
						if(conversation.header === data.header){
							$scope.$apply((conversation.messages.push(data)));
						}						
					});
				}
			});
		});
	});

	$scope.send = function(){
		var message = {
			type: 'message',
			header: this.conv.header,
			author: $scope.user.username,
			text: this.newMessage
		};

		// Send to each member of the conversation the message
		this.conv.dataConnection.map(function (connection) {
			connection.send(message);
			console.log('Sending to ' + connection.peer + ' the message ' + message.text);
		});

		// Add the message in the conversation (displays it)
		this.conv.messages.push(message);
		this.newMessage = "";
		// console.log(this.conv);
	};

});