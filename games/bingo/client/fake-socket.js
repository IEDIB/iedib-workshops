(function () {
    var TRANSPORT_DELAY = 100;
    /* FAKE PACKET */
    var PacketLocal = function (fromId, toId, payload) {
        this.fromId = fromId;
        this.toId = toId;
        this.payload = payload;
    };

    var rndId = function () {
        return Math.random().toString(32).substring(2);
    };

    /* FAKE CLIENT */
    var SocketClientLocal = function (socketId) {
        this.id = socketId;
        this._handlers = {};
    };
    SocketClientLocal.prototype = {
        off: function () {
            // Unregister all events
            this._handlers = {};
        },
        on: function (evtname, cb) {
            var lhandlers = this._handlers[evtname];
            if (!lhandlers) {
                lhandlers = [];
                this._handlers[evtname] = lhandlers;
            }
            lhandlers.push(cb);
        },
        emit: function (evtname, data, ack) {
            window.ioServerLocal._deliver(new PacketLocal(this.id, this.id, { evtname: evtname, data: data, ack: ack }));
        },
    };

    window.ioClientLocal = {
        _sockets: {},
        connect: function () {
            var socketId = "s" + rndId() + "-" + rndId();
            var socket = new SocketClientLocal(socketId);
            ioClientLocal._sockets[socketId] = socket;
            window.ioServerLocal._deliver(new PacketLocal(socketId, socketId, { evtname: 'connection', data: socketId }));
            return socket;
        },
        disconnect: function () {
            var lSockets = Object.values(window.ioClientLocal._sockets);
            for (var i = 0, len = lSockets.length; i < len; i++) {
                lSockets[i].off();
            }
        },
        _deliver: function (packet) {
            //invoke all registered handlers in socket toId
            var socket = window.ioClientLocal._sockets[packet.toId];
            console.log("Client want's to deliver ", packet, " to ", socket);
            if (socket) {
                var lhandlers = socket._handlers[packet.payload.evtname];
                if (lhandlers) {
                    setTimeout(function () {
                        for (var i = 0, len = lhandlers.length; i < len; i++) {
                            lhandlers[i](packet.payload.data, packet.payload.cb);
                        }
                    }, TRANSPORT_DELAY);
                }
            }
        }
    };

    var SocketServerLocal = function (socketId) {
        this.id = socketId;
        this._handlers = {};
        this._hasJoined = [];
    }
    SocketServerLocal.prototype = {
        off: function () {
            // Unregister all events
            this._handlers = {};
            this._hasJoined = [];
        },
        emit: function (evtname, data, ack, fromId) {
            // Deliver only to myself
            console.log("Server emitting " + evtname + " to " + this.id);
            window.ioClientLocal._deliver(new PacketLocal(fromId || this.id, this.id, { evtname: evtname, data: data, ack: ack }));
        },
        on: function (evtname, cb) {
            console.log("Client recieve ", evtname);
            var lhandlers = this._handlers[evtname];
            if (!lhandlers) {
                lhandlers = [];
                this._handlers[evtname] = lhandlers;
            }
            lhandlers.push(cb);
        },
        join: function (roomId) {
            if (this._hasJoined.indexOf(roomId) < 0) {
                this._hasJoined.push(roomId);
            }
        },
        leave: function (roomId) {
            var indx = this._hasJoined.indexOf(roomId);
            if (indx >= 0) {
                this._hasJoined.splice(indx, 1);
            }
        }
    };


    window.ioServerLocal = {
        _clients: {},
        _handlers: {},
        _rooms: {},
        _deliver: function (packet) {
            setTimeout(function () {
                console.log("ioServerLocal: _deliver : ", packet);
                var payload = packet.payload;
                // process connection message
                if (payload.evtname === 'connection') {
                    var socketId = payload.data;
                    var socket = window.ioServerLocal._clients[socketId];
                    if (!socket) {
                        socket = new SocketServerLocal(socketId);
                        window.ioServerLocal._clients[socketId] = socket;
                    }
                    console.log("Deliver connection ", socket);
                    var lhandlers = window.ioServerLocal._handlers["connection"];
                    console.log("handlers ", window.ioServerLocal._handlers);
                    if (lhandlers) {
                        for (var i = 0, len = lhandlers.length; i < len; i++) {
                            lhandlers[i](socket);
                        }
                    }
                    return;
                }

                // Deliver other types of messages
                var socket = window.ioServerLocal._clients[packet.toId];
                if (socket) {
                    var lhandlers = socket._handlers[payload.evtname];
                    console.log(payload.evtname, "handlers ", lhandlers);
                    if (lhandlers) {
                        for (var i = 0, len = lhandlers.length; i < len; i++) {
                            lhandlers[i](payload.data, payload.ack);
                        }
                    }
                } else {
                    console.error("cannot deliver to ", packet.toId);
                }
            }, TRANSPORT_DELAY);
        },
        on: function (evtname, cb) {
            var lhandlers = window.ioServerLocal._handlers[evtname];
            if (!lhandlers) {
                lhandlers = [];
                window.ioServerLocal._handlers[evtname] = lhandlers;
            }
            lhandlers.push(cb);
        },
        emit: function (evtname, data, ack) {
            // Emit to all connected clients
            var lClients = Object.values(window.ioServerLocal._clients);
            for (var i = 0; i < lClients.length; i++) {
                lClients[i].emit(evtname, data, ack);
            }
        },
        to: function (roomId) {
            // Emit to all connected clients that belongs to this room
            return {
                emit: function (evtname, data, ack) {
                    // Emit to all connected clients
                    var lClients = Object.values(window.ioServerLocal._clients);
                    for (var i = 0; i < lClients.length; i++) {
                        if (lClients[i]._hasJoined.indexOf(roomId) >= 0) {
                            lClients[i].emit(evtname, data, ack, "global");
                        }
                    }
                }
            };
        },
        in: function (roomId) {
            return this.to(roomId);
        },
        shutdown: function () {
            var lClients = Object.values(ioServerLocal._clients);
            for (var i = 0, len = lClients.length; i < len; i++) {
                lClients[i].off();
            }
            ioServerLocal._clients = {};
            ioServerLocal._handlers = {};
            ioServerLocal._rooms = {};
        }
    };

})();