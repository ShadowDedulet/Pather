import { Lib } from "./lib.js";

var Algs = {
    Astar: (x, y, start, end, walls, optimize) => {
        if (optimize)
            return _AstarOpt(x, y, start, end, walls);
        return _Astar(x, y, start, end, walls);
    },
    // Djikstra: () => {},
};

var _Astar = (x, y, start, end, walls) => {
    let queue = [start];
    let visited = [];
    let cameFrom = {};
    cameFrom.start = null;

    let current = null;
    while (queue.length) {
        current = queue.shift();
        if (current == end) break;
        if (current != start) visited.push(current);

        let neighbours = Lib.getNeighbours(current, x, y, 1);
        for (let neighbour of neighbours) {
            if (walls.has(neighbour) || neighbour in cameFrom) continue;
            queue.push(neighbour);
            cameFrom[neighbour] = current;
        }
    }

    current = end;
    let path = [];
    while (current != start) {
        if (!(current in cameFrom)) return [null, null];
        current = cameFrom[current];
        path.push(current);
    }
    path.pop();
    path.reverse();
    return [path, visited];
};


var _getEvristicValue = (current, end, x, y) => {
        return Math.abs((current % x) - (end % x)) + Math.abs(Math.floor(current / x) - Math.floor(end / x));
    } // 3 + (0.25)

var _AstarOpt = (x, y, start, end, walls) => {
    let queue = {};
    let visited = [];
    let cameFrom = {};
    let g = {};
    let f = {};
    cameFrom.start = null;
    g[start] = 0;
    f[start] = g[start] + _getEvristicValue(start, end, x, y);
    queue[start] = f[start];

    let current = start;
    let keys = Object.keys(queue);
    let i = 0;
    while (keys.length) {
        if (keys.includes((end).toString()))
            break;

        let minF = Math.min(...Object.values(queue));
        let minKeys = Object.keys(queue)
            .filter(function(key) { return queue[key] == minF })
            .map(Number)

        if (start > end)
            current = minKeys[0];
        else
            current = minKeys[minKeys.length - 1];

        // current = Object.keys(queue).reduce((key, v) => queue[v] < queue[key] ? v : key);

        visited.push(parseInt(current));
        delete queue[current];

        let neighbours = Lib.getNeighbours(parseInt(current), x, y, 1);
        for (let n of neighbours) {
            let score = g[current] + _getEvristicValue(current, n, x, y);

            if (visited.includes(n))
                if (n in g && score >= g[n])
                    continue;

            if (!(n in cameFrom))
                cameFrom[n] = current;
            else if (f[cameFrom[n]] > f[current])
                cameFrom[n] = current;

            g[n] = score;
            f[n] = g[n] + _getEvristicValue(n, end, x, y);

            if (!(n in queue) && !(walls.has(n)))
                queue[n] = parseInt(f[n]);
        }

        keys = Object.keys(queue);
        i++;
    }

    current = end;
    let path = [];
    while (current != start) {
        if (!(current in cameFrom)) return [null, null];
        current = cameFrom[current];
        path.push(current);
    }
    path.pop();
    path.reverse();
    visited.shift();
    return [path, visited];
};


export { Algs };