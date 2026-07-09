import type { ExifTool } from 'exiftool-vendored';

const writeDateToMetadata = async (exifToolInst: ExifTool, path: string) => {
    await exifToolInst.write('photo.jpg', {
        XPComment: 'Amazing sunset!',
        Copyright: '© 2024 Your Name',
    });
};

export default writeDateToMetadata;
