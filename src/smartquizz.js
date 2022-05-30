window.IB = window.IB || {};
window.IB.sd =  window.IB.sd || {};
(function () {
    /**
     * This component requires that other components are loaded in page
     */
    var hasSections = window.IB.sd['tiles'] != null || window.IB.sd['sections'] != null ;
    var hasIAPace = window.IB != null && window.IB.iapace != null;
    var hasOverlay = window.Overlay != null;
    var hasConfetti = window.Confetti != null;
    if(!hasSections) {
        console.error("Sections/Tiles module required");
    }
    if(!hasIAPace) {
        console.error("IAPace module required");
    }
    if(!hasOverlay) {
        console.error("Overlay module required");
    }
    if(!hasConfetti) {
        console.error("Confetti module required");
    }
    
    
    var COMPONENT_NAME = "smartquizz";
    if (window.IB.sd[COMPONENT_NAME]) {
        // Already loaded in page
        // Bind any remaining component
        console.error("Warning: " + COMPONENT_NAME + " loaded twice.");
        window.IB.sd[COMPONENT_NAME].bind && window.IB.sd[COMPONENT_NAME].bind();
        return;
    }

    function handleInteraction(elem, data, ds, revisited) {
        console.log("handle interaction");
        console.log(data, ds); 
        
        // Parse ds.growl
        if (ds.growl) {
            var growls = ds.growl.split(";");
            for (var ir = 0, lr = growls.length; ir < lr; ir++) {
                var rule = growls[ir];
                var ruleParts = rule.split(":");
                var text = ruleParts[0].trim();
                var condition = ruleParts[1].trim();
                condition = condition.replace("\\gt",">").replace("\\ge",">=")
                                     .replace("\\lt","<").replace("\\le","<=");
                var fullfilled = eval("" + data.score + condition);
                if (fullfilled) {
                    if (!revisited) {
                        console.log("Must say aloud if not revisited ", text);
                    }
                    if(hasOverlay) {
                        elem.querySelector("iframe").style['pointer-events']="none";
                        var overlay = new Overlay(elem);
                        overlay.modal(true);
                        overlay.msg(text);
                    } 
                    break;
                }
            }
        }

        //Do autocollapse of sections if it applies
        if(hasSections) {
            var sectionInstances = Object.values(IB.sd['tiles'].inst || {});
            for(var ks=0, lks=sectionInstances.length; ks<lks; ks++) {
                sectionInstances[ks].autoCollapse && sectionInstances[ks].autoCollapse();
            }
            sectionInstances = Object.values(IB.sd['sections'].inst || {});
            for(var ks=0, lks=sectionInstances.length; ks<lks; ks++) {
                sectionInstances[ks].autoCollapse && sectionInstances[ks].autoCollapse();
            }
        }

        //parse ds.scroll
        if (ds.scroll) {
            var scrolls = ds.scroll.split(";");
            for (var ir = 0, lr = scrolls.length; ir < lr; ir++) {
                var scroll = scrolls[ir];
                var ruleParts = scroll.split(":");
                var sec = ruleParts[0].trim();
                var condition = ruleParts[1].trim();
                condition = condition.replace("\\gt",">").replace("\\ge",">=")
                                     .replace("\\lt","<").replace("\\le","<=");
                var fullfilled = eval("" + data.score + condition);
                fullfilled = condition.replace("\\gt",">").replace("\\ge",">=")
                .replace("\\lt","<").replace("\\le","<=");
                if (fullfilled) {
                    if (!revisited) { 
                        var aTag = $("a[name='"+ sec +"']");
                        $('html,body').animate({scrollTop: aTag.offset().top-200}, 'fast');
                    } 
                    break;
                }
            }
        }
    }

    function initApi(elem) {
        var flatten = function (map) {
            if (!map) {
                return "";
            }
            if (typeof (map) != 'object') {
                return map;
            }
            var keys = Object.keys(map);
            var builder = "";
            for (var i = 0, len = keys.length; i < len; i++) {
                builder += map[keys[i]] + " ";
            }
            return builder;
        };
        var h5p_filter = document.querySelector('[role="smartquizz"]');
        var h5p_filter_iframe = h5p_filter.querySelector('iframe');
        if (!h5p_filter_iframe) {
            return;
        }
        var embed_doc = h5p_filter_iframe.contentWindow;
        console.log(embed_doc);
        var h5p_iframe = embed_doc.document.querySelector('iframe.h5p-iframe');
        console.log(h5p_iframe);
        if (!h5p_iframe) {
            return false;
        }

        h5p_iframe = h5p_iframe.contentWindow;
        console.log(h5p_iframe);
        var H5P = h5p_iframe.H5P;
        console.log(H5P);
        if (!H5P) {
            console.log("NO H5P trying latter");
            return false;
        }

        var preguntes = {};

        H5P.externalDispatcher.on('xAPI', function (evt) {
            console.log(evt);
            var data = evt.data;
            var st = data.statement;
            var verb = st.verb.id;
            var r = st.result;
            var isCompleted = verb == "http://adlnet.gov/expapi/verbs/completed";
            var isInteracted = verb == "http://adlnet.gov/expapi/verbs/interacted";
            var pregunta = flatten(st.object.definition.name).trim();
            var ascore = evt.getScore() * 10 / evt.getMaxScore();
           
            if(hasIAPace && elem.dataset.category && ascore!=null && !isNaN(ascore)) {
                preguntes[pregunta] = ascore;
                console.log("Adding score to " + elem.dataset.category, ascore)
                IB.iapace.addScore(elem.dataset.category, ascore);
            } 

            if (isCompleted) {
                //h5p_filter.style["display"] = "none";
                //$("#main_hidden").css("display", "block");
                var overallScore = r.score.scaled * 10;
                var persistData = {
                    completion: r.completion,
                    success: r.success,
                    score: overallScore,
                    preguntes: preguntes
                };
                if(hasIAPace) {
                    IB.iapace.saveInitialEval(elem.id, persistData);
                } 
                if(elem.dataset.confetti && hasConfetti) {
                    var condition = elem.dataset.confetti;
                    condition = condition.replace("\\gt",">").replace("\\ge",">=")
                                     .replace("\\lt","<").replace("\\le","<=");
                    var fullfilled = eval("" + overallScore + condition);
                    if(fullfilled) {
                        var confetti = new Confetti(elem);
                        confetti.play();
                        window.setTimeout(function() {
                            handleInteraction(elem, persistData, h5p_filter.dataset, false);
                        }, 1500);
                    } else {
                        handleInteraction(elem, persistData, h5p_filter.dataset, false);
                    }
                } else {
                    handleInteraction(elem, persistData, h5p_filter.dataset, false);
                }
            }

        });
        //$("#main_hidden").css("display", "none");
        return true;
    }

    // Attempt to execute a funcion up to n times, after a delay, before cancelling
    // E----- delay ---> E----- delay ---> .... (n)
    // fun must return true if success
    var FunctionAttemptExec = function (fun, ntimes, delay, arg) {
        var res = fun(arg);
        if (!res && ntimes > 0) {
            // wait a delay
            window.setTimeout(function () {
                FunctionAttemptExec(fun, ntimes - 1, delay, arg);
            }, delay);
        }
    };

    var alias = {author: "Josep Mulet", version: "1.0", inst: {} };
    window.IB.sd[COMPONENT_NAME] = alias;
    var bind = function () {
        var smarts = document.querySelectorAll('[role="smartquizz"]');
        for (var i = 0, len = smarts.length; i < len; i++) {
            if(smarts[i].dataset.active) {
                continue;
            }
            smarts[i].dataset.active = "1";
            var idAvaluacio = smarts[i].id;
            console.log(idAvaluacio, hasIAPace);
            // Missatge al principi
            var ah3= document.createElement("h4");
            ah3.innerText= "Avaluació inicial";
            ah3.style.padding = "0";
            var ap = document.createElement("p");
            ap.innerText = "Dedica uns instants a contestar aquestes preguntes. D'aquesta forma podrem adaptar millor els continguts als teus coneixements.";
            smarts[i].prepend(ap);
            smarts[i].prepend(ah3);
            

            if(idAvaluacio && hasIAPace) {
                var persistData = IB.iapace.loadInitialEval(idAvaluacio);
                if (persistData) { 
                    console.log(persistData); 
                    handleInteraction(smarts[i], persistData, smarts[i].dataset, true);
                } else {
                    console.log("No initial data");
                    //Prepare initial
                    FunctionAttemptExec(initApi, 5, 1000, smarts[i]);
                }
            }
        }
    };

    alias.bind = bind;
    alias.unbind = function() {
        console.error("Not implemented");
    };
    bind();

})();