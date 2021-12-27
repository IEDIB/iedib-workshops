const createServer = require("http").createServer;
const path = require("path");
const Server = require("socket.io");
const BingoClassic = require("./bingo_classic")

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

const MAX_USER_PER_ROOM = 30;
const MAX_ROOMS_ACTIVE = 10;
 
const rooms = {};
const joined = {};
const bingos = {};

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
        // Added type of room (the application decides which type of Bingo wants)
        rooms[roomId] = {id: roomId, idUser: k.idUser, nick: k.nick, type: k.type || 'eq1', created: new Date()};
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
        const croom = joined[k.id];
        const len = croom.length;
        for (let i = len - 1; i >= 0; i--) {
            if (croom[i].idUser === k.idUser) {
                croom.splice(i, 1);
            }
        }
        // Purge empty rooms (everybody left)
        if(croom.length == 0) {
            croom = null;
            delete rooms[k.id];
            delete joined[k.id];
            delete bingos[k.id];
        }
        
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

    socket.on("bingo:start", function(k){
        // Some participant of the room id has informed that the game is about to start
        // Create the bingo instance
        const bingo = new BingoClassic();
        // and bind the timer to this bingo instance
        bingos[k.id] = bingo;

        bingo.on("nextball", function(ball){
            io.to(k.id).emit("bingo:nextball", ball);
        });

        bingo.on("gameover", function(winner){
            io.to(k.id).emit("bingo:gameover", winner);
            // TODO unbind events on bingo
            bingo.off();
        });

        // Inform to all other participants in the room
        io.to(k.id).emit("bingo:start");

        // Actually trigger the bingo timer now, with a delay of 4 seconds
        bingo.trigger(4000);
    })

});

console.log("Bingo server listening on port 3000");
httpServer.listen(3000);