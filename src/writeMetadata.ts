import { type WriteTags, type ExifDateTime, type ExifTool } from 'exiftool-vendored';
import { type BestGuessDate } from './guessBestDate.ts';

const writeMetadata = async (exifToolInst: ExifTool, fullPath: string, utcDateTime: ExifDateTime, bestDateData: BestGuessDate) => {
    const { srcFileName, source, accuracy } = bestDateData;

    let newTags: WriteTags = {
        UserComment: `Renamed & Retagged from "${srcFileName}". Guessed date accuracy ${accuracy}/5 (from ${source})`,
    };

    if (source === 'DateFromSignalFilename' || source === 'FileModifyDate') {
        newTags = {
            DateAcquired: utcDateTime,
            ...newTags,
        };
    } else {
        newTags = {
            DateTimeOriginal: utcDateTime,
            ...newTags,
        };
    }

    await exifToolInst.write(fullPath, newTags, { writeArgs: ['-overwrite_original'] });
};

export default writeMetadata;
