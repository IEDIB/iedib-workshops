 // Socket service
 angular.module('bingoApp.services', [])
    .value('version', '0.1')
    .factory('socket', function($rootScope) { 
    var socket = io.connect("http://127.0.0.1:3000"); 
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
})
.service("cfg", function(){
    var IBgames = sessionStorage.getItem("IB.games") || "{}";
    IBgames = JSON.parse(IBgames);
    if(!IBgames.bingo) {
        IBgames.bingo = {};
    }
    return {
        getUser: function() {
            return IBgames.user;
        },
        setNick: function(nick) {
            if(!IBgames.user) {
                IBgames.user = {nick: nick, idUser: "u"+Math.random().toString(32).substring(2)};
            } else {
                IBgames.user.nick = nick;
            }
            sessionStorage.setItem("IB.games", JSON.stringify(IBgames));
            return IBgames.user;
        }
    }
});
	


var app = angular.module("bingoApp", ['ngRoute', 'bingoApp.services', 'angular-growl']);
 
app.run(function($rootScope, cfg, socket) {
    $rootScope.$on('$routeChangeStart', function($event, current, previous) { 
        // ... you could trigger something here ...
        //$event.preventDefault();
        console.log($event);
        console.log(current);
        console.log(previous);

        //Detect room leave events
        if(previous!=null && (previous.$$route.controller=="WaitingCtrl" || previous.$$route.controller=="PlayingCtrl")
        && (current.$$route.controller!="WaitingCtrl" && current.$$route.controller!="PlayingCtrl")) {
            var idRoom = previous.pathParams.idroom;
            socket.emit("rooms:leave", {id:idRoom});
        }
        
    });
});

app.config(['growlProvider', function(growlProvider) {
    growlProvider.onlyUniqueMessages(false);
    growlProvider.globalTimeToLive(5000);
}]);

var LandingCtrl = function($scope, $location, cfg, socket, growl) {

    var cuser = cfg.getUser();
    $scope.nick = cuser? cuser.nick : "";
    $scope.onsubmit = function() {
        if(!$scope.nick.trim().length) {
            return;
        }
        cfg.setNick($scope.nick);
        $location.path('/rooms');
    };

};

var RoomsCtrl = function($scope, $location, cfg, socket, growl) {
 
    if(!cfg.getUser()) {
        $location.path("/");
    }
    socket.emit("rooms:available");
    socket.on("rooms:available", function(rooms){
        $scope.rooms = rooms;
    });

    $scope.joinroom = function(r) { 
        console.log("Attempting join room", r);
        var cuser = cfg.getUser();
        socket.emit("rooms:join", {id: r.id, idUser: cuser.idUser, nick: cuser.nick}, function(success, msg){
            console.log("RESULT");
            if(!success) {
                growl.error(msg);
            } else {
                var url = '/waiting/'+r.id;
                console.log("going to ", url);
                $location.path(url);
            }
        });
    };
    $scope.newroom = function() { 
        //emit the room created
        var cuser = cfg.getUser();
        socket.emit("rooms:create", {nick: cuser.nick, idUser: cuser.idUser}, function(success, msg) {
            if(!success) {
                growl.error(msg);
            } 
        });
    };

};

var WaitingCtrl = function($scope, $location, $route, cfg, socket, growl) {

    if(!cfg.getUser()) {
        $location.path("/");
    }
    //check if set roomId
    console.log($route);
    $scope.idRoom = $route.current.params.idroom;
    $scope.participants = [];
    socket.emit("rooms:participants", {id: $scope.idRoom}, function(success, msg) {
        if(!success) {
            growl.error(msg);
            $location.path("/rooms");
        }
    });
    socket.on("rooms:participants", function(participants) {
        if(participants == "invalid_room") {
            console.log("invalid room");
            //invalid room man
            $location.path("/rooms");
            return;
        }
        $scope.participants = participants;
    });

};

var PlayingCtrl = function($scope, $location, $route, cfg, socket, growl) {

    if(!cfg.getUser()) {
        $location.path("/");
    }
    //check if set roomId
    $scope.idRoom = $route.current.params.idroom;
    

};
LandingCtrl.$inject = ["$scope", "$location", "cfg", "socket", "growl"];
RoomsCtrl.$inject = ["$scope", "$location", "cfg", "socket", "growl"];
WaitingCtrl.$inject = ["$scope", "$location", "$route", "cfg", "socket", "growl"];
PlayingCtrl.$inject = ["$scope", "$location", "$route", "cfg", "socket", "growl"];

app.controller("LandingCtrl", LandingCtrl);
app.controller("RoomsCtrl", RoomsCtrl);
app.controller("WaitingCtrl", WaitingCtrl);
app.controller("PlayingCtrl", PlayingCtrl);

app.config(['$routeProvider',
    function config($routeProvider) {
      $routeProvider.
        when('/', {
          templateUrl: 'landing.html',
          controller: 'LandingCtrl'
        }).
        when('/rooms', {
          templateUrl: 'rooms.html',
          controller: 'RoomsCtrl'
        }).
        when('/waiting/:idroom', {
            templateUrl: 'waiting.html',
            controller: 'WaitingCtrl'
        }).
        when('/playing/:idroom', {
            templateUrl: 'playing.html',
            controller: 'PlayingCtrl'
        }).
        otherwise('/');
    }
]);