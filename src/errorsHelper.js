import fs from "fs/promises";

export const writeErrorsToFile = async (errors, outputFile) => {
  try {
    const data = JSON.stringify(errors, null, 2);
    await fs.writeFile(outputFile, data, 'utf8');
    console.log(`Errors written to ${outputFile}`);
  } catch (err) {
    console.log("Error when executing writeErrorsToFile", err);
  }
}
