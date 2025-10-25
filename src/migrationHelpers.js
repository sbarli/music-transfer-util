import fs from 'fs/promises';

const filterMigrationData = (songs, ignoreList) => {
  const withoutIgnores = songs.filter(song => !ignoreList.includes(song));
  const uniqueSongsCaseAgnostic = new Set();
  for (const song of withoutIgnores) {
    uniqueSongsCaseAgnostic.add(song.toLowerCase());
  }
  return [...uniqueSongsCaseAgnostic];
};

const formatMigrationData = (metadata) => {
  return metadata.map(item => `${item.fileMetadata.artist} - ${item.fileMetadata.title}`);
};

export const getMigrationData = async (metadata, ignoreListPath) => {
  const formattedData = formatMigrationData(metadata);
  let ignoreList = [];
  if (ignoreListPath) {
    const ignoreListContent = await fs.readFile(ignoreListPath, 'utf8');
    ignoreList = ignoreListContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  }
  const filteredData = filterMigrationData(formattedData, ignoreList);
  return filteredData;
};

const chunkMigrationDataForWrite = (migrationData, linesPerChunk = 80) => {
  const chunks = [];
  for (let i = 0; i < migrationData.length; i += linesPerChunk) {
    chunks.push(migrationData.slice(i, i + linesPerChunk));
  }
  return chunks;
};

export const writeMigrationData = async (migrationData, outDir) => {
  const chunkedMigrationData = chunkMigrationDataForWrite(migrationData);
  const pushedChunks = [];
  const errors = [];
  for (const chunk of chunkedMigrationData) {
    try {
      const data = chunk.join('\n');
      const outputFile = `${outDir}/migrationDataChunks/migrationData_${chunkedMigrationData.indexOf(chunk) + 1}.txt`;
      await fs.writeFile(outputFile, data, 'utf8');
      pushedChunks.push(outputFile);
    } catch (err) {
      errors.push({ file: outputFile, error: err });
    }
  }
  return [pushedChunks, errors];
};
