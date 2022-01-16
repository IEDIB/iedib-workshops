
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
    this.sectionsContainer = sectionsContainer;
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
      for (var i = 0, len = allLi.length; i < len; i++) {
        //allLi[i].style.display = 'none'; 
        if (allLi[i].classList.contains('pw-tiles-appear')) {
          toggleClasses(allLi[i], 'pw-tiles-appear', 'pw-tiles-disappear');
        }
      }
      var allTiles = tileContainer.querySelectorAll('.pw-tile');
      for (var i = 0, len = allTiles.length; i < len; i++) {
        allTiles[i].classList.remove('pw-tile-active');
      }

      if (self.active) {
        var h3El = sectionsContainer.querySelector('h3[data-target="' + id + '"]');
        var liEl = h3El.parentNode;
        liEl.style.display = "";
        liEl.classList.remove('pw-tiles-disappear');
        liEl.classList.add('pw-tiles-appear');
        self.aEl.classList.add('pw-tile-active');
      }

    };
    this.aEl.addEventListener("click", this.handler);
  };
  Tile.prototype.toggle = function() {
    this.handler({currentTarget: this.aEl});
  };
  Tile.prototype.severity = function (t) {
    if (t == 'important') {
      this.starEl.innerHTML = '<i class="fas fa-star" title="Recomanat"></i>';
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
  TilesSection.prototype.autoCollapse = function () {
    var ds = this._container.dataset;
    var idQuizz = ds.idQuizz;
    if (!idQuizz) {
      console.error("Missing idQuizz in sections container");
      return;
    }
    //retrive quizz performance from localstorage
    var provesInicials = IB.iapace._tree[IB.iapace.coursename || 'tal_alg'].ia;
    if (!provesInicials) {
      console.error("Cannot find initial test " + idQuizz)
      return;
    }
    var data = provesInicials[idQuizz];
    if (!data) {
      console.error("Cannot find initial test " + idQuizz);
      return;
    }
    // Parse ds.collapse
    if (ds.collapse) {
      var rules = ds.collapse.split(";");
      var firstDisplayed = false;
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
        if (!fullfilled) { 
          this.severity('important', '#'+secname);
          // And if it is the first recommended (display it)
          if(!firstDisplayed) {
             firstDisplayed  = this.toggle('#'+secname);
          }
        } 
      }
    }
  };
  TilesSection.prototype.toggle = function (which) { 
    if (which && this.sections[which]) { 
        this.sections[which].toggle(); 
        return true;
    } else {
      console.error("Cannot find section "+which);
    }
    return false;
  };
  TilesSection.prototype.severity = function (t, which) {
    if (which) {
      if (this.sections[which]) {
        this.sections[which].severity(t);
      }
    } else {
      // apply to all
      var keys = Object.keys(this.sections);
      for (var i = 0, len = keys.length; i < len; i++) {
        this.sections[keys[i]].severity(t);
      }
    }
  };
  TilesSection.prototype.dispose = function () {
    var keys = Object.keys(this.sections);
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i];
      // Show all sections hidden
      var aElem = this._sectionElems[i];
      aElem.parentNode.style.display = "";

      this.sections[key].dispose();
      this._container.dataset.active = "";
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

