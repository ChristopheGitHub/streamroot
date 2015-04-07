app.controller('MessengerController', function ($scope, $stateParams, socket) {

	$scope.user = $stateParams.user;

	$scope.query = "";

	$scope.directory = null;

	console.log($scope.user.username);	
	console.log($scope.user.peerId);

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

	// $scope.selectUser = function(user){
	// 	if(!conversationExist(user)){
	// 		createConversation(user);
	// 	}
	// };

	// conversationExist = function(){
	// 	return false;
	// };

	// createConversation = function(){

	// };

});