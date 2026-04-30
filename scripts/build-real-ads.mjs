import fetch from "node-fetch";
import fs from "fs";
import { execSync } from "child_process";

const OUTPUT = "public/videos";

function run(cmd) {
  console.log(cmd);
  execSync(cmd, { stdio: "inherit" });
}

async function getProducts() {
  const res = await fetch(process.env.GOOGLE_SHEET_CSV_URL);
  const text = await res.text();
  const rows = text.split("\n").slice(1);

  return rows.map(r => {
    const cols = r.split(",");
    return {
      id: cols[0],
      name: cols[1],
      image: cols[2]
    };
  });
}

async function getStockImage(query) {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
    headers: { Authorization: process.env.PEXELS_API_KEY }
  });
  const data = await res.json();
  return data.photos?.[0]?.src?.large;
}

async function buildAd(product) {
  const problemImg = await getStockImage("dead grass lawn");
  const resultImg = await getStockImage("green healthy lawn");

  // download images
  run(`curl -L "${problemImg}" -o problem.jpg`);
  run(`curl -L "${resultImg}" -o result.jpg`);
  run(`curl -L "${product.image}" -o product.jpg`);

  // HOOK
  run(`
    ffmpeg -y -f lavfi -i color=c=black:s=1080x1920:d=2 \
    -vf "drawtext=text='YOUR SOIL IS PROBABLY DEAD':fontcolor=white:fontsize=70:x=(w-text_w)/2:y=(h-text_h)/2" \
    ${OUTPUT}/s1.mp4
  `);

  // PROBLEM
  run(`
    ffmpeg -y -loop 1 -i problem.jpg -t 4 \
    -vf "scale=1080:1920,zoompan=z='min(zoom+0.002,1.2)':d=125" \
    ${OUTPUT}/s2.mp4
  `);

  // PRODUCT
  run(`
    ffmpeg -y -loop 1 -i product.jpg -t 6 \
    -vf "scale=1080:1920" \
    ${OUTPUT}/s3.mp4
  `);

  // RESULT
  run(`
    ffmpeg -y -loop 1 -i result.jpg -t 6 \
    -vf "scale=1080:1920" \
    ${OUTPUT}/s4.mp4
  `);

  // CTA
  run(`
    ffmpeg -y -f lavfi -i color=c=white:s=1080x1920:d=4 \
    -vf "drawtext=text='NaturesWaySoil.com':fontcolor=black:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2" \
    ${OUTPUT}/s5.mp4
  `);

  // COMBINE
  fs.writeFileSync("list.txt",
`file 's1.mp4'
file 's2.mp4'
file 's3.mp4'
file 's4.mp4'
file 's5.mp4'`);

  run(`
    ffmpeg -y -f concat -safe 0 -i list.txt -c copy ${OUTPUT}/${product.id}_REAL.mp4
  `);

  console.log("✅ Built", product.id);
}

(async () => {
  const products = await getProducts();
  await buildAd(products[0]); // test 1 product first
})();
