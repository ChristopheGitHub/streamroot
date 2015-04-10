'use strict';

app.controller('MessengerController', function ($scope, $stateParams, $modal, socket, peer) {

	$scope.user          = $stateParams.user;
	$scope.query         = "";
	$scope.directory     = null;
	$scope.conversations = [];
	var banned           = []; // To remember who's banned when the directory is updated
	var hidden           = []; // To remember who's hidden when the directory is updated

	console.log($scope.user.username);	
	console.log('ancien id: ' + $scope.user.peerId);
	console.log(peer);

	var getUserFromUsername = function (username) {
		var res = null;
		angular.forEach($scope.directory, function (user) {
			if(user.username === username) {
				res = user;
			}
		});
		return res;
	};

	var setBanned = function(){
		angular.forEach($scope.directory, function(user){
			if(banned.indexOf(user.username) !== -1){
				user.banned = 'true';
			} else {
				user.banned = 'false';
			}
		});
	};

	var setHidden = function(){
		angular.forEach($scope.directory, function(user){
			if(hidden.indexOf(user.username) !== -1){
				user.hidden = 'true';
			} else {
				user.hidden = 'false';
			}
		});
	};

	$scope.switchBan = function(user){
		user.banned = (user.banned == 'true') ? 'false' : 'true';
		if (user.banned === 'true') {
			console.log('on ban');
			banned.push(user.username);
			closeConversationsWithUSer(user.username, ' is banned.');
			acknowledgePeerOnBanStatus(user, 'banned');
		} else {
			console.log('on unban');
			var index = banned.indexOf(user.username);
			banned.splice(index, 1);
			acknowledgePeerOnBanStatus(user, 'notBanned');
		}
		console.log($scope.directory);
	};

	var acknowledgePeerOnBanStatus = function(user, status) {
		var dataConnection = peer.connect(user.peerId);

		dataConnection.on('open', function(){
			var data = {
				type: 'banStatus',
				status: status,
				from: $scope.user.username
			};
			this.send(data);
		});
	};

	var switchHidden = function(user){
		user.hidden = (user.hidden == 'true') ? 'false' : 'true';
		if (user.hidden === 'true') {
			hidden.push(user.username);
			closeConversationsWithUSer(user.username, ' banned you.');
		} else {
			var index = hidden.indexOf(user.username);
			hidden.splice(index, 1);
		}
		console.log($scope.directory);
	};

	var setDirectory = function(data) {
		delete data[$scope.user.username];
		$scope.directory = data;
		setBanned();
		setHidden();
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
		closeConversationsWithUSer(data.username, ' is disconnected');
	});

	// Conversations operations
	
	var closeConversationsWithUSer = function(username, reason) {
		for(var i = $scope.conversations.length - 1; i >= 0; i-- ) {
			for(var j = $scope.conversations[i].members.length -1; j >= 0; j--) {
				if ($scope.conversations[i].members[j].username === username) {
					// If its a dual conv or the user have been banned, delete the conv
					if ($scope.conversations[i].members.length === 1 || reason === ' is banned.') {
						$scope.conversations.splice(i, 1);

					// Otherwise delete the member from the conv only
					} else {
						console.log('delete ' + $scope.conversations[i].members[j].username + ' from conv');
						var message = {
							type: 'message',
							header: $scope.conversations[i].header,
							author: 'system',
							text: $scope.conversations[i].members[j].username + reason
						};
						$scope.conversations[i].messages.push(message);
						$scope.conversations[i].members.splice(j,1);
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

				} else if (data.type === 'banStatus') {
					console.log('ban receu');
					var user = getUserFromUsername(data.from);
					$scope.$apply(switchHidden(user));
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