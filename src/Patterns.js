
/**
 * Load and process a stored pattern
 * 
 * @param {String} fileName the file name containing the pattern
 */
export default async function loadPatterns(fileName = "default.json") {
    try {

        const answer = (fileName.endsWith("rle")) ?
            await fetch(`./patterns/${fileName}`) :
            await fetch(`./processPatterns/${fileName}`)

        if (!answer.ok) {
            throw new Error("Cannot load the pattern");
        }

        return (fileName.endsWith("rle")) ? processRleFile(answer) : processJsonFile(answer)
    } catch (error) {
        console.error("Error loading the pattern:", error);
    }
}

/**
 * 
 * @param {Object} file a rle file
 * @returns an array of live cells
 */
async function processRleFile(file) {
    let text = await file.text();
    let patternCells = parseRLE(text);
    return patternCells;
}

/**
 * 
 * @param {Object} file a json file
 * @returns an array wiht the quadtree data of a pattern
 */
async function processJsonFile(file) {
    let patternArray = await file.json();
    return patternArray;
}

function parseRLE(rleContent) {
    const liveCells = [];
    let x = 0, y = 0;
    let runCount = "";

    const lines = rleContent.split('\n');
    const dataString = lines
        .filter(line => !line.startsWith('#') && !line.startsWith('x'))
        .join('')
        .replace(/\s+/g, '');

    for (let i = 0; i < dataString.length; i++) {
        const char = dataString[i];

        if (/\d/.test(char)) {
            runCount += char;
        } else {
            const count = runCount === "" ? 1 : parseInt(runCount);
            runCount = "";

            if (char === 'o') {
                for (let j = 0; j < count; j++) {
                    liveCells.push({ x: x + j, y: y });
                }
                x += count;
            } else if (char === 'b') {
                x += count;
            } else if (char === '$') {
                y += count;
                x = 0;
            } else if (char === '!') {
                break;
            }
        }
    }
    return liveCells;
}