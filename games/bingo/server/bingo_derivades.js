const U = require('./utils'); 
const BingoClassic = require('./bingo_classic');


const BingoDerivades = function() {
    BingoClassic.call(this);
};
U.extend(BingoDerivades, BingoClassic);

//@Override
BingoDerivades.prototype._createBall = function(id, number, remaining) {
    var translations = {"ca-ES": "El "+number, "es-ES": "El "+number};
    return new U.Bolla(id+1, number, number+"", translations, 20, remaining);
};

module.exports = BingoDerivades;