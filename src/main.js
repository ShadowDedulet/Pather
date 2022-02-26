import {
    Types,
    Colors,
    Points,
    Logos,
    ClassColors,
    AnimSpeeds,
} from "./lib.js";
import { Lib } from "./lib.js";
import { Algs } from "./algs.js";
import { Mazes } from "./mazes.js";

// var [x, y] = [5, 3];
// var [start, end] = [90, 110];
var [x, y] = [null, null];
var [start, end] = [null, null];

var [xPerc, yPerc] = [0.9, 0.75];
var cellSize = 25;
var drawCellId = !true;

var walls = new Set();

var current = {
    animatedMazes: !false,
    animationSpeed: "fast",
    drawing: false,
    PointType: "wall",
    Algorithm: null,
    optimized: false,
    mousedown: 0,
};

var hexToRgb = (str) => {
    let rgb = [
        parseInt(str.slice(1, 3), 16),
        parseInt(str.slice(3, 5), 16),
        parseInt(str.slice(5, 7), 16),
    ];
    return rgb;
};

var rgbToHex = (rgb) => {
    let str = "#";
    for (let c of rgb) str += Math.floor(c).toString(16);
    return str;
};

var toggleOptimization = (e) => {
    current.optimized = !current.optimized;
    let tar = e.target;
    let val = tar.style.textDecoration;
    tar.style.textDecoration = val == "none" ? "line-through" : "none";
};

var startCellAnimation = (cell) => {
    return new Promise((resolve) => {
        if (current.animationSpeed == "instant") return resolve(true);

        let speed = AnimSpeeds[current.animationSpeed] + 1;

        let minScale = 0.1;
        let maxScale = 1.0;
        let delta = 0.03 / speed;
        let scale = minScale;
        cell.style.transform = "scale(" + scale + ")";

        let className = cell.className.substring(5);
        let bckgC = ClassColors[cell.className.substring(5)];
        let endC = hexToRgb(bckgC);
        let minC = Math.min(...endC);
        let startC = [
            endC[0] - minC, //
            endC[1] - minC,
            endC[2] - minC,
        ];
        if (className == "path") startC = [1, 250, 1];
        let deltaC = [
            (endC[0] - startC[0]) / (30 * speed),
            (endC[1] - startC[1]) / (30 * speed),
            (endC[2] - startC[2]) / (30 * speed),
        ];
        let color = startC;
        cell.style.backgroundColor = rgbToHex(color);

        let timer = setInterval(animateCell, 1);
        let iter = 0;
        let resolved = false;

        function animateCell() {
            if (scale >= maxScale) {
                cell.style.transform = "scale(" + maxScale.toString() + ")";
                cell.style.backgroundColor = rgbToHex(endC);
                clearInterval(timer);
            } else {
                iter++;
                if (iter > AnimSpeeds[current.animationSpeed] && !resolved) {
                    resolve(true);
                    resolved = true;
                }
                scale += delta;
                cell.style.transform = "scale(" + scale.toString() + ")";
            }

            if (color[0] < endC[0]) {
                for (let i in color) color[i] += deltaC[i];
                cell.style.backgroundColor = rgbToHex(color);
            }
        }
    });
};

var changeCellType = async(cell, type, id = null, anim = true) => {
    if (id !== null) cell = document.getElementById(id);

    let oldClass = cell.className.substring(5);
    if (oldClass == "wall") walls.delete(parseInt(cell.id));

    cell.className = "cell " + type;

    let size = cellSize;
    if (["empty", "start", "end"].includes(type)) {
        cell.style.border;
        size -= 2;
    }
    cell.style.padding = size / 2 + "px";
    cell.style.backgroundColor = ClassColors[type];
    if (anim) return startCellAnimation(cell).then((ret) => true);
};

var changeArrayOfCells = async(cells, type, anim = true) => {
    if (current.drawing) return;
    current.drawing = true;
    for (let cell of cells) {
        let ret = await changeCellType(null, type, cell, anim).then((ret) => true);
    }
    current.drawing = false;
};

var Visualize = async() => {
    if (start === null || end === null) return alert("Set start and end nodes");
    if (current.Algorithm == null) return alert("Pick an algorithm");
    if (current.drawing) return

    clearPath();
    let [path, visited] = current.Algorithm(
        parseInt(x),
        parseInt(y),
        parseInt(start),
        parseInt(end),
        walls,
        current.optimized
    );
    if (path == null) alert("Couldn't find path");
    else {
        let ret = await changeArrayOfCells(visited, "visited");
        ret = await changeArrayOfCells(path, "path");
    }
};

var createCell = (type, id) => {
    let cell = document.createElement("div");
    cell.className = "cell " + type;
    cell.id = id;
    let size = cellSize;
    if (["empty", "start", "end"].includes(type)) size -= 2;
    cell.style.padding = size / 2 + "px";
    cell.style.zIndex = 2;
    if (drawCellId) cell.textContent = id;
    return cell;
};

var clearTable = () => {
    for (let i = 0; i < x * y; i++) {
        // walls = new Set();
        changeCellType(null, "empty", i, false);
    }
    start = null;
    end = null;
};

var clearPath = () => {
    clearAllOfType("path");
    clearAllOfType("visited");
};

var clearAllOfType = (type) => {
    for (let i = 0; i < x * y; i++) {
        let cell = document.getElementById(i);
        if (cell.className.substring(5) != type) continue;

        if (cell.className.substring(5) == "wall") walls.delete(i);
        changeCellType(cell, "empty", null, false);
    }
};

