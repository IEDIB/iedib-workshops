window.IAPace = window.IAPace || {};
(function (M) {
    var HISTORY_LEN  = 4;
    /**
     * Utility functions
     * @param  url 
     * @returns 
     */
    var parseUrlParams = function (url) {
        var params = {};
        var parts = url.substring(1).split('&');

        for (var i = 0; i < parts.length; i++) {
            var nv = parts[i].split('=');
            if (!nv[0]) continue;
            params[nv[0]] = nv[1] || true;
        }
        return params;
    };

    // Class to for the entire frameset
    var FrameSet = function (coursename, defaultLevel) {
        this._changeHandlers = {};
        this.coursename = coursename;
        this.defaultLevel = defaultLevel <= 4 ? defaultLevel : 4;
        this._tree = {}; //semiflat tree
        this.load();
    };
    FrameSet.prototype = {
        load: function () {
            var toRecover = localStorage.getItem("iapace");
            try {
                this._tree = JSON.parse(toRecover);
            } catch (ex) {
                console.error(ex);
            }
            var mustSave = false;
            if (!this._tree) {
                this._tree = {};
                mustSave = true;
            }
            if (!this._tree[this.coursename]) {
                this._tree[this.coursename] = {
                    dl: this.defaultLevel,
                    ch: {},
                    ia: {}
                };
                mustSave = true;
            }
            mustSave && this.save();
        },
        save: function () {
            if (!this._tree) {
                return;
            }
            localStorage.setItem("iapace", JSON.stringify(this._tree));
        },
        drop: function (fullPath) {
            var oldScore = null;
            var newScore = null;
            if(this._changeHandlers[fullPath] || this._changeHandlers['*']) {
                oldScore = this.inference(fullPath);
            }
            var keys = Object.keys(this._tree[this.coursename].ch);
            for (var i = 0, l = keys.length; i < l; i++) {
                if (keys[i].startsWith(fullPath)) {
                    delete this._tree[this.coursename].ch[keys[i]];
                }
            }
            if(this._changeHandlers[fullPath] || this._changeHandlers['*']) {
                newScore = this.inference(fullPath);
            }
            if(oldScore!=null && newScore!=null && oldScore!=newScore) { 
                this._triggerChangeEvt(fullPath, oldScore, newScore); 
            }
        },
        find: function (fullPath) {
            return this._tree[this.coursename].ch[fullPath];
        },
        create: function (fullPath) {
            var parts = fullPath.split(".");
            var p = parts[0];
            if (!this.find(p)) {
                this._tree[this.coursename].ch[p] = {
                    n: 0,
                    s: 0,
                    s2: 0,
                    h: []
                };
            }
            for (var i = 1, l = parts.length; i < l; i++) {
                p = p + "." + parts[i];
                if (!this.find(p)) {
                    this._tree[this.coursename].ch[p] = {
                        n: 0,
                        s: 0,
                        s2: 0,
                        h: []
                    };
                }
            }
            return this._tree[this.coursename].ch[fullPath];
        },
        saveInitialEval: function (evalId, obj2Register) {
            this._tree[this.coursename].ia[evalId] = obj2Register;
            this.save();
        },
        loadInitialEval: function (evalId) {
            return this._tree[this.coursename].ia[evalId];
        },
        findCreate: function (fullPath) {
            var found = this.find(fullPath);
            if (!found) {
                found = this.create(fullPath);
            }
            return found;
        },
        addScore: function (fullPath, score) {
            var oldScore = null;
            var newScore = null;
            if(this._changeHandlers[fullPath] || this._changeHandlers['*']) {
                oldScore = this.inference(fullPath);
            }
            var found = this.findCreate(fullPath);
            found.n += 1;
            found.s += score;
            found.s2 += score * score;
            found.h.push(score);
            //most recent score history
            while (found.h.length > HISTORY_LEN) {
                found.h.shift();
            }
            if(this._changeHandlers[fullPath] || this._changeHandlers['*'])  {
                newScore = this.inference(fullPath);
            }
            if(oldScore!=null && newScore!=null && oldScore!=newScore) {
                this._triggerChangeEvt(fullPath, oldScore, newScore); 
            }
        },
        // Level has 0=beginner, 1=learner, 2=advanced learner, 3=advanced
        level: function (fullPath) {
            var frame = this.findCreate(fullPath);
            // Determine the level according to local data
            // If no local data is found, return null in order to transverse the tree
            var n = frame.n;
            if (n > 0) {
                var mean = frame.s / (1.0 * n);
                var std = Math.sqrt(Math.abs(frame.s2 / n - mean * mean));
                if (mean == 0) {
                    return 1;
                }
                var cv = std / mean;
                // Take into account recent history vector
                if(frame.h.length >= HISTORY_LEN) {
                    var mean2 = 0;
                    var std2 = 0;
                    var nhl = frame.h.length; 
                    for(var i=0; i < nhl; i++) {
                        var val = frame.h[i]
                        mean2 += val;
                        std2 += val*val;
                    }
                    mean2 = mean2 / (1.0*nhl);
                    std2 = Math.sqrt(std2 / (1.0*nhl) - mean2*mean2);
                    if(mean2 > 0) {
                        cv2 = std2/mean2;
                        if(cv2 < 0.75) {
                            //consistent results obtained in recent history (sigues optimista)
                            var calc = 0.1*mean+0.9*mean2;
                            mean = calc>mean? calc:mean;
                        }
                    }  
                }

                // Compute nivell
                var nivell = Math.round(0.4 * mean);
                if (nivell > 1 && cv > 0.75) {
                    nivell -= 1;
                }

                return nivell>0? nivell:1;
            } else {
                return frame.dl;
            }
        },
        inference: function (fullPath) {
            var frame = this.find(fullPath);
            var parts = fullPath.split(".");
            var parentPath = parts.slice(0, parts.length - 1).join(".");
            if (frame) {
                var level = this.level(fullPath);
                if (level) {
                    return level;
                } else {
                    if (parentPath) {
                        return this.inference(parentPath);
                    } else {
                        return this._tree[this.coursename].dl;
                    }
                }
            } else {
                if (parentPath) {
                    return this.inference(parentPath);
                } else {
                    return this._tree[this.coursename].dl;
                }
            }
        },
        toString: function () {
            return JSON.stringify(this._tree, null, 2);
        },
        addChangeListener: function(path, cb) {
            var list = this._changeHandlers[path];
            if(!list) {
                list = [];
                this._changeHandlers[path] = list;
            }
            list.push(cb);
        },
        _triggerChangeEvt: function(path, oldValue, newValue) {
            if(this._changeHandlers[path]) {
                var list = this._changeHandlers[path];
                for(var i=0, len=list.length; i<len; i++) {
                    list[i](path, oldValue, newValue);
                }
            }
            if(this._changeHandlers['*']) {
                var list = this._changeHandlers['*'];
                for(var i=0, len=list.length; i<len; i++) {
                    list[i](path, oldValue, newValue);
                }
            }
        }
    };

    M.load = function (path, def) {
        return new FrameSet(path, def);
    }
    window.IB = window.IB || {};
    var coursename = "";
    //now try to get the real name from Moodle's page
    var courseId;
    var footer = document.querySelector(".homelink > a");
    if (footer) {
        courseName = footer.innerText;
        var hrefVal = "?" + (footer.href.split("?")[1] || "");
        courseId = parseUrlParams(hrefVal).id;
    }
    coursename = coursename || courseId || "cmat0";
    //create a working instance
    window.IB.iapace = new FrameSet(coursename, 2);
})(window.IAPace);
