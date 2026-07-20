const { createClient } = require(process.cwd() + '/node_modules/@supabase/supabase-js');
const fs = require('fs');

let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbmVjeGxjd3h5aXF5b29ienh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzQzNzUsImV4cCI6MjA5ODY1MDM3NX0.7VOeQg8sIm83zejP1PQ_Bp13BLbCaMG2tlCV0Rj4bzY';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const serviceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
  if (serviceKeyMatch && serviceKeyMatch[1]) {
    supabaseKey = serviceKeyMatch[1].trim();
  }
} catch (e) {}

const supabaseUrl = 'https://zmnecxlcwxyiqyoobzxu.supabase.co';
const supabase = createClient(supabaseUrl, supabaseKey);

const targetMediaId = 'DbA9_ufslZ3';

async function deleteReelCache() {
  const { data: rows, error } = await supabase
    .from('instagram_cache')
    .select('id, url, data');

  if (error) {
    console.error("Error fetching rows:", error);
    return;
  }

  let deletedCount = 0;
  for (const row of rows) {
    const dataStr = JSON.stringify(row.data || {});
    if (row.url.includes(targetMediaId) || dataStr.includes(targetMediaId)) {
      console.log(`Deleting cached entry ID: ${row.id} | URL: ${row.url} | Headline: ${row.data?.headline}`);
      const { error: delErr } = await supabase
        .from('instagram_cache')
        .delete()
        .eq('id', row.id);

      if (delErr) {
        console.error(`Failed to delete row ${row.id}:`, delErr);
      } else {
        deletedCount++;
        console.log(`Successfully deleted row ${row.id}`);
      }
    }
  }

  if (deletedCount === 0) {
    console.log(`No cached entry found for ${targetMediaId}. Clean state ready for search!`);
  } else {
    console.log(`Successfully deleted ${deletedCount} cache entries for ${targetMediaId}.`);
  }
}

deleteReelCache();
