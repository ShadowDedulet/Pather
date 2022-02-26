import { Lib } from "./lib.js";

var Mazes = {
    Kruskal: (x, y) => {
        return _Kruskal(x, y);
    },
    Spiral: (x, y) => {
        return _Spiral(x, y);
    },
    StarWhat: (x, y) => {
        return _StarWhat(x, y);
    },
};

var _Kruskal = (x, y) => {
    let walls = new Set();
    let sets = new Object();

    for (let i = 0; i < y; i++)
        for (let j = 0; j < x; j++) {
            let idx = i * x + j;
            if (i % 2 || j % 2) walls.add(idx);
            else sets[idx] = new Set([idx]);
        }

    let setsKeys = Object.keys(sets);
    while (setsKeys.length > 1) {
        let keyA = setsKeys[Lib.rand(setsKeys.length - 1)];
        let A = sets[keyA];

        let parent = null;
        let neighbours = [];
        for (let p of A) {
            parent = p;
            let neighboursTemp = Lib.getNeighbours(parent, x, y, 2);
            for (let n of neighboursTemp)
                if (!A.has(n)) neighbours.push(n);

            if (neighbours.length) break;
        }
        if (!neighbours.length) break;

        let neighbour = neighbours[Lib.rand(neighbours.length - 1)];
        let keyB = setsKeys.find((key) => sets[key].has(neighbour));
        let B = sets[keyB];
        for (let b of B) sets[keyA].add(b);

        walls.delete(neighbour - (neighbour - parent) / 2);
        const index = setsKeys.indexOf(keyB);
        if (index > -1) setsKeys.splice(index, 1);
    }

    return walls;
};

var _Spiral = (x, y) => {
    let walls = new Set();
    let modes = [
        [-1, 3],
        [-1, 2],
        [x * y, 1],
        [x * y, 0],
    ];
    let modeKey = Lib.rand(modes.length - 1);
    let startMode = modes[modeKey];

    let current = startMode[0];
    let direction = startMode[1];

    let sideLenX = x - 1 + ((modeKey + 1) % 2);
    let sideLenY = y - 1 + (modeKey % 2);
    while (
        (direction % 2 && sideLenX > 1) ||
        (!(direction % 2) && sideLenY > 1)
    ) {
        let sideLen = direction % 2 ? sideLenX : sideLenY;
        for (let j = 0; j < sideLen; j++) {
            let neighbour = Lib.getNeighbour(current, direction, x, y, 1);
            current = neighbour[0];
            walls.add(current);
        }

        if (direction % 2) sideLenX -= 2;
        else sideLenY -= 2;

        direction = (direction + 3) % 4;
    }

    return walls;
};

var _StarWhat = (x, y) => {
    let walls = new Set();
    let current = x * (y - 1);
    let dir = -1;

    for (let i = 0; i < Math.max(x, y) - 1; i++) {
        walls.add(current);
        if (current < 2 * x && dir == -1)
            dir = 1;
        if (current > x * (y - 2) && dir == 1)
            dir = -1;

        current += dir * (x + dir);
    }

    return walls;
}

export { Mazes };