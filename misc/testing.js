var template = '<div id="testing" style="margin:20px;">' +
    '<h4>Developer testing</h4>' +
    '<div id="testing_actions">' +
    '<button class="btn btn-warning" id="test_bind">Bind all elements</button>' +
    '<button class="btn btn-danger" id="test_unbind">Unbind all elements</button>' +
    '<button class="btn btn-info" id="test_dolog">Show log</button>' +
    '</div>' +
    '<div id="testing_log" style="margin-top:40px;"></div>' +
    '</div>';

var $el = $(template);
var $logElem = $el.find("#testing_log");
$('div[role="main"] .no-overflow').append($el);
// attach events
$el.find("#test_bind").on("click", function (ev) {
    var modules = Object.values(window.IB.sd);
    for (var i = 0, len = modules.length; i < len; i++) {
        modules[i].bind && modules[i].bind();
    }
    alert("Components bound");
    $el.find("#test_dolog").trigger("click");
});
$el.find("#test_unbind").on("click", function (ev) {
    var modules = Object.values(window.IB.sd);
    for (var i = 0, len = modules.length; i < len; i++) {
        modules[i].unbind && modules[i].unbind();
    }
    alert("Components unbound");
    $el.find("#test_dolog").trigger("click");
});
$el.find("#test_dolog").on("click", function (ev) {
    var modulesNames = Object.keys(window.IB.sd);
    var log = "Loaded modules (" + modulesNames.length + "):: " + modulesNames.join(",");
    for(var i=0, len=modulesNames.length; i<len; i++) {
        var moduleName = modulesNames[i];
        var module = window.IB.sd[moduleName];
        log += "<br>"
        var ids = Object.keys(module.inst || {});
        var info = ("v"+module.version || "v?.?") + " " + ( module.author || "?")
        log += "&nbsp;&nbsp;"+moduleName+" "+ info +":: Instances ("+ ids.length+") <br> ";
        for(var j=0, lj=ids.length; j<lj; j++) {
            var id = ids[j];
            var instance = module.inst[id];
            var proto = Object.getPrototypeOf(instance);
            var methods = Object.getOwnPropertyNames(proto);
            log += "&nbsp;&nbsp;&nbsp;&nbsp;"+ id + " ---> " + methods.join(", ") + "<br>";
        }
    }
    $logElem.html(log);
});