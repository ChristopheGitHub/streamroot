app.controller('MessengerController', function ($scope, $stateParams, socket) {

	$scope.user = $stateParams.user;

	console.log($scope.user.username);	
	console.log($scope.user.peerId);	

});