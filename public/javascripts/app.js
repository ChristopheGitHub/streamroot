var app = angular.module('chat', ['ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('main', {
			url: '',
			abtract: true,
			templateUrl: 'views/main.html'
		})

		.state('login', {
			parent: 'main',
			// url: '/login',
			templateUrl: 'views/login.html',
			controller: 'LoginController'
		})

		.state('messenger', {
			parent: 'main',
			templateUrl: 'views/messenger.html',
			controller: 'MessengerController',
			params: {
				login: null
			}
		});
});

app.run(['$state', function ($state) {
   $state.go('login');
}]);
