/*@include: ./misc/jsxgraphcore.js */
//TODO remove this dependency 
/*@include: ./misc/js-expression-eval.min.js */


(function () {
    JXG.Options.text.useMathJax = true;
    var COMPONENT_NAME = "plotme";
    if (window.IB.sd[COMPONENT_NAME]) {
        // Already loaded in page
        // Bind any remaining component
        console.error("Warning: " + COMPONENT_NAME + " loaded twice.");
        window.IB.sd[COMPONENT_NAME].bind && window.IB.sd[COMPONENT_NAME].bind();
        return;
    } 
    
    var mapa = function(lst, cb) {
        var lst2 = [];
        for(var i=0, len=lst.length; i<len; i++) {
            lst2.push(cb(lst[i]));
        }
        return lst2;
    };

    var partStr = function(lst, i) {
        if(i < lst.length) {
            return lst[i].trim();
        }
        return null;
    };

    var partInt = function(lst, i) {
        var tmp = partStr(lst, i);
        if(tmp != null) {
            return parseInt(tmp);
        }
        return null;
    };

    var partFloat = function(lst, i) {
        var tmp = partStr(lst, i);
        if(tmp != null) {
            return parseFloat(tmp);
        }
        return null;
    };


    var Plotme = function(elem) {
        var self = this;
        this._elem = elem;
        if(!elem.classList.contains("jxgbox")) {
            elem.classList.add("jxgbox");
        }
        var ds = elem.dataset;
        this.bb = [-5,5,5,-5];
        if(ds.pltBb) {
            var parts = ds.pltBb.split(",");
            parts = mapa(parts, function(e){return parseFloat(e);});
            if(parts.length == 2) {
                this.bb = [-parts[0], parts[1], parts[0], -parts[1]];
            } else if(parts.length >= 4) {
                this.bb = [parts[0], parts[3], parts[1], parts[2]];
            }
        }
        this.id = elem.id;
         // Look for jessiecode
         var codiElem =elem.querySelector('script[type="text/jessiecode"]');
         var codi = null;
         if(codiElem) {
             var codi = codiElem.innerText;
             codi = codi.replace(/``/g, '<<').replace(/´´/g, '>>');
         }
        this.board = JXG.JSXGraph.initBoard(this.id, {boundingbox: this.bb, axis: true, showCopyright: false});
        if(codi) {
            self.board.jc.parse(codi);
        }

        if(ds.pltFun) {
            var parts = ds.pltFun.split("::");
            parts = mapa(parts, function(e){
                var parts2 = e.split(",");
                return {
                    expr: partStr(parts2, 0),
                    name: partStr(parts2, 1),
                    color: partStr(parts2, 2),
                    width: partInt(parts2, 3)
                }
            });
            for(var i=0; i<parts.length; i++) {
                var dd = parts[i];
                //console.error(dd);
                this.drawFunction(dd.expr, dd.name, dd.color, dd.width);
            }
        }

        if(ds.pltPoint) {
            var parts = ds.pltPoint.split("::");
            parts = mapa(parts, function(e){
                var parts2 = e.split(",");
                return {
                    x: partFloat(parts2, 0),
                    y: partFloat(parts2, 1),
                    name: partStr(parts2, 2),
                    color: partStr(parts2, 3),
                    size: partInt(parts2, 4)
                }
            });
            for(var i=0; i<parts.length; i++) {
                var dd = parts[i]; 
                this.drawPoint(dd.x, dd.y, dd.name, dd.color, dd.size);
            }
        }

        if(ds.pltBetween) {
            var parts = ds.pltBetween.split(",");
            parts = mapa(parts, function(e){
                // Retrieve object from board
                return JXG.getReference(self.board, e.trim());
            }); 
            this.drawBetween(parts[0], parts[1]); 
        }

        self.board.update();
    };
    Plotme.prototype = {
        drawFunction: function(expr, name, color, width) {
            color = color || "blue";
            width = width || 2;
            var parsed = Parser.parse(expr);
            var lfn = function(x) {
                return parsed.evaluate({x: x});
            };
            return this.board.create('functiongraph', [lfn], {strokeWidth: width, name: name, strokeColor: color});
        },
        drawPoint: function(x, y, name, color, size) {
            color = color || "blue";
            size = size || 3;
            return this.board.create('point', [x,y], {size: size, name: name, fixed:true, fillColor: color, strokeColor: color});
        },
        drawBetween: function(f, g) {
            var region = this.board.create('curve', [[], []], {strokeWidth:0, fillColor:'orange', fillOpacity: 0.3});
            region.updateDataArray = function() { 
                    // Start with (0, 0)
                    this.dataX = [0];
                    this.dataY = [0];
                    
                    // Copy all points from f2
                    this.dataX = this.dataX.concat( mapa(f.points, function(p){ return p.usrCoords[1];} ) );
                    this.dataY = this.dataY.concat( mapa(f.points, function(p){ return p.usrCoords[2];}) );
                    
                    // Copy all points from g2
                    this.dataX = this.dataX.concat( mapa(g.points, function(p){ return p.usrCoords[1];} ) );
                    this.dataY = this.dataY.concat( mapa(g.points, function(p){ return p.usrCoords[2];}) );
                
                    // Close curve (TODO: Check if correctly closed)
                    this.dataX = this.dataX.concat( f.points[0].usrCoords[1] );
                    this.dataY = this.dataY.concat( f.points[0].usrCoords[2] );
            }
        },
        getBoard: function() {
            return this.board;
        }
    };
 
    var alias = { author: "Josep Mulet", version: "1.0", inst: {} };
    window.IB.sd[COMPONENT_NAME] = alias;
    var bind = function () {
     
        var componentContainers = document.querySelectorAll('[role="' + COMPONENT_NAME + '"]');
        // Crea una instància de la classe anterior per a cadascun dels components trobats en la pàgina
        for(var i=0, len=componentContainers.length; i<len; i++) {
            var container = componentContainers[i];
            // Evita que un contenidor pugui ésser tractat més d'una vegada degut a múltiples insercions de la llibreria
            if(container.dataset.active) {
                continue;
            }
            container.dataset.active = "1";

            var instancia = new Plotme(container);
            // Exposa l'objecte a window per si es volgués emprar la seva API
            // Aquesta seria la forma d'utilitzar comunicació entre components (si fos necessari)
            // s'assegura que el contenidor del component té id, sinó l'assigna
            var id = container.getAttribute("id");
            if(!id) {
                id = "dynamic_"+Math.random().toString(32).substring(2);
                container.id = id;
            }
            window.IB.sd[COMPONENT_NAME].inst[id] = instancia;
        }
      
    };
    alias.bind = bind;
    alias.unbind = function() {
        var lInst = Object.values(alias.inst);
        for(var i=0, l=lInst.length; i<l; i++) {
            lInst[i].dispose();
        }
        alias.inst = {};
     };

    bind();


})();
