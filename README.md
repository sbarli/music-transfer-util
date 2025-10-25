# music-transfer

## To Setup

### Install Deps

`yarn install`

### Dir/File Creation

Create the following dirs/files:

- Optional ignore list file (ex. `input/ignoreList.txt`)
- Required output directory (ex. `output`)
- Required `migrationDataChunks` directory inside output directory (ex. `output/migrationDataChunks`)

### Configure .env

- Duplicate `.env.example` and rename `.env`
- Update values with the real data

## To Run

```
yarn node src/readMusicLibrary.js
```
