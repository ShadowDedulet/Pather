var Types = {
    empty: "#FEF9EF",
    wall: "#9F5F80",
    path: "#FEE440",
    visited: "#A2D2FF",
};
var Colors = Types;

var Points = {
    wall: "#9F5F80",
    start: "#FEF9EF",
    end: "#FEF9EF",
};
var Logos = Points;

var ClassColors = Object.assign({}, Types, Points);

var AnimSpeeds = {
    slow: 10,
    average: 3,
    fast: 0,
    instant: 0,
};

var Lib = {
    rand: (len) => {
        return _rand(len);
    },
    getNeighbours: (idx, x, y, k) => {
        return _getNeighbours(idx, x, y, k);
    },
    getNeighbour: (idx, dir, x, y, k) => {
        return _getNeighbour(idx, dir, x, y, k);
    },
    shuffle: (arr) => {
        return _shuffle(arr);
    },
    getColors: () => Colors,
};

var _rand = (len) => {
    return Math.round(Math.random() * len);
};

function _shuffle(array) {
    let arr = Array.from(array);
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

var _getNeighbour = (idx, dir, x, y, k) => {
    let res = [idx - k * x, idx - k, idx + k * x, idx + k];
    let checks = [idx >= k * x, idx % x >= k, idx < x * (y - 1), idx % x < x - k];
    let ret = [null, true];

    if (dir < 0 || dir > 3) return ret;

    ret[0] = res[dir];
    if (checks[dir] && ret[0] >= 0 && ret[0] < x * y) ret[1] = false;

    return ret;
};

var _getNeighbours = (idx, x, y, k) => {
    let neighbours = [];

    for (let i = 0; i < 4; i++) {
        let neighbour = _getNeighbour(idx, i, x, y, k);
        if (!neighbour[1]) neighbours.push(neighbour[0]);
    }

    return neighbours;
};

export { Types, Colors, Points, Logos, ClassColors, AnimSpeeds, Lib };