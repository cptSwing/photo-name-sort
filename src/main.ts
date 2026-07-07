import { exiftool } from 'exiftool-vendored';
import readMetadata from './readMetadata.ts';

const path = 'tests';

// Read metadata
await readMetadata(exiftool, path);

await exiftool.end();
