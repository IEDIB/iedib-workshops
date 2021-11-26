 
(function(){
  var COMPONENT_NAME = "sections";
  if(window.IB.sd[COMPONENT_NAME]) {
    // Already loaded in page
    // Bind any remaining component
    console.error("Warning: "+COMPONENT_NAME+" loaded twice.");
    window.IB.sd[COMPONENT_NAME].bind && window.IB.sd[COMPONENT_NAME].bind();
    return;
  }
  
  //Utility
  var toggleClasses = function(el, clazz1, clazz2) {
      var clazzes = el.classList;
      if(clazzes.contains(clazz1)) {
         clazzes.add(clazz2);
         clazzes.remove(clazz1);
      } else {
         clazzes.add(clazz1);
         clazzes.remove(clazz2);
      }
  };
  
  // Classe per tractar una única secció
  var Section = function(aEl) {
      this.aEl = aEl;
      this.parentLI = aEl.parentElement;
      this.aEl.classList.add("pw-section-active"); 
      this.aEl.classList.add("pw-section-minus"); 
      this.targetQuery = aEl.getAttribute('data-target');
      this.target = this.parentLI.querySelector(this.targetQuery);
      this.closed = false;
      var self = this;  
      this.handler = function(evt) {
          self.toggle();
      };
      this.active = true;
      this.aEl.addEventListener("click", this.handler);
  };
  Section.prototype = { 
      toggle: function() {
          toggleClasses(this.aEl, "pw-section-plus", "pw-section-minus");
          toggleClasses(this.target, "pw-section-semi","pw-section-showing")
          this.active = !this.active;
      },
      expand: function() {
          if(!this.active) {
            this.toggle();
          }
      },
      collapse: function() {
          if(this.active) {
            this.toggle();
          }
      },
      severity: function(t) {
          if(t=='important') {
             this.aEl.classList.add("pw-section-important");
          } else {
              this.aEl.classList.remove("pw-section-important");
          }
      },
      dispose: function() {
          this.aEl.removeEventListener("click", this.handler);
          this.aEl.classList.remove("pw-section-active"); 
          this.aEl.classList.remove("pw-section-minus");
          this.aEl.classList.remove("pw-section-plus");
          this.target.classList.remove("pw-section-semi");
          this.target.classList.remove("pw-section-showing"); 
      }
  };
  
  // Classe per crear instàncies. Aquesta classe conté tots els desplegables
  var TimelineSections = function(container) {
     var self = this; 
     this._container = container;  
     this._sectionElems = container.querySelectorAll('li > h3[data-target]'); 
     this.sections = {};
     for(var i=0, len=this._sectionElems.length; i<len; i++) {
        var aElem = this._sectionElems[i]; 
        var targetId = aElem.getAttribute("data-target");
        if(!targetId) {
          continue;
        } 
        this.sections[targetId] = new Section(aElem);
     }
  };
  TimelineSections.prototype = {
      autoCollapse: function() {
            var ds = this._container.dataset;  
            var idQuizz = ds.idQuizz;
            if(!idQuizz) {
              console.error("Missing idQuizz in sections container");
              return;
            }
            //retrive quizz performance from localstore
            var provesInicials = IB.iapace._tree[IB.iapace.coursename || 'cmat0'].ia;
            if(!provesInicials) {
              console.error("Cannot find initial test "+idQuizz)
              return;
            }
            var data = provesInicials[idQuizz];
            if(!data) {
              console.error("Cannot find initial test "+idQuizz);
              return;
            }
            // Parse ds.collapse
            if (ds.collapse) {
              var rules = ds.collapse.split(";");
              for (var ir = 0, lr = rules.length; ir < lr; ir++) {
                  var rule = rules[ir];
                  var ruleParts = rule.split(":");
                  var secname = ruleParts[0].trim();
                  var pregrules = ruleParts[1].trim();
                  var fullfilled = true;
                  var conditions = pregrules.split("+");
                  for (var ic = 0, lc = conditions.length; ic < lc; ic++) {
                      var preg = conditions[ic].trim();
                      if (data.preguntes[preg] < 5) {
                          fullfilled = false;
                          break;
                      }
                  }
                  if (fullfilled) {
                      console.log("Must collapse ", secname);
                      this.collapse('#'+secname); 
                  }
              }
            }
      },
      expand: function(which) {
        if(which) {
          if(this.sections[which]) {
              this.sections[which].expand();
          }
        } else {
          var keys = Object.keys(this.sections);
          for(var i=0, len=keys.length; i<len; i++) {
            var key = keys[i];
            this.sections[key].expand();
          }
        }   
      },
      collapse: function(which) {
        if(which) {
          if(this.sections[which]) {
              this.sections[which].collapse();
          }
        } else {
          var keys = Object.keys(this.sections);
          for(var i=0, len=keys.length; i<len; i++) {
            var key = keys[i];
            this.sections[key].collapse();
          }
        }   
      },
      severity: function(which, t) {
        if(which && this.sections[which]) {
            this.sections[which].severity(t);
        }  
      },
      dispose: function() {
        var keys = Object.keys(this.sections);
        for(var i=0, len=keys.length; i<len; i++) {
          var key = keys[i];
          this.sections[key].dispose();
        }
      }
  };
  
  var alias = {inst: {}};
  window.IB.sd[COMPONENT_NAME] = alias;
  var bind = function() {
    var sectionElems = document.querySelectorAll('ul[role="sections"]');
    for(var i=0, len=sectionElems.length; i<len; i++) {
      var elem = sectionElems[i]; 
      if(elem.dataset.active == "1") {
        continue;
      }
      elem.dataset.active = "1";
      var inst = new TimelineSections(elem);
      if(!inst.id) {
        inst.id = "sd_"+Math.random().toString(32).substring(2);
      }
      alias.inst[inst.id] = inst;
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
  
}());

