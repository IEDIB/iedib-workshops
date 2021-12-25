/**
 * Petit joc de Bingo
 * basat en la resolució d'equacions de primer i 
 * segon graus.
 * @author Josep Mulet Pol
 * @date 2021-2022
 */

(function () {
 
    var Timer = function(cb, delay) {
        this.cb = cb; 
        this._start = null;
        this.remaining = 1000*delay;
    }
    Timer.prototype = {
        play: function(delay2) {
            if(this.id) {
                clearTimeout(this.id);
            }
            if(this._start) {
                this.remaining -= new Date().getTime() - this._start; 
            }
            if(delay2) {
                // Redefine the delay
                this.remaining = 1000*delay2;
            }
            this._start = new Date().getTime();
            this.id = setTimeout(this.cb, this.remaining);
        },
        stop: function() {
            if(this.id) {
                clearTimeout(this.id);
                this.id = null;
            }
            this._start = null;
            this.remaining = 0;
        },
        pause: function() {
            if(this.id) {
                clearTimeout(this.id);
                this.id = null;
            }
            if(this._start) {
                this.remaining -= new Date().getTime() - this._start; 
            }
        }
    };

    var iran = function(a, b) {
        return Math.round(Math.random()*(b-a))+a
    };

    var range = function(a, b) {
        var aList = [];
        for(var i=a; i<=b; i++) {
            aList.push(i);
        }
        return aList;
    };

    var listClone = function(aList) {
        var clonedList = [];
        for (var i = 0, len=aList.length; i < len; i++) {
            clonedList[i] = aList[i];
        }
        return clonedList;
    };

    var sort = function(aList, subListLen) {
        var firstElems = aList.splice(0, subListLen);
        firstElems.sort(function(a,b){return a-b;});
        return firstElems;
    };

    var shuffle = function(aList) {
        //The Fisher-Yates algorithm
        var cloned = listClone(aList);
        for (let i = cloned.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = cloned[i];
            cloned[i] = cloned[j];
            cloned[j] = temp;
        } 
        return cloned;
    };

    var Cell = function (value) {
        this.accept = false;
        this.checked = false;
        this.selected = false;
        this.$el = $('<div class="cartro_cell"></div>');
        this.setValue(value);
        var self = this;
        this.$el.on("click", function(evt) {
            if(self.accept) {
                self.toggle();
            }
        });
    };
    Cell.prototype = {
        setValue: function (value) {
            this.value = value;
            this.checked = false;
            this.selected = false;
            this.$el.removeClass("cartro_cellselected");
            if (value == null) {
                this.$el.addClass("cartro_cellvoid");
                this.$el.html('');
            } else {
                this.$el.removeClass("cartro_cellvoid");
                this.$el.html('<p>' + value + '</p>');
            }
        },
        clear: function () {
            this.selected = false;
            this.checked = false;
            this.setValue(null);
        },
        toggle: function () {
            this.$el.removeClass("cartro_cellwrong");
            this.checked = false;
            this.selected = !this.selected;
            if (this.selected) {
                this.$el.addClass("cartro_cellselected");
            } else {
                this.$el.removeClass("cartro_cellselected");
            }
        },
        check: function (extracted) {
            this.$el.removeClass("cartro_cellwrong");
            if(!this.selected) {
                return false;
            }
            this.checked = true;
            if (extracted.indexOf(this.value) >= 0) { 
                return true;
            } else {
                this.$el.addClass("cartro_cellwrong");
                return false;
            }
        },
        acceptEvents: function(bool) {
            this.accept = bool;
            if(!bool) {
                this.$el.removeClass("cartro_celledit");
            } else {
                this.$el.addClass("cartro_celledit");
            }
        },
        element: function () {
            return this.$el;
        }
    };

    var Cartro = function () {
        this.accept = false;
        this.nrows = 3;
        this.ncols = 6;
        this.rows = [];
        this.$el = $('<div class="bingo_cartro"></div>');
        for (var i = 0; i < this.nrows; i++) {
            var aRow = [];
            var elRow = $('<div class="cartro_row"></div>');
            for (var j = 0; j < this.ncols; j++) {
                var aCell = new Cell(null);
                elRow.append(aCell.element());
                aRow.push(aCell);
            }
            this.$el.append(elRow)
            this.rows.push(aRow);
        } 
    };
    Cartro.prototype = {
        init: function () {
            this.accept = false;
            // For every row, must set 3 cells as void
            var void_candidates = [];
            for(var i=0; i<this.nrows; i++) {
                void_candidates.push(sort(shuffle(range(0, this.ncols-1)), 3)); 
            }
            // For every col, up to 3 values in a given range 
            var a = 1;
            for(var j=0; j<this.ncols; j++) {
                var cols_candidates = sort(shuffle(range(a, a+4)), this.nrows);
                var posIndx = 0;
                for(var i=0; i<this.nrows; i++) {
                    var val = null;
                    if(void_candidates[i].indexOf(j) < 0) {
                        val = cols_candidates[posIndx];
                        posIndx++;
                    }
                    this.getCellAt(i, j).setValue(val);
                }
                a += 5;
            }
        },
        clear: function () {
            for (var i = 0; i < this.nrows; i++) { 
                for (var j = 0; j < this.ncols; j++) {
                    this.getCellAt(i,j).clear();
                } 
            }
        },
        getRows: function () {
            return this.rows;
        },
        acceptEvents: function(bool) {
            this.accept = bool;
            //Tell to all cells
            for(var i=0; i<this.nrows; i++) {
                for(var j=0; j<this.ncols; j++) {
                    this.getCellAt(i, j).acceptEvents(bool);
                }
            }
        },
        hasLinia: function (bolles) {  
            for(var i=0; i<this.nrows; i++) {
                var teLinia = true;
                for(var j=0; j<this.ncols; j++) {
                    var aCell = this.getCellAt(i, j);
                    var valor = aCell.value;
                    if(valor == null) {
                        continue;
                    }
                    teLinia = aCell.selected && aCell.check(bolles);
                    if(!teLinia) {
                        break;
                    }
                } 
                if(teLinia) {
                    return true;
                }
            }
            return false;
        },
        hasBingo: function (bolles) {
            var teBingo = true;
            for(var i=0; i<this.nrows; i++) { 
                if(!teBingo) {
                    break;
                }
                for(var j=0; j<this.ncols; j++) {
                    var aCell = this.getCellAt(i, j);
                    var valor = aCell.value;
                    if(valor == null) {
                        continue;
                    }
                    teBingo = aCell.selected && aCell.check(bolles);
                    if(!teBingo) {
                        break;
                    }
                }
            }
            return teBingo;
        },
        getCellAt: function (i, j) {
            return this.rows[i][j];
        },
        toggle: function (i, j) {
            if(this.accept) {
                this.rows[i][j].toggle();
            }
        },
        element: function() {
            return this.$el;
        }
    };

    var Equacio = function(tmplIndx, sol) {
        this.sol = sol;
        var $1 = iran(2, 10);
        var $2 = this.sol + $1;
        this.latex = "x+"+$1+"="+$2;
        this.speech = {
            "ca-ES": "x més " + $1 + " igual a "+$2,
            "es-ES": "x más " + $1 + " igual a "+$2,
        };
    };
    Equacio.prototype = {
        aloud: function() {
            return this.speech["ca-ES"];
        }, 
        getLatex: function() {
            return "\\("+this.latex+"\\)";
        }
    };

    var TIME_EQUATIONS = 5;
    var cartro = new Cartro();
    cartro.init();
    var $bingo = $('#bingo');

    var nbolles = 30;
    var itera = 0;
    var bolles = [];
    var bolles_tretes = []; 
    var equacions = []; 

    var $panell = $('<div class="bingo_panell"></div>');
    var $remaining = $('<p>Queden '+nbolles+' bolles</p>');
    var $scroll = $('<div class="bingo_scroll"></div>');
    $panell.append($remaining);
    $panell.append($scroll);

    var wrapper = {};

     // Botons de control
     var nouCartroBtn = $('<button>Canvia cartró</button>');
     var startBtn = $('<button>Comença</button>');
 
     var liniaBtn = $('<button style="display:none;">Cantar Línia</button>');
     var bingoBtn = $('<button style="display:none;">Cantar Bingo</button>'); 
 
    var generaInicial = function() {
        //genera la pantalla inicial
        liniaBtn.css("display", "none");
        bingoBtn.css("display", "none");
        nouCartroBtn.css("display", "");
        startBtn.css("display", "");
        $remaining.html("<p>Queden 30 bolles.</p>");
        $scroll.html("");
        cartro.init();
    };
 

    var onNewEquation = function() { 
        var eqn = equacions[itera];
        bolles_tretes.push(eqn.sol);
        itera++;
        $remaining.html('<p>Queden '+(nbolles-itera)+' bolles</p>');
        $scroll.append('<p>'+itera+". "+eqn.getLatex()+"-->"+eqn.sol+'</p>');
        var height = $scroll[0].scrollHeight;
        $scroll.scrollTop(height);
        console.log(eqn.aloud());
        // set a timeout
        if(!wrapper.timer) {
            wrapper.timer = new Timer(onNewEquation, TIME_EQUATIONS);
        } else {
            wrapper.timer.stop();
        }
        if(itera <= nbolles) {
            wrapper.timer.play(TIME_EQUATIONS);
        } else {
            //Last time before end
            window.setInterval(function() {
                liniaBtn.prop("disabled", true);
                bingoBtn.prop("disabled", true);
                alert("Game over!");
                generaInicial();
            }, 1000*TIME_EQUATIONS);
        }
     };
 
     var startGame = function() {
        nbolles = 30;
        itera = 0;
        bolles = shuffle(range(1, nbolles));
        bolles_tretes = [];
        // Prepara equacions per a cada bolla
        equacions = [];
        for(var i=0; i<nbolles; i++) {
            var tmpl = 1;
            equacions.push(new Equacio(tmpl, bolles[i]));
        }
        // Timer per mostrar les "equacions"
        onNewEquation(); 
     };

     liniaBtn.on("click", function(evt){
        if(!wrapper.timer) {
            console.error("Timer is not set");
            return;
        }
        wrapper.timer.pause();
        // comprova la línia
        var ok = cartro.hasLinia(bolles_tretes);
        alert("La línia és "+ (ok?"correcta":"incorrecta"));
        if(ok) {
            liniaBtn.prop("disabled", true);
        }
        //resume timer
        wrapper.timer.play(); 
    });
    bingoBtn.on("click", function(evt){ 
        if(!wrapper.timer) {
        console.error("Timer is not set");
        return;
        }
        wrapper.timer.pause();
        // comprova el bingo
        var ok = cartro.hasBingo(bolles_tretes);
        alert("El bingo és "+ (ok?"correcte":"incorrecte"));
        if(!ok) {
            //resume timer
            wrapper.timer.play();
        } else {
            //no es pot cantar línia dos pics
            liniaBtn.prop("disabled", true);
            bingoBtn.prop("disabled", true);
            generaInicial();
        }
    });

    nouCartroBtn.on("click", function(evt){
        //genera un nou cartró
        cartro.init();
    });

    startBtn.on("click", function(evt){
        //amaga botons
        nouCartroBtn.css("display","none");
        startBtn.css("display", "none");
        //mostra botons 
        liniaBtn.prop("disabled", false);
        bingoBtn.prop("disabled", false)
        liniaBtn.css("display", "");
        bingoBtn.css("display", "");
        cartro.acceptEvents(true);
        startGame();
    });

    $bingo.append($panell);
    $bingo.append(cartro.element());

    //Botons
    $bingo.append(nouCartroBtn);
    $bingo.append(startBtn);
    
    $bingo.append(liniaBtn);
    $bingo.append(bingoBtn);
    
})();