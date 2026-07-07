import type { ExifTool } from 'exiftool-vendored';

const readMetadata = async (exifToolInst: ExifTool, path: string) => {
    const tags = await exifToolInst.read(`${path}/IMG_3415.jpg`);
    console.log('%c[readMetadata]', 'color: #f78c28', `tags :`, tags);

    // console.log(`Camera: ${tags.Make} ${tags.Model}`);
    // console.log(`Taken: ${tags.DateTimeOriginal}`);
    // console.log(`Size: ${tags.ImageWidth}x${tags.ImageHeight}`);
};

export default readMetadata;
