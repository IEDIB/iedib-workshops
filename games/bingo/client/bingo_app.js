	
var app = angular.module("bingoApp", ['ngRoute']);
 

var LandingCtrl = function($scope, $location) {

    window.IB = window.IB || {};
    window.IB.games = window.IB.games || {};
    
    $scope.nick = window.IB.games.nick || "Euler";
    $scope.onsubmit = function() {
        window.IB.games.nick = $scope.nick;
        $location.path('/rooms');
    };

};

app.controller("LandingCtrl", ["$scope", "$location", LandingCtrl]);

app.config(['$routeProvider',
    function config($routeProvider) {
      $routeProvider.
        when('/landing', {
          templateUrl: 'landing.html',
          controller: 'LandingCtrl'
        }).
        when('/rooms', {
          templateUrl: 'rooms.html'
        }).
        when('/waiting', {
            templateUrl: 'waiting.html'
        }).
        when('/playing', {
            templateUrl: 'playing.html'
        }).
        otherwise('/landing');
    }
]);