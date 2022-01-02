# iedib-workshops

Equip de millora de l'IEDIB curs 2021-22
Repositori de components JS per al taller en obert d'àlgebra.
Autor: Josep Mulet Pol

# Descripció dels components dissenyats

# Confetti

Superposa una animació de Confetti sobre el contenidor pare seleccionat

Per crear una instància s'ha d'instanciar la classe 
new Confetti(marcContenidor)

Les instàncies tenen la següent interfície:

- `play()` Produeix l'activació de l'animació
- `dispose()` Elimina les estructures de dades

Exemple codePen: [https://codepen.io/jmulet/pen/BadrpqJ](https://codepen.io/jmulet/pen/BadrpqJ)

# iapace

Registra i infereix, a partir de la base de coneixement, el nivell de dificultat d'una categoria en particular

### Instruccions d'ús:

Per defecte ja es crea una instància que es troba en `window.IB.iapace`. La idea és que cada instància representi un curs diferent que empri aquesta tecnologia.

Es poden crear més instàncies fent `var iapace = IAPace.load('nom_curs', nivell_defecte);`. Els mètodes que s'hi poden aplicar són

- `save()` Persisteixen els canvis en localStorage
- `drop(path)` Elimina tots els continguts de la ruta
- `find(path)` Retorna els continguts de la ruta. Retorna null si no existeix
- `create(path)` Crea una ruta amb el nom path
- `findCreate(path)` La retorna i la crea si no existeix
- `addScore(path, score)` Afegeix una puntuació de 0--10 a la ruta path
- `inference(path)` Infereix el nivell de 0--4 que té l'alumne en aquesta ruta
- `saveInitialEval(id, obj)` Desa la informació de l'avaluació inicial donada per l'objecte obj
- `loadInitialEval(id)` Retorna l'objecte de l'avaluació inicial amb identificador id o null si no existeix

Per facilitat es pot registrar un listener al sistema perquè avisi quan es produeix un canvi de nivell en un path

`addChangeListener(function(path, oldLevel, newLevel){ ... })`

o simplement cridar manualment al mètode `inference(path)` que retornarà el nivell del path.

Els camps de l'objecte d'una ruta són
  
- `n` total de notes en aquesta categoria
- `s` suma de totes les notes (permet calcular la mitjana)
- `s2` suma del quadrat de les notes (permet calcular desviació típica)
- `h` vector que conté els 4 puntuacions més recents

Els camps de l'objecte avaluació inicial són

- ` `
- ` `


Les rutes són cadenes de categories separades per punts, per exemple, 'algebra.monomis.graus' o 'dinamica.mrua'.
 
Exemple codePen: [https://codepen.io/jmulet/pen/XWeEozV](https://codepen.io/jmulet/pen/XWeEozV)



# overlay

Superposa un missatge sobre postit sobre un contenidor pare seleccionat

Es pot crear instància des de la classe

`var instancia = new Overlay(contenidor);`

on contenidor pot ésser un Element o la id del div en què s'ha de mostrar el postit. Els mètodes són

- `modal(valor)` valor: true/false si es vol mostrar un fons modal
- `msg(text)` text: contigunt que ha de tenir el postit

Exemple codePen: [https://codepen.io/jmulet/pen/qBXoXqR](https://codepen.io/jmulet/pen/qBXoXqR)



# sections

Organitza les seccions de la pàgina en parts col·lapsables.

L'element pare ha d'ésser un `ul` amb l'atribut `role="sections"`
Dins cada `li` hi ha d'haver un `h3` amb l'atribut `data-target` que conté la query al selector que s'ha de mostrar.

Exemple codePen: [https://codepen.io/jmulet/pen/KKXoBYd](https://codepen.io/jmulet/pen/KKXoBYd)

- `toggle(id)` expands or collapses the section of all sections if id is null
- `severity(type, id)` if id is null, the severity is applied to all sections
- `bind()` 
- `unbind()` 


# tiles 

Organitza les seccions de la pàgina en un format tipus rajoles.

L'element pare ha d'ésser un `ul` amb l'atribut `role="tiles"`
Dins cada `li` hi ha d'haver un `h3` amb l'atribut `data-target` que conté la query al selector que s'ha de mostrar.

Exemple codePen: [https://codepen.io/jmulet/pen/xxXWJzd](https://codepen.io/jmulet/pen/xxXWJzd)

- `toggle(id)` expands or collapses the section
- `severity(type, id)` if id is null, the severity is applied to all sections
- `bind()` 
- `unbind()` 


# smatquizz

Component que agafa informació d'un qüestionari H5P i l'empra per determinar quines seccions de la pàgina s'han de recomanar.

Requereix que els mòduls 'iapace' i 'tiles' estiguin carregats en la pàgina.

 
# vnotify

Component que simula notificacions tipus growl del macOS

Exemple codePen: [https://codepen.io/jmulet/pen/NWaYLvN](https://codepen.io/jmulet/pen/NWaYLvN)

