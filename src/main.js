import CGoL from "./CGoL.js";

let g, size;

function main() {
    size = 300000;

    let glider = [
        { x: 1, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 }
    ];

    let lwss = [
        { x: 1, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 1 },
        { x: 0, y: 2 }, { x: 4, y: 2 }, { x: 0, y: 3 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
    ];

    let acorn = [
        { x: 1, y: 0 },
        { x: 3, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 6, y: 2 }
    ];


    let gosperGliderGun = [
        { x: 1, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 5 }, { x: 2, y: 6 },
        { x: 11, y: 5 }, { x: 11, y: 6 }, { x: 11, y: 7 }, { x: 12, y: 4 },
        { x: 12, y: 8 }, { x: 13, y: 3 }, { x: 13, y: 9 }, { x: 14, y: 3 },
        { x: 14, y: 9 }, { x: 15, y: 6 }, { x: 16, y: 4 }, { x: 16, y: 8 },
        { x: 17, y: 5 }, { x: 17, y: 6 }, { x: 17, y: 7 }, { x: 18, y: 6 },
        { x: 21, y: 3 }, { x: 21, y: 4 }, { x: 21, y: 5 }, { x: 22, y: 3 },
        { x: 22, y: 4 }, { x: 22, y: 5 }, { x: 23, y: 2 }, { x: 23, y: 6 },
        { x: 25, y: 1 }, { x: 25, y: 2 }, { x: 25, y: 6 }, { x: 25, y: 7 },
        { x: 35, y: 3 }, { x: 35, y: 4 }, { x: 36, y: 3 }, { x: 36, y: 4 }
    ];


    let coordsArray = gosperGliderGun;
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

function parseRLE(rleContent) {
    const liveCells = [];
    let x = 0, y = 0;
    let runCount = "";

    // 1. Eliminar líneas de comentarios (#) y la cabecera (x = ..., y = ...)
    const lines = rleContent.split('\n');
    const dataString = lines
        .filter(line => !line.startsWith('#') && !line.startsWith('x'))
        .join('')
        .replace(/\s+/g, ''); // Quitar espacios y saltos de línea intermedios

    // 2. Procesar los caracteres uno por uno
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString[i];

        if (/\d/.test(char)) {
            runCount += char; // Acumular dígitos del número
        } else {
            const count = runCount === "" ? 1 : parseInt(runCount);
            runCount = ""; // Resetear el contador

            if (char === 'o') { // Celda viva
                for (let j = 0; j < count; j++) {
                    liveCells.push({ x: x + j, y: y });
                }
                x += count;
            } else if (char === 'b') { // Celda muerta
                x += count;
            } else if (char === '$') { // Salto de línea
                y += count;
                x = 0;
            } else if (char === '!') { // Fin del patrón
                break;
            }
        }
    }
    return liveCells;
}

async function cargarPatronLocal(nombreArchivo) {
    try {
        // 1. Petición al archivo (debe estar en la misma carpeta o subcarpeta)
        const respuesta = await fetch(`./patterns/${nombreArchivo}`);

        if (!respuesta.ok) {
            throw new Error("No se pudo encontrar el archivo del patrón");
        }

        // 2. Obtener el contenido como texto plano
        const texto = await respuesta.text();

        // 3. Detectar formato y procesar (usando tus funciones anteriores)
        let celdas;
        if (nombreArchivo.endsWith('.lif') || nombreArchivo.endsWith('.life')) {
            celdas = parseLife106(texto);
        } else if (nombreArchivo.endsWith('.rle')) {
            celdas = parseRLE(texto);
        }

        g = new CGoL(size, celdas);
        loop();
    } catch (error) {
        console.error("Error al cargar el patrón:", error);
    }
}

main();