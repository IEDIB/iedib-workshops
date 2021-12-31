(function(exports){

  var applyCss = function(el, styles) {
    if(!styles) {
      return;
    }
    var keys = Object.keys(styles);
    for(var i=0, len=keys.length; i<len; i++) {
      var prop = keys[i];
      var value = styles[prop];
      el.style[prop] = value;
    }
  };
  var addClasses = function(el, classes) {
    if(!classes) {
      return;
    }
    var classList = classes.split(" ");
    for(var i=0, len=classList.length; i<len; i++) { 
      var clazz = classList[i].trim();
      if(!clazz) {
        continue;
      }
      el.classList.add(clazz);
    }
  };
  var createElementWithClass = function(type, classes, styles) {
    var el = document.createElement(type);
    addClasses(el, classes);
    if(styles) {
      applyCss(el, styles);
    }
    return el;
  };

  var Overlay = function(el) {
      applyCss(el, { 
        "position":"relative",
        "opacity": "0.9"
      });

      this.backdrop = createElementWithClass("div", 'pw-overlay-backdrop');
      
      el.append(this.backdrop);

      this.overlay = createElementWithClass("div", 'pw-overlay-postit');
  
      el.append(this.overlay);
  }
  Overlay.prototype = {
      back: function(show) {
          if(show) {
            this.backdrop.style.display = "flex"; 
          } else {
            this.backdrop.style.display = "none"; 
          }
      },
      msg: function(html) {
          if(!html) {
            this.overlay.style.display = "none";
            return;
          }
          this.overlay.style.display = "flex";
          var pEl = document.createElement("p");
          pEl.innerHTML = html;
          this.overlay.append(pEl);
          this.overlay.classList.add("pw-overlay-postit-appear");
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