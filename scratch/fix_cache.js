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

async function fix() {
  // Find all rows where url or data mentions DbBuctosdQX or Manipur protest title for DbBuctosdQX
  const { data: rows, error } = await supabase
    .from('instagram_cache')
    .select('id, url, data');

  if (error) {
    console.error("Error fetching rows:", error);
    return;
  }

  for (const row of rows) {
    if (row.url.includes('DbBuctosdQX') || JSON.stringify(row.data).includes('DbBuctosdQX')) {
      console.log("Deleting bad cached row:", row.id, row.url);
      const { error: delErr } = await supabase
        .from('instagram_cache')
        .delete()
        .eq('id', row.id);

      if (delErr) {
        console.error("Delete error:", delErr);
      } else {
        console.log("Successfully deleted cache entry for DbBuctosdQX");
      }
    }
  }
}

fix();
