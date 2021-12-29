const NUM_BOLLES = 30;
const NUM_ROWS = 3;
const NUM_COLS = 6;
const NUM_COLS_NB = 3;
const BALL_INTERVAL = 5;
const U = require('./utils');
const Timer = require('./timer');

function BingoClassic() {
    this.gameoverNotifiers = [];
    this.nextballNotifiers = [];
    this.timer = null;
    this.lineaOwner = null;
    this.winner = null;

    //Define the timer
    const self = this;
    this.timer = new Timer(function() {
        var nextBall = self.next();
        if(nextBall) {
            for (var i = 0, ln=self.nextballNotifiers.length; i < ln; i++) { 
                self.nextballNotifiers[i](nextBall);
            }
            // launch next interval
            self.timer.play(BALL_INTERVAL);
        } else {
            for (var i = 0, ln=self.gameoverNotifiers.length; i < ln; i++) { 
                self.gameoverNotifiers[i](null);
            } 
        }
    }, BALL_INTERVAL);
};
BingoClassic.prototype.init = function() {
    const self = this;
    this.itera = 0;
    this.nombres = U.shuffle(U.range(1, NUM_BOLLES));
    this.nombres_trets = [];
    // Prepara objectes per a cada bolla
    this.bolles = [];
    for (var i = 0; i < NUM_BOLLES; i++) { 
        // Bingo classic, únicament la bolla
        this.bolles.push(new U.Bolla(this.nombres[i]));
    }
    // start the timer
    this.timer.play();
};
BingoClassic.prototype.next = function() {
    if(this.itera >= NUM_BOLLES || this.winner != null) {
        for (var i = 0, ln=this.gameoverNotifiers.length; i < ln; i++) { 
            this.gameoverNotifiers[i](this.winner);
        } 
        return null;
    }
    const bolla = this.bolles[this.itera];
    this.nombres_trets.push(this.nombres[this.itera]);
    this.itera++;
    return bolla;
};
BingoClassic.prototype.testLine = function(userNumbers, user) {
    // User numbers is a list 3x3, null indicate that is not selected
    let firstWrong = -1;
    for (let i = 0; i < NUM_ROWS; i++) {
        let teLinia = true;
        for (let j = 0; j < NUM_COLS_NB; j++) {
            let indx = i*NUM_COLS_NB+j;
            const valor = userNumbers[indx];
            if (valor == null) {
                // Not set --> this is not a line 
                teLinia = false;
                break;
            }
            teLinia = this.nombres_trets.indexOf(valor)>=0;
            if (!teLinia) {
                firstWrong = indx;
                break;
            }
        }
        if (teLinia) {
            if(this.lineaOwner!=null) {
                //No more than one linea is allowed
                return [];
            }
            this.lineaOwner = user;
            return [true];
        }
    }
    return [false, firstWrong];
};
BingoClassic.prototype.testBingo = function(userNumbers, user) {
    var self = this;
    // User numbers is a list 3x3, null indicate that is not selected
    // if a null is found, must return false
    for (let i = 0; i < NUM_ROWS; i++) {
        for (let j = 0; j < NUM_COLS_NB; j++) {
            const indx = i*NUM_COLS_NB+j;
            const valor = userNumbers[indx];
            if (valor == null || this.nombres_trets.indexOf(valor)<0) {
               return [false, indx];
            } 
        }
    }
    //somebody call for bingo before me! We cannot assign more than one bingo
    if(this.winner != null) {
        return [];
    }
    this.winner = user;
    // We can stop the timer since no more balls are required
    this.timer.pause();
    this.timer = null;
    for (var i = 0, ln=self.gameoverNotifiers.length; i < ln; i++) { 
        self.gameoverNotifiers[i](this.winner);
    } 
    return [true];
};

BingoClassic.prototype.on = function(evtname, cb) {
    if(evtname === "nextball") {
        this.nextballNotifiers.push(cb);
    } else if(evtname === "gameover") {
        this.gameoverNotifiers.push(cb);
    }
};
BingoClassic.prototype.off = function() {
    this.nextballNotifiers = [];
    this.gameoverNotifiers = [];
    this.timer.pause();
    this.timer = null;
};
BingoClassic.prototype.trigger = function(delay) {
    const self = this;
    setTimeout(function(){
        self.init();
    }, delay*1000);
};
BingoClassic.prototype.pause = function() {
    this.timer && this.timer.pause();
};
BingoClassic.prototype.play = function() {
    this.timer && this.timer.play();
};


// Expose class
module.exports = BingoClassic;