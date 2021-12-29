 
 // Socket service
 angular.module('bingoApp.services', [])
    .value('version', '0.1')
    .factory('socket', function($rootScope) { 
    var socket = io.connect("http://127.0.0.1:3000");
    var socketLocal = ioClientLocal.connect();
    var mode = {method: 'remote'};
    if(!socket.connected) {
        console.log("Socket not connected. Offline mode");
        mode.method = 'offline';
    } else {
        socket.on("connect_error", function() {
            console.log("connect error");
            mode.method = 'offline'; 
        });
    }
    return {
        on: function(eventName, callback) {
            var actualSocket = socket;
            if(!socket.connected || mode.method === 'offline') {
                console.log("Offline mode");
                actualSocket = socketLocal;
            }
            actualSocket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(actualSocket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            var actualSocket = socket;
            if(!socket.connected || mode.method === 'offline') {
                console.log("Offline mode");
                $rootScope.$emit('method', 'offline');
                actualSocket = socketLocal;
            }
            actualSocket.emit(eventName, data, function() {
                var args = arguments;
                /*
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(actualSocket, args);
                    }
                });
                */
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

app.directive('bingoHeader', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        headerInfo: '=info'
      },
      template:  '<div class="bingo_header">'+
      '<div class="user_ball">'+
      '     <h2 ng-bind="headerInfo.nick | initials" title="{{headerInfo.nick}}"></h2>'+
      '</div>'+
      ' <div>'+
      '     <h2>B I N G O - A P P</h2>'+
      '     <h3 ng-bind="headerInfo.typeName"></h3>'+
      ' </div>'+
      '<div class="room_exit" ng-show="headerInfo.id">'+
      '     <p ng-click="headerInfo.exit()">EXIT</p>'+
      '     <p ng-bind="headerInfo.id"></p>'+
      ' </div>'+
      '</div>'
    };
});
 
app.directive('bingoFooter', function() {
    return {
      restrict: 'E', 
      transclude: true,
      template: '<div class="bingo_footer">'+
                '<p>(c) Josep Mulet (2021-2022)</p>'+
                '</div>'
    };
});

app.directive('bingoCartro', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        cartro: '=cartro',
        bingoStarted: '=bingoStarted'
      },
      template:  '<div>'+
      ' <div ng-repeat="row in cartro.rows" class="cartro_row">'+
      '    <div ng-click="cell.toggle(bingoStarted)" '+
      ' ng-repeat="cell in row" class="cartro_cell" ng-class="{\'cartro_cellvoid\': cell.value==null, \'cartro_cellselected\': cell.selected}">'+
      '         <span ng-if="cell.value!=null">{{cell.value}}</span>'+
      '    </div>'+
      '  </div>'+
      '</div>'
    };
});

app.filter('initials', function() {
    return function(input) {
      return (angular.isString(input) && input.length > 0) ? input.charAt(0).toUpperCase() : "?";
    }
});

app.run(function($rootScope, cfg, socket, growl, $location) {

    //Detect offline operation
    $rootScope.$on("method", function(evt, value) { 

        console.log("Rootscope event ", evt, value);
        $rootScope.isOffline = value == 'offline';
        if(value === "offline" && !$rootScope.methodNotified) {
            $rootScope.methodNotified = true;
            growl.error("Vaja, no hi ha connexió. Estàs en mode fora de línia.", {ttl: -1, referenceId: 1});
        }
    });


    $rootScope.$on('$routeChangeStart', function($event, current, previous) { 
        // ... you could trigger something here ...
        //$event.preventDefault();
        console.log($event);
        console.log(current);
        console.log(previous);

        //Detect room leave events
        if(previous!=null && (previous.$$route.controller=="GameCtrl")
        && (current.$$route.controller!="GameCtrl")) {
            var idRoom = previous.pathParams.idroom;
            var cuser = cfg.getUser();
            console.log("Leaving room "+idRoom);
            socket.emit("rooms:leave", {id:idRoom, idUser: cuser.idUser, nick: cuser.nick});
        }

        //Detect room join
        if(current.$$route.controller=="GameCtrl" ) {
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
        //Every time we land on GameCtrl ask to update the list of participants in this room
        else if(current.$$route.controller=="GameCtrl") {
            $rootScope.bingoStarted = false; //Every time we land, we start as non-started game, and must wait for signal to start
            $rootScope.lineaBtnDisabled = false;

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
    $scope.headerInfo = {
        nick: $scope.nick,
        id: null,
        typeName: 'E q u a c i o n s',
        exit: function() {
            $location.path("/");
        }
    };
    $scope.onKeyUp = function(keyEvent) {
        $scope.headerInfo.nick = $scope.nick;
        if (keyEvent.which === 13) {
          $scope.onsubmit();
        }
    };
    $scope.onsubmit = function() {
        if(!$scope.nick.trim().length) {
            return;
        }
        cfg.setNick($scope.nick);
        $location.path('/rooms');
    };

};

var RoomsCtrl = function($scope, $rootScope, $location, cfg, socket, growl) {
 
    var cuser = cfg.getUser();
    if(!cuser) {
        $location.path("/");
    }
    socket.on("rooms:available", function(rooms){
        $scope.rooms = rooms;
    }); 

    $scope.headerInfo = {
        nick: cuser.nick,
        id: null,
        typeName: 'E q u a c i o n s',
        exit: function() {
            $location.path("/");
        }
    };

    $scope.joinroom = function(r) { 
        console.log("Attempting join room", r);
        $location.path("/game/"+r.id);
        
    };
    $scope.newroom = function() { 
        //emit the room created
        var cuser = cfg.getUser();
        socket.emit("rooms:create", {nick: cuser.nick, idUser: cuser.idUser}, function(success, msg) {
            if(!success) {
                console.error(msg);
                growl.error(msg);
            } 
        });
    };

};
 

var GameCtrl = function($scope, $rootScope, $location, $route, cfg, socket, growl) {
    $scope.balls = []; 
    $scope.gameOver = false; 
    $scope.cartro = new BingoUtils.Cartro(); 
    $scope.mute = false;

    $scope.newCartro = function() {
        $scope.cartro.generate();
    };

    var cuser = cfg.getUser();
    if(!cuser) {
        $location.path("/");
    }
     //check if set roomId
    $scope.idRoom = $route.current.params.idroom;
    $scope.participants = [];
    $scope.canSubmitStart = true;
    $scope.headerInfo = {
        nick: cuser.nick,
        id: $scope.idRoom,
        typeName: 'E q u a c i o n s',
        exit: function() {
            $location.path("/");
        }
    };

    // Need to retrieve information about the root
    socket.on("rooms:info", function(roomInfo){
        $scope.currentRoom = roomInfo;
    });

    //TODO decide who can press submit start game
   
    // Pregame
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
        //TODO Set variables
        $rootScope.bingoStarted = true;
    });

    $scope.onSubmitStart = function() {
        socket.emit("bingo:start", {id: $scope.idRoom});
    };


    // Game is running

    socket.on("bingo:nextball", function(ball) {
        //next ball has arrived!
        //TODO pas the ball.id in order to detect missing balls
        growl.info("Nova bolla: " + ball.latex, {referenceId: 2});
        if(!$scope.mute) {
            BingoUtils.speak(ball.speech);
        }
        $scope.balls.unshift(ball);
    });
    socket.on("bingo:gameover", function() {
        //the game has finished
        growl.info("El joc s'ha acabat.");
        //TODO disable everything
        $scope.gameOver = true;
    });
    socket.on("bingo:linea", function(data) {
        //result of the linea test
        if(data.user.id==cuser.id && data.res[0]===false) {
            growl.warning("La línia no és correcta");
        }
        if(data.res[0]===true) {
            growl.success("Línia és correcta de "+data.user.nick);
            $rootScope.lineaBtnDisabled = true;
        }
    });
    socket.on("bingo:bingo", function(res) {
        //result of the bingo test
        growl.info("Bingo from "+ JSON.stringify(res))
    });

    $scope.testLinia = function() {
        console.log("Sending bingo:linea");
        console.log("Llista a comprovar ", $scope.cartro.list())
        socket.emit("bingo:linea", {id: $scope.idRoom, numbers: $scope.cartro.list(), user: cuser});
    };
    $scope.testBingo = function() {
        console.log("Sending bingo:bingo");
        console.log("Llista a comprovar ", $scope.cartro.list())
        socket.emit("bingo:bingo", {id: $scope.idRoom, numbers: $scope.cartro.list(), user: cuser});
    };
    $scope.sortirJoc = function() {
        $location.path("/rooms");
    };

};


LandingCtrl.$inject = ["$scope", "$location", "cfg", "socket", "growl"];
RoomsCtrl.$inject = ["$scope", "$rootScope", "$location", "cfg", "socket", "growl"];
GameCtrl.$inject = ["$scope", "$rootScope", "$location", "$route", "cfg", "socket", "growl"]; 

app.controller("LandingCtrl", LandingCtrl);
app.controller("RoomsCtrl", RoomsCtrl);
app.controller("GameCtrl", GameCtrl); 

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
        when('/game/:idroom', {
            templateUrl: 'game.html',
            controller: 'GameCtrl'
        }). 
        otherwise('/');

        growlProvider.onlyUniqueMessages(true);
        growlProvider.globalTimeToLive(5000);
        growlProvider.globalPosition('top-right');
        growlProvider.globalDisableCountDown(true);
    }
]);