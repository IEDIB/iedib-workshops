/**
 * Petit joc de Bingo
 * basat en la resolució d'equacions de primer i 
 * segon graus.
 * @author Josep Mulet Pol
 * @date 2021-2022
 */
window.BingoUtils = window.BingoUtils || {};

(function (exports) { 

    var findVoice = function (lang, voices) {
        lang = (lang || "").toLowerCase();
        var k = 0;
        var voice = null;
        var len = (voices || []).length;
        while (k < len && voice == null) {
            if (voices[k].lang.toLowerCase() == lang) {
                voice = voices[k];
            }
            k++;
        }
        return voice;
    };

    var speak = function(textmap) {
        if(!supported) {
            return;
        }
        var voices = speechSynthesis.getVoices();
        var lang = "ca-ES";
        var voice = findVoice(lang, voices);
        if(!voice) {
            lang = "es-ES";
            voice = findVoice(lang, voices); 
        }
        if(voice) {
            var utterance = new SpeechSynthesisUtterance(textmap[lang]);
            utterance.voice = voice;
            synth.speak(utterance);
        } 
    };

    var synth = window.speechSynthesis;
    var supported = synth != null && window.SpeechSynthesisUtterance != null;
    if (supported) {
        if ((synth.getVoices() || []).length) {
           
        } else {
            // wait until the voices have been loaded asyncronously
            synth.addEventListener("voiceschanged", function () {
                
            });
        }
    } else {
        //TODO
        console.error("Voices not supported");
        
    }

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

    var Cell = function(value, selected) {
        this.value = value;
        this.selected = selected;
    };
    Cell.prototype.clear = function() {
        this.value = null;
        this.selected = false;
    }; 
    Cell.prototype.toggle = function(enabled) {
        console.log("Cell toogle ", enabled);
        if(!enabled) {
            return;
        }
        this.selected = !this.selected;
    }; 

    var Cartro = function () { 
        this.nrows = 3;
        this.ncols = 6;
        this.rows = [];
        for (var i = 0; i < this.nrows; i++) {
            var aRow = [];
            for (var j = 0; j < this.ncols; j++) {
                aRow.push(new Cell(null, false));
            }
            this.rows.push(aRow);     
        }
        this.generate();
    };
    Cartro.prototype = {
        generate: function () { 
            // For every row, must set 3 cells as void
            var void_candidates = [];
            for (var i = 0; i < this.nrows; i++) {
                void_candidates.push(sort(shuffle(range(0, this.ncols - 1)), 3));
            }
            // For every col, up to 3 values in a given range 
            var a = 1;
            for (var j = 0; j < this.ncols; j++) {
                var cols_candidates = sort(shuffle(range(a, a + 4)), this.nrows);
                var posIndx = 0;
                for (var i = 0; i < this.nrows; i++) {
                    var val = null;
                    if (void_candidates[i].indexOf(j) < 0) {
                        val = cols_candidates[posIndx];
                        posIndx++;
                    }
                    this.getCellAt(i, j).value = val;
                }
                a += 5;
            }
        },
        clear: function () {
            for (var i = 0; i < this.nrows; i++) {
                for (var j = 0; j < this.ncols; j++) {
                    this.getCellAt(i, j).clear();
                }
            }
        },
        getRows: function () {
            return this.rows;
        }, 
        getCellAt: function (i, j) {
            return this.rows[i][j];
        },
        list: function() {
            var flatList = [];
            for (var i = 0; i < this.nrows; i++) {
                var aRow = this.rows[i];
                for (var j = 0; j < this.ncols; j++) {
                    var cell = aRow[j];
                    if(cell.value != null) {
                        //non-void cell
                        flatList.push(cell.selected? cell.value: null);
                    }
                }    
            }
            return flatList;
        }
    };

     
    exports.Cartro = Cartro;
    exports.speak = speak; 

})(BingoUtils);