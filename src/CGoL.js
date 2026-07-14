import Quadtree from "./Quadtree.js";

export default class CGoL {
    #quadtree;

    /**
     * The GoL class is the main class to simulate the game of life.
     * It can be of any size, and can be pased a data array, that
     * contains the information of how to fill the grid at the 
     * start of the algorithm
     * 
     * @param {Number} size the size of the simulation
     * @param {Array} data the array data
     */
    constructor(size, data = undefined) {
        this.#quadtree = new Quadtree();

        if (data == undefined) {
            this.#InitialzeFromRandomArray();
        } else {
            (data[0].length == undefined) ?
                this.#quadtree.InitalizeFromCoordsArray(data, size) :
                this.#quadtree.InitalizeFromProcessPattern(data)
        }
    }

    /**
     * Creates a random array with the coordinates
     * of each alive cell
     * 
     * @param {Number} size the size of the canvas
     * @returns a coords array
     */
    #InitialzeFromRandomArray(size) {
        let coordsArray = new Array();

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (Math.random() > .5) {
                    coordsArray.push({ x: i, y: j });
                }
            }
        }

        return coordsArray;
    }

    /**
     * It gets a json file with the quadtree data, and then
     * crate a url to download the file
     * 
     * @param {String} fileName the name of the download file
     */
    savePattern(fileName = "pattern") {
        let saveFile = this.#quadtree.save();
        const blob = new Blob([saveFile], { type: "application/json" });

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    /**
     * It gets the root of the quadtree, that is the 
     * biggest node that holds all the cells. 
     * Then it creates a new node of level k + 1 wiht a 
     * empty border, and then calculate the succecor and 
     * replace the root.
     * The new node is neccesary so the universe dont
     * shrink
     */
    update() {
        let node = this.#quadtree.root;

        let borderNode = this.#getBorderNode(node);

        let succecor = this.#getNodeSuccesor(borderNode);
        this.#quadtree.root = succecor;

        return succecor;
    }

    /**
     * It crates an empty border for a node
     * 
     * @param {Node} node a node of level k
     * @returns a new node of level k + 1
     */
    #getBorderNode(node) {
        let deadNode = this.#quadtree.getDeadNode(node.level - 1);

        let nw = this.#quadtree.createNewNode(deadNode, deadNode, deadNode, node.nw);
        let ne = this.#quadtree.createNewNode(deadNode, deadNode, node.ne, deadNode);
        let sw = this.#quadtree.createNewNode(deadNode, node.sw, deadNode, deadNode);
        let se = this.#quadtree.createNewNode(node.se, deadNode, deadNode, deadNode);

        return this.#quadtree.createNewNode(nw, ne, sw, se);
    }

    /**
     * This divide the node into 9 sub nodes, then it 
     * gets the node succesor, or it center, region those
     * centers into four nodes, and again, calculate it result,
     * or center, so when we join all four centers we have compute
     * the result of our original node center
     * 
     * @param {Node} node the node at level k 
     * @returns the result of the center of the node in a k - 1 level node
     */
    #getNodeSuccesor(node) {
        if (node.result != undefined) return node.result;
        if (node.level == 2) return this.#computeLevel2Node(node);

        // 1. get the node sub quads

        let nw = node.nw;
        let ne = node.ne;
        let sw = node.sw;
        let se = node.se;

        // 2. create 9 sub quads

        // top row
        let n11 = nw;
        let n12 = this.#quadtree.createNewNode(nw.ne, ne.nw, nw.se, ne.sw);
        let n13 = ne;

        // center row
        let n21 = this.#quadtree.createNewNode(nw.sw, nw.se, sw.nw, sw.ne);
        let n22 = this.#quadtree.createNewNode(nw.se, ne.sw, sw.ne, se.nw);
        let n23 = this.#quadtree.createNewNode(ne.sw, ne.se, se.nw, se.ne);

        // middel row
        let n31 = sw;
        let n32 = this.#quadtree.createNewNode(sw.ne, se.nw, sw.se, se.sw);
        let n33 = se;

        // 3. get sub quads sueccesors

        let s11 = this.#getNodeSuccesor(n11);
        let s12 = this.#getNodeSuccesor(n12);
        let s13 = this.#getNodeSuccesor(n13);

        let s21 = this.#getNodeSuccesor(n21);
        let s22 = this.#getNodeSuccesor(n22);
        let s23 = this.#getNodeSuccesor(n23);

        let s31 = this.#getNodeSuccesor(n31);
        let s32 = this.#getNodeSuccesor(n32);
        let s33 = this.#getNodeSuccesor(n33);

        // 4. regoin the sub quads

        let b1 = this.#quadtree.createNewNode(s11, s12, s21, s22);
        let b2 = this.#quadtree.createNewNode(s12, s13, s22, s23);
        let b3 = this.#quadtree.createNewNode(s21, s22, s31, s32);
        let b4 = this.#quadtree.createNewNode(s22, s23, s32, s33);

        // 5. get region nodes succesors

        let result = this.#quadtree.createNewNode(
            this.#getNodeSuccesor(b1),
            this.#getNodeSuccesor(b2),
            this.#getNodeSuccesor(b3),
            this.#getNodeSuccesor(b4)
        );

        // 6. store the result in the node

        node.result = result;
        return result;
    }

    /**
     * This is the base case for the get succescor method.
     * The base case is a node of level k = 2, or a 4x4 area
     * node, wich then calculate de center cells using the 
     * CGoL rules
     * 
     * @param {Node} node the k = 2 level node of 4x4
     * @returns a new k = 1 level node with the updated cells of the 2x2 grid
     */
    #computeLevel2Node(node) {
        const nw = node.nw;
        const ne = node.ne;
        const sw = node.sw;
        const se = node.se;

        let populationMatrix = [
            [nw.nw.population, nw.ne.population, ne.nw.population, ne.ne.population],
            [nw.sw.population, nw.se.population, ne.sw.population, ne.se.population],
            [sw.nw.population, sw.ne.population, se.nw.population, se.ne.population],
            [sw.sw.population, sw.se.population, se.sw.population, se.se.population]
        ];

        const alive = this.#quadtree.alive;
        const dead = this.#quadtree.dead;

        let nextState = (x, y) => {
            let neis = 0;

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i == 0 && j == 0) continue;
                    neis += populationMatrix[y + i][x + j];
                }
            }

            if (populationMatrix[y][x]) return (neis == 2 || neis == 3) ? alive : dead;
            return (neis == 3) ? alive : dead;
        }

        let resNw = nextState(1, 1);
        let resNe = nextState(2, 1);
        let resSw = nextState(1, 2);
        let resSe = nextState(2, 2);

        return this.#quadtree.createNewNode(resNw, resNe, resSw, resSe);
    }

    get liveCells() {
        return this.#quadtree.expand(0, 0);
    }
}