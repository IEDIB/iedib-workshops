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
      this.visible = false;
      applyCss(el, { 
        "position":"relative" 
      });

      this.backdrop = createElementWithClass("div", 'pw-overlay-backdrop');
      el.append(this.backdrop);
      this.overlay = createElementWithClass("div", 'pw-overlay-postit');
      this.pEl = document.createElement("p");
      this.overlay.append(this.pEl);
      el.append(this.overlay);
  }
  Overlay.prototype = {
      modal: function(show) {
          if(show) {
            this.backdrop.style.display = "flex"; 
          } else {
            this.backdrop.style.display = "none"; 
          }
      },
      toggle: function() {
        this.visible = !this.visible;
        if(this.visible) {
            //this.overlay.classList.remove("pw-overlay-postit-disappear");
            this.overlay.classList.add("pw-overlay-postit-appear");
        } else {
            //this.overlay.classList.remove("pw-overlay-postit-appear");
            this.overlay.classList.add("pw-overlay-postit-disappear");
        }
      },
      msg: function(html) {
          if(!html) {
            //this.overlay.classList.remove("pw-overlay-postit-appear");
            //this.overlay.classList.add("pw-overlay-postit-disappear");
            this.pEl.innerHTML = '';
            return;
          } 
          var self = this;
          
          if(this.lastMsg) {
            this.overlay.classList.remove("pw-overlay-postit-appear");
            this.overlay.classList.add("pw-overlay-postit-disappear");
            setTimeout(function() {
              self.pEl.innerHTML = html;
              self.overlay.classList.remove("pw-overlay-postit-disappear");
              self.overlay.classList.add("pw-overlay-postit-appear");
            }, 1000);
          } else { 
            self.pEl.innerHTML = html;
            this.overlay.classList.remove("pw-overlay-postit-disappear");
            this.overlay.classList.add("pw-overlay-postit-appear");
          } 

          this.lastMsg = html;
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