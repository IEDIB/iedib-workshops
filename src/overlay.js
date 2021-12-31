(function(exports){

  var applyCss = function(el, styles) {
    var keys = Object.keys(styles);
    for(var i=0, len=keys.length; i<len; i++) {
      var prop = keys[i];
      var value = styles[prop];
      el.style[prop] = value;
    }
  };

  var Overlay = function(el) {
      applyCss(el, { 
        "position":"relative",
        "opacity": "0.9"
      });
      this.backdrop = document.createElement("div");
      applyCss(this.backdrop, {
        "display": "none",
        "position": "absolute",
        "width": "100%",
        "height": "100%",
        "top": "0",
        "left": "0",
        "background": "rgba(0,0,0,0.6)",
        "pointer-events": "none"
      });
      
      el.append(this.backdrop);

      this.overlay = document.createElement("div");
      this.overlay.style["display"] = "none";
      this.overlay.style["position"] = "absolute";
      this.overlay.style["width"] = "50%";
      this.overlay.style["height"] = "50%";
      this.overlay.style["top"] = "25%";
      this.overlay.style["left"] = "25%";
      this.overlay.style["border-radius"] = "10px";
      this.overlay.style["padding"] = "10px";
      this.overlay.style["background"] = "rgba(200,200,100)";
      this.overlay.style["box-shadow"]= "5px 5px rgb(20,20,20)";
      this.overlay.style["overflow"]= "hidden";

      var bulb = document.createElement("i");
      bulb.classList.add('fas');
      bulb.classList.add('fa-lightbulb');
      bulb.style["color"]= "white";
      bulb.style["float"]= "right"; 
      bulb.style["font-size"]= "4em";
      bulb.style["margin"]= "5px";
      
      this.overlay.append(bulb);
      el.append(this.overlay);
  }
  Overlay.prototype = {
      back: function(show) {
          if(show) {
            this.backdrop.style.display = ""; 
          } else {
            this.backdrop.style.display = "none"; 
          }
      },
      msg: function(html) {
          if(!html) {
            this.overlay.style.display = "none";
            return;
          }
          this.overlay.style.display = "";
          var pEl = document.createElement("p");
          pEl.innerHTML = html;
          this.overlay.append(pEl);
      }
  };

  exports.Overlay = Overlay;

})(window);
/*
var el = document.getElementById("A");
var overlay = new Overlay(el);
var msg = "Genial! Estudia les seccions marcades i després fes les activitats de peu de pàgina.dsfsdf";
overlay.back(true);
overlay.msg(msg);
*/