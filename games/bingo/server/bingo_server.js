const createServer = require("http").createServer;
const path = require("path");
const Server = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

const MAX_USER_PER_ROOM = 30;
const MAX_ROOMS_ACTIVE = 10;

const nicks = [];
const rooms = {};
const joined = {};

io.on("connection", (socket) => {
    console.log("Client connected ", socket);
    
    socket.on("rooms:create", function(k, cb) {
        console.log(k);
        if(Object.keys(rooms).length > MAX_ROOMS_ACTIVE) {
            cb && cb(false, "No hi pot haver més de "+ MAX_ROOMS_ACTIVE + " actives.");
            return;
        }
        var roomId = "r" + Math.random().toString(32).substring(2);
        joined[roomId] = [];
        rooms[roomId] = {id: roomId, idUser: k.idUser, nick: k.nick, created: new Date()};
        io.emit("rooms:available", Object.values(rooms));
        cb && cb(true, "S'ha creat la sala amb id "+roomId);
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
        //only to the joined sockets
        io.to(k.id).emit("rooms:participants", joined[k.id]);
    });

    socket.on("rooms:leave", function(k) {
        if(!rooms[k.id]) {
            console.log("Asking leave of invalid room"); 
            socket.emit("rooms:leave", "invalid_room");
            return;
        }
        //Remove k.idUser from joined[k.id]
        
        //tell socket not longer in room
        socket.leave(k.id); //it no longer receive messages from this room
        //tell other sockets that list have changed, only to the joined sockets
        io.to(k.id).emit("rooms:participants", joined[k.id]);
    });

    socket.on("rooms:join", function(k, cb) {
        console.log("Passed", k)
        console.log("Current joined ", joined, joined[k.id])
        if(joined[k.id]) { 
            if(joined[k.id].length > MAX_USER_PER_ROOM) {
                //users limit per room
                cb && cb(false, "La sala "+k.id+" està plena. Ja conté "+ MAX_USER_PER_ROOM + " jugadors. Creau o entrau a una altra sala.");
                return;
            }
            let found = false;
            let i = 0;
            const len = joined[k.id].length;
            while(i < len && !found) {
                found = joined[k.id][i].idUser == k.idUser;
                i++;
            }
            if(!found) { 
                joined[k.id].push({idUser: k.idUser, nick: k.nick});
            } 
            // Join room and send only to the room
            socket.join(k.id);
            io.to(k.id).emit("rooms:participants", joined[k.id])
            cb && cb(true, "T'has unit a la sala " + k.id);
        } else {
            cb && cb(false, "La sala " + k.id + " ja no existeix.");
        }
    });

});

console.log("Bingo server listening on port 3000");
httpServer.listen(3000);