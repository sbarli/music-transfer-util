import 'dotenv/config'
import { writeErrorsToFile } from "./errorsHelper.js";
import { getFilepathsFromDir, writeFilepathsToFile } from "./filepathsHelpers.js";
import { getFilesMetadata, writeMetadataToFile } from "./metadataHelpers.js";
import { getMigrationData, writeMigrationData } from "./migrationHelpers.js";

console.log('Environment Variables:', {
  libSrc: process.env.libSrc || process.env.LIB_SRC,
  outDir: process.env.outDir || process.env.OUT_DIR,
  ignoreListPath: process.env.ignoreListPath || process.env.IGNORE_LIST_PATH
});

const readMusicLibraryMetadata = async (libSrc, outDir, ignoreListPath) => {
  const [allSongFiles, songFileErrors] = await getFilepathsFromDir(libSrc);
  console.log(allSongFiles.length + ' files found in music library');
  if (songFileErrors.length > 0) {
    console.log(`${songFileErrors.length} errors encountered while reading filepaths`);
    await writeErrorsToFile(songFileErrors, `${outDir}/songFilepathErrors.txt`);
  }
  if (allSongFiles.length > 0) {
    await writeFilepathsToFile(allSongFiles, `${outDir}/allSongFilepaths.txt`);
    const [allSongMetadata, metadataErrors] = await getFilesMetadata(allSongFiles);
    console.log(allSongMetadata.length + ' files read from music library');
    if (metadataErrors.length > 0) {
      console.log(`${metadataErrors.length} errors encountered while reading metadata`);
      await writeErrorsToFile(metadataErrors, `${outDir}/metadataErrors.txt`);
    }
    if (allSongMetadata.length > 0) {
      await writeMetadataToFile(allSongMetadata, `${outDir}/allSongMetadata.json`);
      const migrationData = await getMigrationData(allSongMetadata, ignoreListPath);
      console.log(migrationData.length + ' migration data entries generated');
      const [pushedChunks, migrationErrors] = await writeMigrationData(migrationData, outDir);
      if (migrationErrors.length > 0) {
        console.log(`${migrationErrors.length} errors encountered while writing migration data`);
        await writeErrorsToFile(migrationErrors, `${outDir}/migrationDataErrors.txt`);
      }
      console.log(pushedChunks.length + ' migration data files written to output directory');
    }
  }
};

// Support both lowercase and uppercase env var names
const libSrc = process.env.libSrc || process.env.LIB_SRC;
const outDir = process.env.outDir || process.env.OUT_DIR;
const ignoreListPath = process.env.ignoreListPath || process.env.IGNORE_LIST_PATH;

if (!libSrc || !outDir) {
  console.error('Missing required environment variables. Please set LIB_SRC, OUT_DIR (or libSrc, outDir).');
  process.exitCode = 1;
} else {
  console.log('Starting to read music library from:', libSrc);
  // Run and surface any errors
  readMusicLibraryMetadata(libSrc, outDir, ignoreListPath).catch(err => {
    console.error('Error reading music library metadata:', err);
    process.exitCode = 2;
  });
}
