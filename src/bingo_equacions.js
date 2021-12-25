/**
 * Petit joc de Bingo
 * basat en la resolució d'equacions de primer i 
 * segon graus.
 * @author Josep Mulet Pol
 * @date 2021-2022
 */

(function () {

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
        //The Fisher-Yates algorith
        for (let i = aList.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = aList[i];
            aList[i] = aList[j];
            aList[j] = temp;
        } 
    };

    var Cell = function (value) {
        this.checked = false;
        this.selected = false;
        this.$el = $('<div class="cartro_cell"></div>');
        this.setValue(value);
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
            this.checked = null;
            this.setValue(null);
        },
        toggle: function () {
            this.selected = !this.selected;
            if (this.selected) {
                this.$el.addClass("cartro_cellselected");
            } else {
                this.$el.removeClass("cartro_cellselected");
            }
        },
        check: function (extracted) {
            if (extracted.indexOf(this.value) >= 0) {
                this.$el.addClass("cartro_cellok");
            } else {
                this.$el.addClass("cartro_cellwrong");
            }
        },
        el: function () {
            return this.$el;
        }
    };

    var Cartro = function () {
        this.rows = 3;
        this.cols = 6;
        this.rows = [];
        for (var i = 0; i < this.rows; i++) {
            var aRow = [];
            for (var j = 0; j < this.cols; j++) {
                aRow.push(new Cell(null));
            }
            this.rows.push(aRow);
        }
    };
    Cartro.prototype = {
        init: function () {
            // For every col, up to 3 values in a given range
            var cols_candidates = [];
            var a = 1;
            for(var j=0; j<this.cols; j++) {
                cols_candidates.push(sort(shuffle(range(a,a+4)), this.cols));
                a += 5;
            }
            // For every row, must set 3 cells as void

        },
        clear: function () {
            for (var i = 0; i < this.rows; i++) { 
                for (var j = 0; j < this.cols; j++) {
                    this.getCellAt(i,j).clear();
                } 
            }
        },
        getRows: function () {
            return this.rows;
        },
        getSelected: function () {

        },
        getCellAt: function (i, j) {
            return this.rows[i][j];
        },
        toggle: function (i, j) {
            this.rows[i][j].toggle();
        }
    };

})();