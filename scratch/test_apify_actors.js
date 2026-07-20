const fs = require('fs');

let APIFY_TOKEN = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/APIFY_TOKEN=(.*)/);
  if (match && match[1]) APIFY_TOKEN = match[1].trim();
} catch (e) {}

const testUrl = 'https://www.instagram.com/reel/DbA9_ufslZ3/';

async function testActor2Details() {
  console.log("\n--- Testing Actor 2 Full Output ---");
  const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
  const res = await fetch(apifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      directUrls: [testUrl],
      resultsType: "details",
      resultsLimit: 1
    })
  });

  const data = await res.json();
  const item = Array.isArray(data) ? data[0] : data;
  console.log("Item keys:", Object.keys(item));
  console.log("videoUrl:", item.videoUrl);
  console.log("audioUrl:", item.audioUrl);
  console.log("displayUrl:", item.displayUrl);
  console.log("ownerUsername:", item.ownerUsername);
  console.log("caption:", item.caption);
}

testActor2Details();
