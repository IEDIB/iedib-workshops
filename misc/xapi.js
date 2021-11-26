/*
<div id="ava_ini">
    {h5p: Inicial Algebra }
</div>
<p><br></p>
<div id="main_hidden" style="display:none">
    <h1>Here starts the fun!</h1>
</div>
 */ 
function initApi() {
    var flatten = function(map) {
        if (!map) {
            return "";
        }
        if (typeof(map) != 'object') {
            return map;
        }
        var keys = Object.keys(map);
        var builder = "";
        for (var i = 0, len = keys.length; i < len; i++) {
            builder += map[keys[i]] + " ";
        }
        return builder;
    };
    var h5p_filter_iframe = document.querySelector("#ava_ini iframe");
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

    H5P.externalDispatcher.on('xAPI', function(evt) {
            console.log(evt);
            var data = evt.data;
            var st = data.statement;
            var verb = st.verb.id;
            var r = st.result;
            var isCompleted = verb == "http://adlnet.gov/expapi/verbs/completed";
            var isInteracted = verb == "http://adlnet.gov/expapi/verbs/interacted";
            var pregunta = flatten(st.object.definition.name);
            preguntes[pregunta] = evt.getScore() * 10 / evt.getMaxScore();


        if (isCompleted) {
            $("#ava_ini").css("display", "none");
            $("#main_hidden").css("display", "block");
            localStorage.setItem("c01", JSON.stringify({
                completion: r.completion,
                success: r.success,
                score: r.score.scaled * 10,
                preguntes: preguntes
            }));
        }

    });
return true;
}
// Attempt to execute a funcion up to n times, after a delay, before cancelling
// E----- delay ---> E----- delay ---> .... (n)
// fun must return true if success
var FunctionAttemptExec = function(fun, ntimes, delay) {
    var res = fun();
    if (!res && ntimes > 0) {
        // wait a delay
        window.setTimeout(function() {
            FunctionAttemptExec(fun, ntimes - 1, delay);
        }, delay);
    }
};

if (localStorage.getItem("c01")) {
    // Recover data
    var data = JSON.parse(localStorage.getItem("c01"));
    console.log(data);
    $("#ava_ini").css("display", "none");
    $("#main_hidden").css("display", "block");
} else {
    //Prepare initial
    FunctionAttemptExec(initApi, 5, 1000);
}
</script>