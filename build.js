const fs = require("fs")
const path = require("path")
var UglifyJS = require("uglify-js"); 
const yaml = require('js-yaml');

var options = {
    mangle: true
};

console.log("******************************************")
console.log("** Compile and minify dynamic snippets  **") 
console.log("******************************************")
console.log(" ")

const src = "./src/" 
const dst = "./build/" 
console.log(`> src=${src}`)
console.log(`> dst=${dst}`)
console.log(" ")
  
// ALL bundle must ensure this order
const precedences = ['overlay.js','iapace.js','sections.js','tiles.js','confetti.js','smartquizz.js']; 


// Uglify all files
let all = new Array(precedences.length);
let allcss = "";
// empaqueta per categories
const categories = {
    "general": {code:[], css:[]}
};

fs.readdirSync(src).forEach( (file) => { 
    if(path.extname(file)!=".js") {
        return
    }  
    // look for category in presets
    const presetFile = path.join("presets", "dynamic_"+file.replace(".js",".yaml"));
    let currentCat = "general";
    if(fs.existsSync(presetFile)) {
        const txt = fs.readFileSync(presetFile, "utf-8");
        try {
            let parsed = yaml.load(txt);
            if(parsed.misc.category) {
                currentCat = parsed.misc.category.toLowerCase().trim();
            }
        } catch(ex){
            console.error(ex);
        }
    }
    let catObj = categories[currentCat];
    if(!catObj) {
        catObj = {code:[], css:[]};
        categories[currentCat] = catObj;
    }
    const result = UglifyJS.minify(path.join(src, file), options)

    if(result.error) {
        console.error(result.error)
        process.exit(1)
    } else if(result.warnings) {
        console.log(result.warnings)
    }
    const indx = precedences.indexOf(file)
    if(indx >=0 ) {
        all[indx] = result.code
    } else {
        all.push(result.code)
    } 
    
    let code = result.code;
    catObj.code.push(code);
    if(fs.existsSync(path.join(src, file.replace(".js",".css")))) {

        let local_css = fs.readFileSync(path.join(src, file.replace(".js",".css")), "utf8");
        local_css = local_css.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g,' ').replace(/\t/g,' ').replace(/  /g, ' ').replace(/5 Free/g,'5 Pro');
        catObj.css.push(local_css);
        allcss += " "+local_css;

         // add css
         code = ` 
         !function(){if(document.getElementById("sd_css_${file}")){return;}; var l = '${local_css}'; var s = document.createElement('style'); s.type = 'text/css'; s.innerHTML = l; s.id="sd_css_${file}"; document.getElementsByTagName('head')[0].appendChild(s);}();
         `
         + code 
    }

    code = "window.IB = window.IB || {}; window.IB.sd = window.IB.sd || {}; "+ code

    let target = path.join(dst, file.replace(".js", ".min.js"));
    fs.writeFileSync(target, code, {encoding:'utf8'});
    console.log("> written " + target);
     

});


if(allcss.length) {
    // add css
    all.unshift(`
    window.IB = window.IB || {}; window.IB.sd = window.IB.sd || {}; 
    !function(){if(document.getElementById("sd_css_all")){return;}; var l = '${allcss}'; var s = document.createElement('style'); s.type = 'text/css'; s.innerHTML = l; s.id="sd_css_all"; document.getElementsByTagName('head')[0].appendChild(s);}();
    `)
}

// Monolithic file with everything
target = path.join(dst, "all_iboc.min.js");
fs.writeFileSync(target, all.join('\n'), {encoding:'utf8'});
console.log("> written " + target);

 
// Monolithic file only with css
if(allcss.length) {
    // add css
    all = `
    !function(){if(document.getElementById("sd_css_all")){return;}; var l = '${allcss}'; var s = document.createElement('style'); s.type = 'text/css'; s.innerHTML = l; s.id="sd_css_all"; document.getElementsByTagName('head')[0].appendChild(s);}();
    ` 
    target = path.join(dst, "allcss_iboc.min.js");
    fs.writeFileSync(target, all, {encoding:'utf8'});
    console.log("> written " + target);
}

// Bundles by categories
/*
Object.keys(categories).forEach( (catname) => {
    var listCode = categories[catname].code;
    var listCss= categories[catname].css;
    
    let code = "window.IB = window.IB || {}; window.IB.sd = window.IB.sd || {};";
    if(listCss.length) {
        code += `
        !function(){if(document.getElementById("sd_css_${catname}")){return;}; var l = '${listCss.join(" ")}'; var s = document.createElement('style'); s.type = 'text/css'; s.innerHTML = l; s.id="sd_css_${catname}"; document.getElementsByTagName('head')[0].appendChild(s);}();
        `;
    }
    code += listCode.join(" \n")
    let target = path.join(dst, catname+"_cat.min.js");
    fs.writeFileSync(target, code, {encoding:'utf8'});
    console.log("> written " + target);
});
*/