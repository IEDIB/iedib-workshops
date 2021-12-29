(function (exports) {

    var NUM_BOLLES = 30;
    var NUM_ROWS = 3;
    var NUM_COLS = 6;
    var NUM_COLS_NB = 3;
    var BALL_INTERVAL = 5; 
    
    var Timer = function (cb, delay) {
        this.cb = cb;
        this._start = null;
        this.remaining = 1000 * delay;
    }
    Timer.prototype = {
        play: function (delay2) {
            if (this.id) {
                clearTimeout(this.id);
            }
            if (this._start) {
                this.remaining -= new Date().getTime() - this._start;
            }
            if (delay2) {
                // Redefine the delay
                this.remaining = 1000 * delay2;
            }
            this._start = new Date().getTime();
            this.id = setTimeout(this.cb, this.remaining);
        },
        stop: function () {
            if (this.id) {
                clearTimeout(this.id);
                this.id = null;
            }
            this._start = null;
            this.remaining = 0;
        },
        pause: function () {
            if (this.id) {
                clearTimeout(this.id);
                this.id = null;
            }
            if (this._start) {
                this.remaining -= new Date().getTime() - this._start;
            }
        }
    }; 
 
    var iran = function (a, b) {
        return Math.round(Math.random() * (b - a)) + a
    };

    var range = function (a, b) {
        var aList = [];
        for (var i = a; i <= b; i++) {
            aList.push(i);
        }
        return aList;
    };

    var listClone = function (aList) {
        var clonedList = [];
        for (var i = 0, len = aList.length; i < len; i++) {
            clonedList[i] = aList[i];
        }
        return clonedList;
    };

    var sort = function (aList, subListLen) {
        var firstElems = aList.splice(0, subListLen);
        firstElems.sort(function (a, b) { return a - b; });
        return firstElems;
    };

    var shuffle = function (aList) {
        //The Fisher-Yates algorithm
        var cloned = listClone(aList);
        for (var i = cloned.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = cloned[i];
            cloned[i] = cloned[j];
            cloned[j] = temp;
        }
        return cloned;
    };

    function Bolla(id, valor) {
        this.id = id;
        this.latex = "" + valor;
        this.speech = { "ca-ES": "El " + valor, "es-ES": "El " + valor };
    }

    var U = {
        iran: iran,
        range: range,
        shuffle: shuffle,
        sort: sort,
        listClone: listClone,
        Bolla: Bolla
    };



    function BingoClassic() {
        this.gameoverNotifiers = [];
        this.nextballNotifiers = [];
        this.timer = null;
        this.lineaOwner = null;
        this.winner = null;

        //Define the timer
        var self = this;
        this.timer = new Timer(function () {
            var nextBall = self.next();
            if (nextBall) {
                for (var i = 0, ln = self.nextballNotifiers.length; i < ln; i++) {
                    self.nextballNotifiers[i](nextBall);
                }
                // launch next interval
                self.timer.play(BALL_INTERVAL);
            } else {
                for (var i = 0, ln = self.gameoverNotifiers.length; i < ln; i++) {
                    self.gameoverNotifiers[i](null);
                }
            }
        }, BALL_INTERVAL);
    };
    BingoClassic.prototype.init = function () {
        var self = this;
        this.itera = 0;
        this.nombres = U.shuffle(U.range(1, NUM_BOLLES));
        this.nombres_trets = [];
        // Prepara objectes per a cada bolla
        this.bolles = [];
        for (var i = 0; i < NUM_BOLLES; i++) {
            // Bingo classic, únicament la bolla
            this.bolles.push(new U.Bolla(i+1, this.nombres[i]));
        }
        // start the timer
        this.timer && this.timer.play();
    };
    BingoClassic.prototype.next = function () {
        if (this.itera >= NUM_BOLLES || this.winner != null) {
            for (var i = 0, ln = this.gameoverNotifiers.length; i < ln; i++) {
                this.gameoverNotifiers[i](this.winner);
            }
            return null;
        }
        var bolla = this.bolles[this.itera];
        this.nombres_trets.push(this.nombres[this.itera]);
        this.itera++;
        return bolla;
    };
    BingoClassic.prototype.testLine = function (userNumbers, user) {
        // User numbers is a list 3x3, null indicate that is not selected
        var firstWrong = -1;
        for (var i = 0; i < NUM_ROWS; i++) {
            var teLinia = true;
            for (var j = 0; j < NUM_COLS_NB; j++) {
                var indx = i * NUM_COLS_NB + j;
                var valor = userNumbers[indx];
                if (valor == null) {
                    // Not set --> this is not a line 
                    teLinia = false;
                    break;
                }
                teLinia = this.nombres_trets.indexOf(valor) >= 0;
                if (!teLinia) {
                    firstWrong = indx;
                    break;
                }
            }
            if (teLinia) {
                if (this.lineaOwner != null) {
                    //No more than one linea is allowed
                    return [];
                }
                this.lineaOwner = user;
                return [true];
            }
        }
        return [false, firstWrong];
    };
    BingoClassic.prototype.testBingo = function (userNumbers, user) {
        var self = this;
        // User numbers is a list 3x3, null indicate that is not selected
        // if a null is found, must return false
        for (var i = 0; i < NUM_ROWS; i++) {
            for (var j = 0; j < NUM_COLS_NB; j++) {
                var indx = i * NUM_COLS_NB + j;
                var valor = userNumbers[indx];
                if (valor == null || this.nombres_trets.indexOf(valor) < 0) {
                    return [false, indx];
                }
            }
        }
        //somebody call for bingo before me! We cannot assign more than one bingo
        if (this.winner != null) {
            return [];
        }
        this.winner = user;
        // We can stop the timer since no more balls are required
        this.timer && this.timer.pause();
        this.timer = null;
        for (var i = 0, ln = self.gameoverNotifiers.length; i < ln; i++) {
            self.gameoverNotifiers[i](this.winner);
        }
        return [true];
    };

    BingoClassic.prototype.on = function (evtname, cb) {
        if (evtname === "nextball") {
            this.nextballNotifiers.push(cb);
        } else if (evtname === "gameover") {
            this.gameoverNotifiers.push(cb);
        }
    };
    BingoClassic.prototype.off = function () {
        this.nextballNotifiers = [];
        this.gameoverNotifiers = [];
        this.timer && this.timer.pause();
        this.timer = null;
    };
    BingoClassic.prototype.trigger = function (delay) {
        var self = this;
        setTimeout(function () {
            self.init();
        }, delay * 1000);
    };
    BingoClassic.prototype.pause = function () {
        this.timer && this.timer.pause();
    };
    BingoClassic.prototype.play = function () {
        this.timer && this.timer.play();
    };
 
    exports.BingoClassic = BingoClassic; 
})(window);