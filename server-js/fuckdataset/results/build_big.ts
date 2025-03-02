import * as fs from 'fs';
import * as path from 'path';

const folderPath = '/home/waltermin/Desktop/gamblecore/server-js/fuckdataset/results';
const filePattern = /^motley_fool_analysis_page\d+\.json$/;

const megaObject: any[] = [];

const goodPool: any[] = [];
const badPool: any[] = [];
const spicyPool: any[] = [];

// Read all files in the directory
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter files matching the pattern
  const jsonFiles = files.filter(file => filePattern.test(file));

  jsonFiles.forEach(file => {
    const filePath = path.join(folderPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonArray = JSON.parse(fileContent);

    // Merge the arrays
    megaObject.push(...jsonArray);
  });

  // Output the mega object
  const bigfuck = megaObject.map(i => i.analysis);
  console.log('Mega Object:', bigfuck);

  for (const item of bigfuck) {
    for (const stock of item) {
      if (stock.spicy) {
        spicyPool.push(stock.ticker);
        continue;
      }

      if (stock.rating === 'GOOD' || stock.rating === "VERY_GOOD") {
        goodPool.push(stock.ticker);
      } else if (stock.rating === 'BAD' || stock.rating === "VERY_BAD") {
        badPool.push(stock.ticker);
      }
    }
  }

  console.log('Good Pool:', goodPool);
  console.log('Bad Pool:', badPool);
  console.log('Spicy Pool:', spicyPool);

  // write the pools out to a pool.json file
  const pool = {
    good: goodPool,
    bad: badPool,
    spicy: spicyPool,
  };

  const poolFile = path.join(folderPath, 'pool.json');
  fs.writeFileSync(poolFile, JSON.stringify(pool, null, 2));
  console.log(`Saved pools to ${poolFile}`);
});
