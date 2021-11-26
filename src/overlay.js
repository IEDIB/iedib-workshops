function Overlay(el) {
    el.style["position"] = "relative";
    el.style["opacity"] = "0.9";
    this.backdrop = document.createElement("div");
    this.backdrop.style["display"] = "none";
    this.backdrop.style["position"] = "absolute";
    this.backdrop.style["width"] = "100%";
    this.backdrop.style["height"] = "100%";
    this.backdrop.style["top"] = "0";
    this.backdrop.style["left"] = "0";
    this.backdrop.style["background"] = "rgba(0,0,0,0.6)";
    this.backdrop.style["pointer-events"] = "none";
    
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
        this.overlay.innerHTML = html;
    }
};
/*
var el = document.getElementById("A");
var overlay = new Overlay(el);
var msg = "Genial! Estudia les seccions marcades i després fes les activitats de peu de pàgina.dsfsdf";
overlay.back(true);
overlay.msg(msg);
*/