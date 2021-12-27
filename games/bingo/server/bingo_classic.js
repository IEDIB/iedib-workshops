const NUM_BOLLES = 30;
const NUM_ROWS = 3;
const NUM_COLS = 6;
const NUM_COLS_NB = 3;
const BALL_INTERVAL = 5;
const U = require('./utils');

function BingoClassic() {
    this.gameoverNotifiers = [];
    this.nextballNotifiers = [];
    this.timer = null;
}
BingoClassic.prototype.init = function() {
    const self = this;
    this.itera = 0;
    this.nombres = U.shuffle(U.range(1, NUM_BOLLES));
    this.nombres_trets = [];
    // Prepara objectes per a cada bolla
    this.bolles = [];
    for (var i = 0; i < NUM_BOLLES; i++) { 
        // Bingo classic, únicament la bolla
        this.bolles.push(new U.Bolla(nombres[i]));
    }
    // start the timer
    this.timer = new Timer(function() {
        var nextBall = self.next();
        if(nextBall) {
            self.nextballNotifiers.forEach( (notify) => notify(nextBall));
        } else {
            self.gameoverNotifiers.forEach( (notify) => notify(null));
        }
    }, BALL_INTERVAL);
};
BingoClassic.prototype.next = function() {
    if(this.itera >= NUM_BOLLES) {
        return null;
    }
    const bolla = this.bolles[this.itera];
    this.nombres_trets.push(this.nombres[this.itera]);
    this.itera++;
    return bolla;
};
BingoClassic.prototype.testLine = function(userNumbers) {
    // User numbers is a list 3x3, null indicate that is not selected
    for (let i = 0; i < NUM_ROWS; i++) {
        let teLinia = true;
        let firstWrong = -1;
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
            return [true];
        }
    }
    return [false, firstWrong];
};
BingoClassic.prototype.testBingo = function(userNumbers) {
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
};
BingoClassic.prototype.trigger = function(delay) {
    const self = this;
    setTimeout(function(){
        self.init();
    }, delay);
};
BingoClassic.prototype.pause = function() {
    this.timer.pause();
}
BingoClassic.prototype.play = function() {
    this.timer.play();
}


// Expose class
module.exports = BingoClassic;