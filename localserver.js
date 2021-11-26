

//sobre-escriu les routes per les dinàmiques
const express = require('express');
const port = 3000;
const app = express();
const path = require('path')
const fs = require('fs')

app.use('/assets', express.static('./build/'));
app.use('/assets2', express.static('../iedib-atto-snippets-misc/styles/'));

app.get('/guiaus/:page', (req, res) => {
    const p = req.params;    
    p.page = decodeURI(p.page);
    const file = path.join("./guiaus/html/", p.page);
    if(file.endsWith(".html")) {
        // Serve the modified version of the file
        fs.readFile(file, "utf8", function(err, data){
            if(err) {
                res.send(`Cannot find ${file}`);
                return;
            }
            let parts = data.split("</head>");
            const injected = `
            <script type="text/x-mathjax-config">
            MathJax.Hub.Config({TeX: {extensions: ["cancel.js"]},CommonHTML: { linebreaks: { automatic: true } },"HTML-CSS": { linebreaks: { automatic: true } },SVG: { linebreaks: { automatic: true } }});
            </script>
    <script type="text/javascript"
        src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS_HTML"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="/assets2/snippets-m384-josep.css">
    <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css"
        integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p" crossorigin="anonymous" />
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.3.1.slim.js"></script>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
        integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
        crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx"
        crossorigin="anonymous"></script>
        <style>
            body {
                max-width:700px;
                margin:auto;
            }

        </style>

            `;
            let newContents = parts[0] + injected + parts[1];

            parts = newContents.split("<body>");
            topIndex = "<ul>";
            fs.readdirSync("./guiaus/html").forEach(e=>{
                if(e.endsWith(".html")) {
                    topIndex += `<li><a href="http://localhost:${port}/guiaus/${encodeURI(e)}">${e}</a></li>`
                }
            });
            topIndex+="</ul><hr>"

            newContents = `${parts[0]}
            <body>
            ${topIndex}
            ${parts[1]}
            `
            newContents = newContents.replace("</body>", 
            `
            <script src="http://localhost:3000/assets/all.min.js"></script>
            </body>`)

            // Disable video snip on preview server
            res.setHeader("content-type", "text/html");
            res.send(newContents);
        });        
    } else {
        res.send(`${file} not html page`); 
    }
});


app.use('/', express.static(__dirname + '/guiaus/html'));

app.listen(port, () => {
    console.log(`Servidor iniciado en el puerto ${port}`) 
    console.log(`http://localhost:${port}/guiaus/3%20Categories.html`)
});