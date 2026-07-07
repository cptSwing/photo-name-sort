import type { ExifDate, ExifDateTime, ExifTool } from 'exiftool-vendored';

const guessBestDate = async (exifToolInst: ExifTool, fullPath: string, fileName: string) => {
    // NOTE Signal strips all metadata. Best we can work with is parsing the filename, which stores the datetime an image was received
    let signalReceivedDate: Date | undefined;
    if (fileName.startsWith('signal-')) {
        const match = fileName.match(/^signal-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{3})(?:-\d+)?(?:\.[^.]+)?$/i);
        if (match) {
            const [year, month, day, hour, minute, second, ms] = match.slice(1);

            signalReceivedDate = new Date(
                // I *think* signal filenames are UTC, so need to counter Date() assuming my local time:
                Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), Number(ms))
            );
        } else {
            throw new Error(`Signal filename format is non-standard!: ${fileName}`);
        }
    }

    const { DateTimeOriginal, CreateDate, FileModifyDate, errors } = await exifToolInst.read(fullPath);
    if (errors && errors.length > 0) {
        throw new Error(`Metadata parsing issues: ${JSON.stringify(errors)}`);
    }

    const candidates: DateCandidate[] = [];

    if (DateTimeOriginal) {
        candidates.push({
            date: toDate(DateTimeOriginal),
            source: 'DateTimeOriginal (Composite)',
            confidence: 100,
        });
    }
    if (CreateDate) {
        candidates.push({
            date: toDate(CreateDate),
            source: 'CreateDate (Composite)',
            confidence: 90,
        });
    }
    if (signalReceivedDate) {
        candidates.push({
            date: signalReceivedDate,
            source: 'Signal filename parsed (date when image was received)',
            confidence: 50,
        });
    }
    if (FileModifyDate) {
        candidates.push({
            date: toDate(FileModifyDate),
            source: 'FileModifyDate',
            confidence: 30,
        });
    }

    if (!candidates.length) throw new Error(`No date candidates available for ${fileName}`);
    const bestDate = candidates.reduce((best, current) => (current.confidence > best.confidence ? current : best));

    return {
        fileName,
        ...bestDate,
    } as BestGuessDate;
};

const toDate = (value: ExifDate | ExifDateTime | string | number) => {
    if (typeof value === 'string' || typeof value === 'number') return new Date(value); // expects ISO string with timezone, or number with ms since epoch
    return value.toDate();
};

type BestGuessDate = {
    fileName: string;
} & DateCandidate;

type DateCandidate = {
    date: Date;
    source: string;
    confidence: number;
};

export default guessBestDate;