var getFromModule = (name, module) => {
    for (let f in module)
        if (f == name) return f;
};

var navClickHandler = (e) => {
    let foo = null;
    let classArr = e.target.className.split(" ");
    let name = labelToJs(e.target.textContent)
    switch (classArr[0]) {
        case "maze":
            foo = getFromModule(name, Mazes);
            if (!foo || current.drawing) return;

            clearTable();
            walls = Mazes[foo](x, y);
            if (walls.size)
                changeArrayOfCells(walls, "wall", current.animatedMazes, true);
            break;

        case "alg":
            foo = getFromModule(name, Algs);
            if (!foo || current.drawing) return;

            current.Algorithm = Algs[foo];
            break;

        case "speed":
            foo = getFromModule(name, AnimSpeeds);
            if (!foo) break;
            current.animationSpeed = foo;
            break;

        case "logo":
            current.PointType = classArr[1];
            break;
    }

    let elements = document.getElementsByClassName(classArr[0]);
    for (let element of elements)
        element.className = element.className.replace("current", "");
    e.target.className += " current";
};

var cellClickHandler = (e) => {
    let newType = current.PointType;
    let oldType = e.target.className.substring(5);
    let id = parseInt(e.target.id);
    switch (newType) {
        case "wall":
            switch (oldType) {
                case "wall":
                    newType = "empty";
                    walls.delete(id);
                    break;
                case "start":
                    start = null;
                    walls.add(id);
                    break;
                case "end":
                    end = null;
                    walls.add(id);
                    break;
                default:
                    walls.add(id);
            }
            break;

        case "start":
            if (start != null) changeCellType(null, "empty", start, true);
            start = id;

            switch (oldType) {
                case "wall":
                    walls.delete(id);
                    break;
                case "end":
                    end = null;
            }
            break;

        case "end":
            if (end != null) changeCellType(null, "empty", end, true);
            end = id;

            switch (oldType) {
                case "wall":
                    walls.delete(id);
                    break;
                case "start":
                    start = null;
            }
            break;
    }
    changeCellType(null, newType, id, true);
};

document.body.onmousedown = function() {
    current.mousedown = true;
};
document.body.onmouseup = function() {
    current.mousedown = false;
};

var cellOverHandler = (e) => {
    if (current.mousedown) {
        cellClickHandler(e);
    }
};

var labelToHtml = (label) => {
    label = label.replace("_", " ");
    label = label.replace("start", "temp");
    label = label.replace("star", "*");
    label = label.replace("temp", "start");
    return label
}

var labelToJs = (label) => {
    label = label.replace(" ", " ");
    label = label.replace("start", "temp");
    label = label.replace("*", "star");
    label = label.replace("temp", "start");
    return label
}

var hideHelp = () => {
    let help = document.getElementById("help");

    let opacity = 1.0;
    let timer = setInterval(animateFadeOut, 1);

    function animateFadeOut() {
        if (opacity < 0) {
            help.style.display = "none";
            help.style.opacity = 0;
            clearInterval(timer);
        } else {
            opacity -= 0.03;
            help.style.opacity = opacity;
        }
    }
}

var setup = () => {
    let blocks = {
        mazes: Object.keys(Mazes),
        types: Object.keys(Types),
        colors: Object.keys(Colors),
        points: Object.keys(Points),
        logos: Object.keys(Logos),
        speeds: Object.keys(AnimSpeeds),
        algs: Object.keys(Algs),
    };

    for (let [block, labels] of Object.entries(blocks)) {
        let navBlock = document.getElementById(block);
        for (let label of labels) {
            let navLabel = document.createElement("div");
            navLabel.className = block.slice(0, -1);

            if (!["colors", "logos"].includes(block))
                navLabel.textContent = labelToHtml(label);
            else navLabel.className = navLabel.className + " " + label;

            if (["logos", "algs", "mazes", "speeds"].includes(block)) {
                navLabel.style.cursor = "pointer";
                navLabel.onclick = navClickHandler;
            }
            navBlock.appendChild(navLabel);
        }
    }

    let content = document.getElementById("cont");
    let tableContainer = document.getElementById("tabCon");
    if (!x || !y) {
        x = Math.floor((content.clientWidth * xPerc) / cellSize);
        y = Math.floor((content.clientHeight * yPerc) / cellSize);
        x = !(x % 2) ? x - 1 : x;
        y = !(y % 2) ? y - 1 : y;
    }
    let table = document.createElement("div");
    tableContainer.style.width = x * cellSize + "px";
    tableContainer.style.height = y * cellSize + "px";
    table.id = "table";
    table.style.width = x * cellSize + "px";
    table.style.height = y * cellSize + "px";
    tableContainer.appendChild(table);

    if (start == null) start = Math.floor((x * y) / 2 - x / 4);
    if (end == null) end = Math.floor((x * y) / 2 + x / 4);
    for (let i = 0; i < y; i++) {
        let row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < x; j++) {
            let type = "empty";
            let id = i * x + j;
            if (id == start) type = "start";
            if (id == end) type = "end";
            let cell = createCell(type, id);
            cell.onclick = cellClickHandler;
            cell.onmouseover = cellOverHandler;
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    document.getElementById("clsTab").onclick = clearTable;
    document.getElementById("visual").onclick = Visualize;
    document.getElementById("clsPat").onclick = clearPath;
    document.getElementById("optim").onclick = toggleOptimization;
    document.getElementById("but").onclick = hideHelp;

};

setup();