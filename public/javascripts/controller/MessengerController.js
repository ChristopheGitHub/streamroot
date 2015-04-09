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
		console.log('newUser' + data.username);
		setDirectory(data.directory);
	});

	socket.on('serverUserDisconnection', function (data) {
		console.log('user : ' + data.username + ' disconnected.');
		setDirectory(data.directory);
		closeConversationsWithDisconnectedUSer(data.username);
	});

	// Conversations operations
	
	var closeConversationsWithDisconnectedUSer = function(username) {
		for(var i = 0; i < $scope.conversations.length; i++ ) {
			for(var j = 0; j < $scope.conversations[i].members.length; j++) {
				if ($scope.conversations[i].members[j].username === username) {
					// If its a dual conv, I delete the conv, otherwise, just delete the member
					if ($scope.conversations[i].members.length === 1) {
						delete $scope.conversations[i];
					}	else {
						console.log('delete ' + $scope.conversations[i].members[j].username + ' from conv');
						var message = {
							type: 'message',
							header: $scope.conversations[i].header,
							author: 'system',
							text: $scope.conversations[i].members[j].username + ' disconneted'
						};
						$scope.conversations[i].messages.push(message);
						delete $scope.conversations[i].members[j];
					}
				}
			}
		}
	};
	
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


					// Set the correct conversation members for this peers pov :
					// 	- add the sender
					// 	- remove it self
					var members = data.members; 
					members.push(sender);	
					
					(function removeUserFromMembers() {
						var index = null;
						// remove it self
						for (var i = 0; i < members.length; i++) {
							index = (members[i].username == $scope.user.username) ? i : index;
						}
						members.splice(index, 1);
					})();

					// Create conversation
					var conversation = {
						title: createConvTitle(members),
						header: data.header,
						members: members,
						dataConnection: [],
						messages: []
					};

					// Push conversation in conversation collections and displays it
					$scope.$apply($scope.conversations.push(conversation));

					// Save the sender connection
					conversation.dataConnection.push(connection);

					// Connect to each other potential members of the conversation save their DataConnection.
					angular.forEach(members, function(user){
						if(user.username !== sender.username) {
							// Connect to the member
							var dataConnection = peer.connect(user.peerId);

							// Save the connection
							conversation.dataConnection.push(dataConnection);
						}
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
		// Here this refers to
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