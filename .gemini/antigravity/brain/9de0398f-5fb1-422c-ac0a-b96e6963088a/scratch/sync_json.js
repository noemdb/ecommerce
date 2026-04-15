const fs = require('fs');
const path = require('path');

const syncFile = (src, dest) => {
  try {
    const data = JSON.parse(fs.readFileSync(src, 'utf8'));
    fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Synced ${src} to ${dest}`);
  } catch (err) {
    console.error(`Error syncing ${src}:`, err.message);
    process.exit(1);
  }
};

const baseDir = '/home/nuser/code/ecommerce';
syncFile(path.join(baseDir, 'prisma/json/others/products.json'), path.join(baseDir, 'prisma/customSeed/reposteria/products.json'));
syncFile(path.join(baseDir, 'prisma/json/others/product_images.json'), path.join(baseDir, 'prisma/customSeed/reposteria/product_images.json'));
