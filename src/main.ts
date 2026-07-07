import { readdir, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ExifTool } from 'exiftool-vendored';
import guessBestDate from './guessBestDate.ts';

const readDir = 'tests';
const writeDir = 'results';

const exiftool = new ExifTool({
    // geolocation: true,
    // keepUTCTime: false,
});

try {
    // const photoDates = [];

    const files = await readdir(readDir);
    for (const fileName of files) {
        const srcFullPath = join(readDir, fileName);
        const bestDate = await guessBestDate(exiftool, srcFullPath, fileName);

        const newFileName = dateToStringName(bestDate.date, fileName);
        const dstFullPath = join(writeDir, newFileName);
        await copyFile(srcFullPath, dstFullPath);
        // photoDates.push(bestDate);
    }

    // await writeFile('results/photoDates.json', JSON.stringify(photoDates, null, '\t'));
} catch (err) {
    console.error('Error caught!', err);
} finally {
    await exiftool.end();
}

function dateToStringName(date: Date, oldFileName: string) {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}.${oldFileName.split('.').pop()}`;
}
