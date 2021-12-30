const U = require('./utils'); 
const BingoClassic = require('./bingo_classic');


const BingoEquacions = function() {
    BingoClassic.call(this);
};
U.extend(BingoEquacions, BingoClassic);

//@Override
BingoEquacions.prototype._createBall = function(id, number) {
    var a = U.iran(2,10);
    var b = number + a;
    var eqn = "x + " + a +" = " + b;
    var translations = {"ca-ES": "x més " + a + " és igual a "+ b, "es-ES": "x mas " + a + " es igual a "+ b};
    return new U.Bolla(id+1, number, eqn, translations, 10);
};

module.exports = BingoEquacions;