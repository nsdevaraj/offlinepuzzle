const fs = require('fs');
const readline = require('readline');
const zlib = require('zlib');

async function extract() {
  const fileStream = fs.createReadStream('repo_data/combined_puzzle_db_first_100.ndjson');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const puzzles = [];
  for await (const line of rl) {
    if (line.includes('mateIn1') || line.includes('mateIn2') || line.includes('mateIn3')) {
      try {
        const data = JSON.parse(line);
        puzzles.push(data);
      } catch (e) {}
    }
  }

  fs.writeFileSync('src/puzzles.json', JSON.stringify(puzzles, null, 2));
  console.log(`Extracted ${puzzles.length} puzzles.`);
}

extract();