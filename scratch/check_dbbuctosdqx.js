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

async function check() {
  const { data, error } = await supabase
    .from('instagram_cache')
    .select('id, url, created_at, data');

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Total cached rows:", data.length);
  for (const row of data) {
    console.log("ID:", row.id, "URL:", row.url);
    if (row.url.includes('DbBuctosdQX') || JSON.stringify(row.data).includes('DbBuctosdQX') || JSON.stringify(row.data).includes('Manipur')) {
      console.log("MATCH FOUND row ID:", row.id);
      console.log("Headline:", row.data?.headline);
      console.log("Topic:", row.data?.pipeline?.extraction?.topic);
    }
  }
}

check();
