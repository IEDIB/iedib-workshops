
const iran = function (a, b) {
    return Math.round(Math.random() * (b - a)) + a
};

const range = function (a, b) {
    const aList = [];
    for (var i = a; i <= b; i++) {
        aList.push(i);
    }
    return aList;
};

const listClone = function (aList) {
    const clonedList = [];
    for (var i = 0, len = aList.length; i < len; i++) {
        clonedList[i] = aList[i];
    }
    return clonedList;
};

const sort = function (aList, subListLen) {
    const firstElems = aList.splice(0, subListLen);
    firstElems.sort(function (a, b) { return a - b; });
    return firstElems;
};

const shuffle = function (aList) {
    //The Fisher-Yates algorithm
    const cloned = listClone(aList);
    for (let i = cloned.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = cloned[i];
        cloned[i] = cloned[j];
        cloned[j] = temp;
    }
    return cloned;
};

function Bolla(id, valor) {
    this.id = id;
    this.latex = ""+valor;
    this.speech = {"ca-ES": "El "+valor, "es-ES": "El "+valor};
}

module.exports = {
    iran,
    range,
    shuffle,
    sort,
    listClone,
    Bolla
}