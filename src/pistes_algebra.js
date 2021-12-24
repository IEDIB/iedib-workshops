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
            $cell = $('<td class="pistes_dropable"> </td>');
            $row.append($cell);
        }
        $table.append($row);
    }
    $container.append($table);

    //Preload cars
    var cars = [
        $('<img draggable="true" id="car_r" src="https://piworld.es/iedib/img/car-r.png" style="width:90px"/>'),
        $('<img draggable="true" id="car_b" src="https://piworld.es/iedib/img/car-b.png" style="width:90px"/>'),
        $('<img draggable="true" id="car_g" src="https://piworld.es/iedib/img/car-g.png" style="width:90px"/>'),
        $('<img draggable="true" id="car_y" src="https://piworld.es/iedib/img/car-y.png" style="width:90px"/>')
    ];
    // Add cars to the scene
    $table.find(".pistes_pista0 > td").first().append(cars[0]);
    $table.find(".pistes_pista1 > td").first().append(cars[1]);
    $table.find(".pistes_pista2 > td").first().append(cars[2]);
    $table.find(".pistes_pista3 > td").first().append(cars[3]);
    
    function handleDragStart(ev) {
        console.log("Drag start", ev);
        ev.target.style.opacity = 0;
        ev.originalEvent.dataTransfer.setData("car", ev.target.id);
    }
    function handleDragEnd(ev){
        console.log("Drag end", ev)
        ev.target.style.opacity=1;
        ev.preventDefault(); 
    } 
    function handleDragEnter(ev){
        console.log("Drag enter", ev)
        ev.preventDefault();
        ev.target.style.border="2px dashed black";
    }
    function handleDragLeave(ev){
        console.log("Drag leave", ev)
        ev.preventDefault(); 
        ev.target.style.border="1px solid gray";
    }
    function handleDragOver(ev) {
        var data = ev.originalEvent.dataTransfer.getData("car");
        var row = ev.target.parent;
        // only if row is of the same type of data
        ev.originalEvent.dataTransfer.dropEffect = 'move';
        ev.preventDefault();
    }
    function handleDrop(ev){
        console.log("Drop", ev)
        ev.preventDefault();
        var data = ev.originalEvent.dataTransfer.getData("car");
        console.log(data);
        ev.target.appendChild(document.getElementById(data));
    }

    // Cars can be dragged
    $.each(cars, function(i, el){
        var $el = $(el);
        $el.on('dragstart', handleDragStart);
        $el.on('dragend', handleDragEnd);
    });

    // Elements to drop in (dropzones)
    var $all_cells = $('.pistes_dropable');
    $all_cells.on('dragenter', handleDragEnter);
    $all_cells.on('dragleave', handleDragLeave);
    $all_cells.on('dragover', handleDragOver);
    $all_cells.on('drop', handleDrop);
})();