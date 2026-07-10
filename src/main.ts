import { readdir, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ExifDateTime, ExifTool } from 'exiftool-vendored';
import guessBestDate from './guessBestDate.ts';
import writeMetadata from './writeMetadata.ts';

const [srcDir, dstDir] = process.argv.slice(2);

const exifTool = new ExifTool();

try {
    // const photoDates = [];

    const files = await readdir(srcDir);
    for (const srcFileName of files) {
        const srcFullPath = join(srcDir, srcFileName);
        const bestDateData = await guessBestDate(exifTool, srcFullPath, srcFileName);

        const { dstFileName, utcDateTime } = utcDateToName(srcFileName, bestDateData.date);
        const dstFullPath = join(dstDir, dstFileName);

        await copyFile(srcFullPath, dstFullPath);
        await writeMetadata(exifTool, dstFullPath, utcDateTime, bestDateData);

        // photoDates.push(utcDateTime);
    }

    // await writeFile(`${dstDir}/photoDates.json`, JSON.stringify(photoDates, null, '\t'));
} catch (err) {
    console.error('Error caught!', err);
} finally {
    await exifTool.end();
}

function utcDateToName(srcFileName: string, date: ExifDateTime) {
    let exifDateTimeUTC = date;

    if (date.zone !== 'UTC') {
        const adjusted = date.setZone('UTC');
        if (!adjusted) throw new Error(`utcDateToName() failed on date.setZone('UTC')!`);
        exifDateTimeUTC = adjusted;
    }

    const year = exifDateTimeUTC.year;
    const month = exifDateTimeUTC.month.toString().padStart(2, '0');
    const day = exifDateTimeUTC.day.toString().padStart(2, '0');
    const hour = exifDateTimeUTC.hour.toString().padStart(2, '0');
    const minute = exifDateTimeUTC.minute.toString().padStart(2, '0');
    const second = exifDateTimeUTC.second.toString().padStart(2, '0');
    const fileAssociation = srcFileName.split('.').pop()?.toLowerCase() ?? 'jpg';

    const dstFileName = `${year}_${month}_${day}-${hour}_${minute}_${second}_UTC.${fileAssociation}`;
    return { dstFileName, utcDateTime: exifDateTimeUTC };
}
