import type { ExifTool } from 'exiftool-vendored';

const extractThumbnail = async (exifToolInst: ExifTool, path: string) => {
    await exifToolInst.extractThumbnail('photo.jpg', 'thumb.jpg');
};

export default extractThumbnail;
