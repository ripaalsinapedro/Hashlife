import Node from "./Node.js"

export default class Quadtree {
    #nodeCache;
    #idCount;
    #root;

    #deadCache;

    /**
     * The quadtree is the data structure used by the algotithm
     * to store the value of the grid.
     * It crates a node cache, for storing all the alredy crated nodes,
     * and a dead cache, for storing all the dead spaces of the grid.
     * It also stores the dead and alive cells, wich are the leaves of
     * the quadtree, meaning the lowest posible representation of the grid.
     */
    constructor() {
        this.#nodeCache = new Map();
        this.#deadCache = new Map();

        this.#idCount = 0;

        this.dead = {
            id: this.#idCount++,
            level: 0,
            population: 0
        };
        this.alive = {
            id: this.#idCount++,
            level: 0,
            population: 1
        };

        this.#root = this.dead;
    }

    /**
     * Initialize the quadtree from an array of random alive cells
     * 
     * @param {Array} coordArray the random cells array
     * @param {Number} size the size of the array
     */
    InitalizeFromCoordsArray(coordArray, size) {
        let k = this.#getBoundindgBox(size);
        this.#root = this.#createNode(coordArray, k, 0, 0);
    }

    /**
     * It creats a new node from of level k, and if neccesary, 
     * the four sub nodes, and split the cells for each sub node
     * 
     * @param {Array} cells an array of live cells contain in a specific area
     * @param {*} k the level of the node
     * @param {*} x the x coordinate of the region
     * @param {*} y the y coordinate of the regoin
     */
    #createNode(cells, k, x, y) {
        if (!cells.length) return this.getDeadNode(k);

        if (k == 0) {
            return (cells.length) ? this.alive : this.dead;
        }

        k = k - 1;
        let mid = Math.pow(2, k);

        let quadX = x + mid;
        let quadY = y + mid;

        let nwCells = cells.filter((c) => c.x < quadX && c.y < quadY);
        let neCells = cells.filter((c) => c.x >= quadX && c.y < quadY);
        let swCells = cells.filter((c) => c.x < quadX && c.y >= quadY);
        let seCells = cells.filter((c) => c.x >= quadX && c.y >= quadY);

        let nw = this.#createNode(nwCells, k, x, y);
        let ne = this.#createNode(neCells, k, x + mid, y);
        let sw = this.#createNode(swCells, k, x, y + mid);
        let se = this.#createNode(seCells, k, x + mid, y + mid);

        let newNode = this.createNewNode(nw, ne, sw, se);
        if (k + 1 > this.#root.level) this.#root = newNode;
        return newNode;
    }

    /**
     * When providate with a cells array size, it calculates
     * level of the root node, that can hold all the cells.
     * This is because a node of level k, can store a square area
     * of size k^2 * k^2
     * 
     * @param {Number} size the size of the array
     */
    #getBoundindgBox(size) {
        let side = Math.sqrt(size);
        let k = Math.ceil(Math.log2(side));
        return Math.max(k, 4);
    }

    /**
     * This get four nodes, and creat a new node, 
     * if a node with those exact sub nodes hasnt been
     * created yet, and stored in the nodes cache
     * 
     * @param {Node} nw the north west node
     * @param {Node} ne the noth east node
     * @param {Node} sw the south west node
     * @param {Node} se the south east node
     */
    createNewNode(nw, ne, sw, se) {
        const key = `${nw.id}.${ne.id}.${sw.id}.${se.id}`;

        let newNode = this.#nodeCache.get(key);

        if (newNode != undefined) {
            return newNode;
        }

        newNode = new Node(this.#idCount++, nw.level + 1, nw, ne, sw, se);

        this.#nodeCache.set(key, newNode);
        return newNode;
    }

    /**
     * This function is the key to fill the empty space of the grid,
     * because it crates a node of level k with
     * only dead cells. It also store the dead node on the 
     * dead node cache
     * 
     * @param {Number} k the level of the node
     */
    getDeadNode(k) {
        if (k == 0) return this.dead;
        if (this.#deadCache.has(k)) {
            return this.#deadCache.get(k);
        }

        let deadChild = this.getDeadNode(k - 1);
        let deadNode = this.createNewNode(deadChild, deadChild, deadChild, deadChild);

        this.#deadCache.get(k, deadNode);
        return deadNode;
    }

    /**
     * This function goes throw the quadtree searching for all the live cells,
     * and storing the coordinates of each live cell in the live cells
     * array, so then the data stored in the quadtree can be
     * visualazed
     * 
     * @param {Number} x the x coordinate of the node
     * @param {Number} y the y coordinate of the node
     * @param {Node} node
     * @param {Array} liveCells a array of live cells
     */
    expand(x, y, node = this.#root, liveCells = []) {
        if (node.population == 0) return liveCells;

        if (node.level == 0) {
            liveCells.push({
                x: x,
                y: y
            });

            return liveCells;
        }

        let offSet = Math.pow(2, node.level - 1);

        this.expand(x, y, node.nw, liveCells);
        this.expand(x + offSet, y, node.ne, liveCells);
        this.expand(x, y + offSet, node.sw, liveCells);
        this.expand(x + offSet, y + offSet, node.se, liveCells);

        return liveCells;
    }

    get root() {
        return this.#root;
    }

    set root(root) {
        this.#root = root;
    }
}