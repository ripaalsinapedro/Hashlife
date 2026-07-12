import CGoL from "./CGoL.js";
import cargarPatronLocal from "./Patterns.js"

let g, size;

function main() {
    size = 1000000;
    initializeCGoL();
}

async function initializeCGoL() {
    let coordsArray = await cargarPatronLocal("test_gun.rle");
    g = new CGoL(size, coordsArray);
    loop();
}

function loop() {
    draw();
    g.update();

    requestAnimationFrame(loop);
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let cellSize = canvas.width / Math.sqrt(size);
    let liveCells = g.liveCells;

    ctx.fillStyle = "black";
    liveCells.forEach(cell => {
        ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    });
}

main();