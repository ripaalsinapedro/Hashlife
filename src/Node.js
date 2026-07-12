export default class Node {
    /**
     * It crates a node with a unique id set by the sub nodes it holds
     * and a level that indicates how big is the area that node
     * covers.
     * It also holds it result, that is, the result of the node when aply 
     * the CoGL rules to it cells, this way we can optimize the alogtihm to 
     * jump through time
     * 
     * @param {Number} id the unique id for the node
     * @param {Number} level the level of the node, that is, how many cells it can stored
     * @param {Node} nw the north west sub node 
     * @param {Node} ne the north east sub node 
     * @param {Node} sw the south west sub node 
     * @param {Node} se the south east sub node 
     */
    constructor(id, level, nw, ne, sw, se) {
        this.id = id;
        this.level = level;

        this.nw = nw;
        this.ne = ne;
        this.sw = sw;
        this.se = se;

        this.result = undefined;

        this.population =
            nw.population +
            ne.population +
            sw.population +
            se.population;
    }
}
