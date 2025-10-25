import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { parseStream } from 'music-metadata';
import { inspect } from 'node:util';

const formatMetadata = (metadata) => ({
  album: metadata?.common?.album,
  artist: metadata?.common?.artist,
  title: metadata?.common?.title,
});

export const getFilesMetadata = async (filepaths) => {
  const metadata = [];
  const errors = [];
  for (const filepath of filepaths) {
    try {
      // Create a readable stream from a file
      const audioStream = createReadStream(filepath);

    // Parse the metadata from the stream
    const parsedMetadata = await parseStream(audioStream, { mimeType: 'audio/mpeg'});
    const formattedMetadata = formatMetadata(parsedMetadata);
    if (!!formattedMetadata.title && !!formattedMetadata.artist) {
      metadata.push({ filepath, fileMetadata: formattedMetadata });
    }
    } catch (err) {
      errors.push({ filepath, error: err.message });
    }
  }
  return [metadata, errors];
}

export const writeMetadataToFile = async (metadata, outputFile) => {
  try {
    const data = JSON.stringify(metadata, null, 2);
    await fs.writeFile(outputFile, data, 'utf8');
    console.log(`Metadata written to ${outputFile}`);
  } catch (err) {
    console.log("Error when executing writeMetadataToFile", err);
  }
}
