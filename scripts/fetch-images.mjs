// /scripts/fetch-images.mjs
import fs from "fs";

async function wikimediaImage(query) {
  const url = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    format: "json",
  });
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "OnlyTheTruthMediaBiasTracker/1.0 (contact@onlythetruth.in)"
      }
    });
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    for (const p of Object.values(pages)) {
      const info = p.imageinfo?.[0];
      if (!info || !info.url) continue;
      
      // Since we specify gsrnamespace: 6, it's a file. Verify it's an image by extension
      const isImg = /\.(jpe?g|png|webp|svg)$/i.test(info.url);
      if (!isImg) continue;

      const meta = info.extmetadata ?? {};
      return {
        imageUrl: info.url,
        imageCredit: `${strip(meta.Artist?.value) || "Unknown"} / Wikimedia Commons (${meta.LicenseShortName?.value || "see source"})`,
      };
    }
  } catch (error) {
    console.error(`Error fetching image for query "${query}":`, error);
  }
  return null;
}
const strip = s => s ? s.replace(/<[^>]*>/g, "").trim() : "";

async function run(file) {
  if (!fs.existsSync(file)) {
    console.error(`File does not exist: ${file}`);
    return;
  }
  const articles = JSON.parse(fs.readFileSync(file, "utf-8"));
  console.log(`Scanning articles in ${file}...`);
  for (const a of articles) {
    if (a.imageUrl) {
      console.log(`Skipping image fetch for "${a.headline}" (already has imageUrl: ${a.imageUrl})`);
      continue;
    }
    const query = a.searchQuery || a.headline;
    console.log(`Fetching image for "${a.headline}" with query: "${query}"`);
    let img = await wikimediaImage(query);
    
    // If search failed and we have a specific query, try to fall back to a simpler part of it
    if (!img && a.searchQuery) {
      const simplerQuery = a.searchQuery.split(" ").slice(0, 2).join(" ");
      if (simplerQuery && simplerQuery !== a.searchQuery) {
        console.log(`Retrying with simpler query: "${simplerQuery}"`);
        img = await wikimediaImage(simplerQuery);
      }
    }

    if (img) {
      Object.assign(a, img);
      console.log(`Successfully assigned image: ${img.imageUrl}`);
    } else {
      console.warn(`No image found for: "${a.headline}"`);
    }
  }
  fs.writeFileSync(file, JSON.stringify(articles, null, 2));
  console.log(`Finished processing ${file}`);
}

run("./data/top-stories.json");
