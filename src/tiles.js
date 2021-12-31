
(function () {
  var COMPONENT_NAME = "tiles";
  if (window.IB.sd[COMPONENT_NAME]) {
    // Already loaded in page
    // Bind any remaining component
    console.error("Warning: " + COMPONENT_NAME + " loaded twice.");
    window.IB.sd[COMPONENT_NAME].bind && window.IB.sd[COMPONENT_NAME].bind();
    return;
  }

  //Utility
  var createElementWithClass = function (type, className, inner) {
    var element = document.createElement(type);
    if (className) {
      element.className = className;
    }
    if (inner) {
      element.innerHTML = inner;
    }
    return element;
  };

  var toggleClasses = function (el, clazz1, clazz2) {
    var clazzes = el.classList;
    if (clazzes.contains(clazz1)) {
      clazzes.add(clazz2);
      clazzes.remove(clazz1);
    } else {
      clazzes.add(clazz1);
      clazzes.remove(clazz2);
    }
  };

  // Classe per tractar una única secció tipus tile
  var Tile = function (tileContainer, sectionsContainer, title, targetId) {
    this.active = false;
    this.tileContainer = tileContainer;
    this.aEl = createElementWithClass('div', 'pw-tile');
    this.aEl.dataset.target = targetId;
    this.starEl = createElementWithClass('p', 'pw-tile-star');
    this.titleEl = createElementWithClass('p', 'pw-tile-title', title);
    this.aEl.append(this.starEl);
    this.aEl.append(this.titleEl);
    this.tileContainer.append(this.aEl);
    
    // attach event on this section
    var self = this;
    this.handler = function (evt) {
      var id = evt.currentTarget.dataset.target;
      self.active = !self.active;
      var allLi = sectionsContainer.querySelectorAll('li');
      for(var i=0, len=allLi.length; i<len; i++) {
        allLi[i].style.display = 'none'; 
      }
      var allTiles = tileContainer.querySelectorAll('.pw-tile');
      for(var i=0, len=allTiles.length; i<len; i++) {
        allTiles[i].classList.remove('pw-tile-active');
      } 

      if(self.active) {
        var h3El = sectionsContainer.querySelector('h3[data-target="' + id + '"]');
        var liEl = h3El.parentNode;
        liEl.style.display = "";
        self.aEl.classList.add('pw-tile-active');
      } 
      
    };
    this.aEl.addEventListener("click", this.handler);
  };
  Tile.prototype.severity = function (t) {
    if (t == 'important') {
      this.starEl.innerHTML = '<i class="fas fa-star"></i>';
      this.aEl.classList.add("pw-title-important");
    } else {
      this.starEl.innerHTML = '';
      this.aEl.classList.remove("pw-tile-important");
    }
  };
  Tile.prototype.dispose = function (t) {
    this.aEl.removeEventListener("click", this.handler);
  };

  // Classe per crear instàncies. Aquesta classe tots els tiles i 
  var TilesSection = function (container) {
    var self = this;
    this.tileContainer = createElementWithClass('div', 'pw-tiles-panel');
    //Insert before the current container
    container.parentNode.insertBefore(this.tileContainer, container);

    this._container = container;
    this._sectionElems = container.querySelectorAll('li > h3[data-target]');

    this.sections = {};
    for (var i = 0, len = this._sectionElems.length; i < len; i++) {
      var aElem = this._sectionElems[i];
      aElem.parentNode.style.display = "none";
      var targetId = aElem.getAttribute("data-target");
      if (!targetId) {
        continue;
      }
      //titol
      var description = aElem.innerHTML;
      var tile = new Tile(this.tileContainer, container, description, targetId);
      this.sections[targetId] = tile;
    }

  };
  TilesSection.prototype.autoCollapse = function(){};
  TilesSection.prototype.severity = function(which, t) {
    if(which && this.sections[which]) {
        this.sections[which].severity(t);
    }  
  };
  TilesSection.prototype.dispose = function () {
    var keys = Object.keys(this.sections);
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i];
      this.sections[key].dispose();
    }
    //Get rid of panel
    this.tileContainer.remove();
  };

  var alias = { inst: {} };
  window.IB.sd[COMPONENT_NAME] = alias;
  var bind = function () {
    var sectionElems = document.querySelectorAll('ul[role="tiles"]');
    for (var i = 0, len = sectionElems.length; i < len; i++) {
      var elem = sectionElems[i];
      if (elem.dataset.active == "1") {
        continue;
      }
      elem.dataset.active = "1";
      var inst = new TilesSection(elem);
      if (!inst.id) {
        inst.id = "sd_" + Math.random().toString(32).substring(2);
      }
      alias.inst[inst.id] = inst;
    }
  };
  alias.bind = bind;
  alias.unbind = function () {
    var lInst = Object.values(alias.inst);
    for (var i = 0, l = lInst.length; i < l; i++) {
      lInst[i].dispose();
    }
    alias.inst = {};
  };

  bind();

}());

