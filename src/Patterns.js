
/**
 * This function converts the content of a rle file to an array of live cells
 * 
 * @param {String} fileName the file name containing the pattern
 * @returns an array of live cells
 */
export default async function loadPatterns(fileName) {
    try {
        const answer = await fetch(`./patterns/${fileName}`);

        if (!answer.ok) {
            throw new Error("Cannot load the pattern");
        }

        const text = await answer.text();

        let cells = parseRLE(text);
        return cells;
    } catch (error) {
        console.error("Error loading the pattern:", error);
    }
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