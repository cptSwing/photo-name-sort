import { ExifDate, ExifDateTime, ExifTool } from 'exiftool-vendored';

const guessBestDate = async (exifToolInst: ExifTool, fullPath: string, srcFileName: string) => {
    // NOTE Signal strips all metadata. Best we can work with is parsing the srcFilename, which stores the datetime an image was received
    let signalReceivedDate: ExifDateTime | null = null;
    if (srcFileName.startsWith('signal-')) {
        const match = srcFileName.match(/^signal-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{3})(?:-\d+)?(?:\.[^.]+)?$/i);
        if (match) {
            const [year, month, day, hour, minute, second, ms] = match.slice(1);
            signalReceivedDate = new ExifDateTime(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second), Number(ms));
        } else {
            throw new Error(`Signal srcFilename format is non-standard!: ${srcFileName}`);
        }
    }

    const tags = await exifToolInst.read(fullPath);
    const { DateTimeOriginal, CreateDate, FileModifyDate, errors } = tags;

    if (errors && errors.length > 0) {
        throw new Error(`Metadata parsing issues: ${JSON.stringify(errors)}`);
    }

    const candidates: DateCandidate[] = [];

    if (DateTimeOriginal) {
        candidates.push({
            date: toExifDateTime(DateTimeOriginal),
            source: 'DateTimeOriginal',
            accuracy: DateSourceAccuracy.DateTimeOriginal,
        });
    }
    if (CreateDate) {
        candidates.push({
            date: toExifDateTime(CreateDate),
            source: 'CreateDate',
            accuracy: DateSourceAccuracy.CreateDate,
        });
    }
    if (signalReceivedDate) {
        candidates.push({
            date: signalReceivedDate,
            source: 'DateFromSignalFilename',
            accuracy: DateSourceAccuracy.DateFromSignalFilename,
        });
    }
    if (FileModifyDate) {
        candidates.push({
            date: toExifDateTime(FileModifyDate),
            source: 'FileModifyDate',
            accuracy: DateSourceAccuracy.FileModifyDate,
        });
    }

    if (!candidates.length) throw new Error(`No date candidates available for ${srcFileName}`);
    const bestDate = candidates.reduce((best, current) => (current.accuracy > best.accuracy ? current : best));

    return {
        srcFileName,
        ...bestDate,
    } as BestGuessDate;
};

const toExifDateTime = (value: ExifDate | ExifDateTime | string | number) => {
    switch (typeof value) {
        case 'string':
            return ExifDateTime.fromISO(value) as ExifDateTime; // expects ISO string with timezone
        case 'number':
            return ExifDateTime.fromMillis(value); // expects number with ms since epoch
        default:
            break;
    }

    if (value instanceof ExifDate) {
        return ExifDateTime.fromMillis(value.toMillis());
    } else {
        return value;
    }
};

export default guessBestDate;

type DateCandidate = {
    date: ExifDateTime;
    source: keyof typeof DateSourceAccuracy;
    accuracy: number;
};

export type BestGuessDate = {
    srcFileName: string;
} & DateCandidate;

export const DateSourceAccuracy = {
    DateTimeOriginal: 5,
    CreateDate: 4,
    DateFromSignalFilename: 2,
    FileModifyDate: 1,
} as const;
