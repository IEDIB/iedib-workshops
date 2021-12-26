const createServer = require("http").createServer;
const path = require("path");
const Server = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

const nicks = [];
const rooms = {};
const joined = {};

io.on("connection", (socket) => {
    console.log("Client connected ", socket);
    socket.on("rooms:create", function(k) {
        console.log(k);
        var roomId = "r" + Math.random().toString(32).substring(2);
        joined[roomId] = [];
        rooms[roomId] = {id: roomId, idUser: k.idUser, nick: k.nick, created: new Date()};
        io.emit("rooms:available", Object.values(rooms));
    });

    socket.on("rooms:available", function() {
        socket.emit("rooms:available", Object.values(rooms));
    });
    socket.on("rooms:participants", function(k) {
        if(!rooms[k.id]) {
            console.log("Asking participants of invalid room"); 
            socket.emit("rooms:participants", "invalid_room");
            return;
        }
        socket.emit("rooms:participants", joined[k.id]);
    });

    socket.on("rooms:join", function(k, cb) {
        console.log("Passed", k)
        console.log("Current joined ", joined, joined[k.id])
        if(joined[k.id]) { 
            if(joined[k.id].indexOf(k.idUser)<0) {
                console.log("added ", k.idUser);
                joined[k.id].push({idUser: k.idUser, nick: k.nick});
            }
            console.log("Acceptat ", joined);
            io.emit("rooms:participants", joined[k.id])
            cb(true);
        }
    });

});

console.log("Bingo server listening on port 3000");
httpServer.listen(3000);