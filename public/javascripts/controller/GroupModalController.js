angular.module('chat').controller('GroupModalController', function ($scope, $modalInstance, directory) {

  $scope.directory = directory;
  
  $scope.users = [];
  angular.forEach($scope.directory, function(person){
    if (person.banned === 'false') {
      $scope.users.push(person.username);
    }
  });

  $scope.selected = [];

  $scope.select = function (user) {
    $scope.selected.push(user);
    $scope.users.splice($scope.users.indexOf(user), 1);
  };

  $scope.unSelect = function (user) {
    $scope.users.push(user);
    $scope.selected.splice($scope.selected.indexOf(user), 1);
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});