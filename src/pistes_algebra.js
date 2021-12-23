/**
 * Petit joc de pistes d'àlgebra
 * basat en l'avaluació numèrica d'expressions
 * algebraiques
 * @author Josep Mulet Pol
 * @date 2021-2022
 */
 

(function(){

    var $container = $('#pistes_container');
    if(!$container.length) {
        console.error("Cannot find element with id: pistes_container");
        return;
    }
    var $table = $('<table class="pistes"></table>');

    var ncolumns = 2 + 8;
    var nrows = 4 + 1;


    var $row = $('<tr class="pistes_header"></tr>');
    for(var i=0; i<ncolumns; i++) {
        var $cell = null;
        if(i==0) {
            $cell = $('<td rowspan="5" class="pistes_vert">START</td>');
        } else if(i==ncolumns-1) {
            $cell = $('<td rowspan="5" class="pistes_vert">META</td>');
        } else {
            $cell = $("<td>xxx</td>");
        }
        $row.append($cell);
    }
    $table.append($row);
    
    for(var j=0; j<nrows-1; j++) {
        $row = $('<tr class="pistes_pista'+j+'"></tr>');
        for(var i=0; i<ncolumns-2; i++) {
            var $cell = null;  
            $cell = $("<td>?</td>");
            $row.append($cell);
        }
        $table.append($row);
    }
    $container.append($table);

    //Preload cars
    var cars = [
        $('<img src="https://piworld.es/iedib/img/car-r.png" style="width:90px"/>'),
        $('<img src="https://piworld.es/iedib/img/car-b.png" style="width:90px"/>'),
        $('<img src="https://piworld.es/iedib/img/car-g.png" style="width:90px"/>'),
        $('<img src="https://piworld.es/iedib/img/car-y.png" style="width:90px"/>')
    ];
    // Add cars to the scene
    $table.find(".pistes_pista0 > td").first().append(cars[0]);
    $table.find(".pistes_pista1 > td").first().append(cars[1]);
    $table.find(".pistes_pista2 > td").first().append(cars[2]);
    $table.find(".pistes_pista3 > td").first().append(cars[3]);
    

})();