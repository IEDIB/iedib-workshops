const U = require('./utils'); 
const BingoClassic = require('./bingo_classic');


const BingoEquacions = function() {
    BingoClassic.call(this);
    this.eqnTemplates = [];
    for(var i=0; i < 30; i++) {
        this.eqnTemplates.push(i % 4);
    }
    U.shuffle(this.eqnTemplates);
};
U.extend(BingoEquacions, BingoClassic);

//@Override
BingoEquacions.prototype._createBall = function(id, number) {
    
    var tmpl = this.eqnTemplates[id];
    var eqn = null;
    var translations = null;
    var ttl = 10;

    if(tmpl == 0) {
        var a = U.iran(2,10);
        var b = number + a;
        eqn = 'x + ' + a + ' = ' + b;
        translations = {
            "ca-ES": "x més " + a + " és igual a "+ b, 
            "es-ES": "x más " + a + " es igual a "+ b
        };
    } else if(tmpl == 1) {
        var a = U.iran(2,5);
        var b = a*number;
        eqn = a +' x  = ' + b;
        translations = {
            "ca-ES": a + " x és igual a "+ b, 
            "es-ES": a + " x es igual a "+ b
        };
    } else if(tmpl == 2) {
        var b = U.iran(2,4);
        var a = b*U.iran(2,5);
        var c = a*number/b;
        eqn = '\\frac{'+ a +' x}{'+b +'}  = ' + c;
        translations = {
            "ca-ES": a + " x dividit entre "+ b + " és igual a "+ c, 
            "es-ES": a + " x dividido entre  "+ b + " es igual a "+ c
        };
        ttl = 15;
    } else if(tmpl == 3) {
        if(number <= 10) {
            var b = (2*number);
            var c = (number*number) 
            eqn = 'x^2  - '+ b + 'x + ' + c + ' = 0';
            translations = {
                "ca-ES": "x al quadrat menys " + b + " x més " + c + " igual a zero", 
                "es-ES": "x al cuadrado menos " + b + " x más " + c + " igual a cero", 
            };
            ttl = 20;
        } else {

        }
    } else {

    }
    
    eqn = '<katex>' + eqn + '</katex>';
    return new U.Bolla(id+1, number, eqn, translations, ttl);
};

module.exports = BingoEquacions;