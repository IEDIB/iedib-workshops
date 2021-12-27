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
 
app.run(function($rootScope, cfg, socket, growl, $location) {
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
            var cuser = cfg.getUser();
            console.log("Leaving room "+idRoom);
            socket.emit("rooms:leave", {id:idRoom, idUser: cuser.idUser, nick: cuser.nick});
        }

        //Detect room join
        if(current.$$route.controller=="WaitingCtrl" || current.$$route.controller=="PlayingCtrl") {
            var idRoom = current.pathParams.idroom;
            var cuser = cfg.getUser();
            if(!cuser) {
                //This is an error so must ask to identify
                $location.path("/");
                return;
            }
            console.log("Joining room "+idRoom);
            socket.emit("rooms:join", {id: idRoom, idUser: cuser.idUser, nick: cuser.nick}, function(success, msg){
                console.log("RESULT");
                if(!success) {
                    growl.error(msg);
                }  
            }); 
        }

        //Every time we land on RoomsCtrl ask to update the list of rooms
        if(current.$$route.controller=="RoomsCtrl") {
            socket.emit("rooms:available");
        }
        //Every time we land on WaitingCtrl ask to update the list of participants in this room
        else if(current.$$route.controller=="WaitingCtrl") {
            var idRoom = current.pathParams.idroom;
            socket.emit("rooms:participants", {id: idRoom}, function(success, msg) {
                if(!success) {
                    growl.error(msg);
                    $location.path("/rooms");
                }
            });
        }
        
    });
});
 
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
    socket.on("rooms:available", function(rooms){
        $scope.rooms = rooms;
    });

    $scope.joinroom = function(r) { 
        console.log("Attempting join room", r);
        $location.path("/waiting/"+r.id);
        
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
    $scope.canSubmitStart = true;
    //TODO decide who can press submit start game
   
    socket.on("rooms:participants", function(participants) {
        if(participants == "invalid_room") {
            console.log("invalid room");
            //invalid room man
            $location.path("/rooms");
            return;
        }
        $scope.participants = participants;
    });

    socket.on("bingo:start", function() {
        // Prepare to start the game
        growl.info("La partida està apunt de començar.");
        $location.path("/playing/"+$scope.idRoom);
    });

    $scope.onSubmitStart = function() {
        socket.emit("bingo:start", {id: $scope.idRoom});
    };
 
};

var PlayingCtrl = function($scope, $location, $route, cfg, socket, growl) {
    $scope.balls = [];
    $scope.gameOver = false;

    var cuser = cfg.getUser();
    if(!cuser) {
        $location.path("/");
    }
    //check if set roomId
    $scope.idRoom = $route.current.params.idroom;
    
    socket.on("bingo:nextball", function(ball) {
        //next ball has arrived!
        //TODO pas the ball.id in order to detect missing balls
        growl.info("Ha arribat la bolla " + ball.latex);
        $scope.balls.push(ball);
    });
    socket.on("bingo:gameover", function() {
        //the game has finished
        growl.info("El joc s'ha acabat.");
        //TODO disable everything
        $scope.gameOver = true;
    });
    socket.on("bingo:linea", function(res) {
        //result of the linea test
        growl.info("Linea from "+ JSON.stringify(res))
    });
    socket.on("bingo:bingo", function(res) {
        //result of the bingo test
        growl.info("Bingo from "+ JSON.stringify(res))
    });

    $scope.testLinia = function() {
        console.log("Sending bingo:linea");
        socket.emit("bingo:linea", {id: $scope.idRoom, numbers: [1,2,3,4,5,6,7,8,9], user: cuser});
    };
    $scope.testBingo = function() {
        console.log("Sending bingo:bingo");
        socket.emit("bingo:bingo", {id: $scope.idRoom, numbers: [1,2,3,4,5,6,7,8,9], user: cuser});
    };
    $scope.sortirJoc = function() {
        $location.path("/rooms");
    };

};


LandingCtrl.$inject = ["$scope", "$location", "cfg", "socket", "growl"];
RoomsCtrl.$inject = ["$scope", "$location", "cfg", "socket", "growl"];
WaitingCtrl.$inject = ["$scope", "$location", "$route", "cfg", "socket", "growl"];
PlayingCtrl.$inject = ["$scope", "$location", "$route", "cfg", "socket", "growl"];

app.controller("LandingCtrl", LandingCtrl);
app.controller("RoomsCtrl", RoomsCtrl);
app.controller("WaitingCtrl", WaitingCtrl);
app.controller("PlayingCtrl", PlayingCtrl);

app.config(['$routeProvider', 'growlProvider',
    function config($routeProvider, growlProvider) {
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

        growlProvider.onlyUniqueMessages(true);
        growlProvider.globalTimeToLive(5000);
        growlProvider.globalPosition('top-right');
        growlProvider.globalDisableCountDown(true);
    }
]);