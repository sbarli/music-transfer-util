import fs from "fs/promises";

export const isMusicFilepath = (filepath) => {
  const musicExtensions = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma'];
  const lowerFilepath = filepath.toLowerCase();
  return musicExtensions.some(ext => lowerFilepath.endsWith(ext));
};

export const getFilepathsFromDir = async (dir, files= [], errors = []) => {
  try {
    const founds = await fs.readdir(dir);
    for (const found of founds) {
      const filePath = `${dir}/${found}`;
      const foundIsDirectory = (await fs.stat(filePath)).isDirectory();
      if (foundIsDirectory) {
        await getFilepathsFromDir(filePath, files, errors);
      } else if (isMusicFilepath(filePath)) {
        files.push(filePath);
      }
    }
  } catch (err) {
    console.log("Error when executing getFilepathsFromDir", err);
    errors.push({ dir, error: err.message });
  } finally {
    return [files, errors];
  }
};

export const writeFilepathsToFile = async (filepaths, outputFile) => {
  try {
    const data = filepaths.join('\n');
    await fs.writeFile(outputFile, data, 'utf8');
    console.log(`Filepaths written to ${outputFile}`);
  } catch (err) {
    console.log("Error when executing writeFilepathsToFile", err);
  }
}
