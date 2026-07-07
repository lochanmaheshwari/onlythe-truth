const { createClient } = require(process.cwd() + '/node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://zmnecxlcwxyiqyoobzxu.supabase.co';
// Using service role key if available, otherwise anon key is fine because we can update via admin client or client.
// Wait, we used supabaseAdmin in route.ts, let's check its key.
// In check_cache.js we used the anon key. Let's look up the service role key from env.local to bypass RLS.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbmVjeGxjd3h5aXF5b29ienh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzQzNzUsImV4cCI6MjA5ODY1MDM3NX0.7VOeQg8sIm83zejP1PQ_Bp13BLbCaMG2tlCV0Rj4bzY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data: rows, error } = await supabase
      .from('instagram_cache')
      .select('id, created_at, data');

    if (error) {
      console.error("Fetch error:", error);
      return;
    }

    console.log(`Fetched ${rows.length} rows. Updating missing uploadedAt fields...`);

    for (const row of rows) {
      const currentData = row.data || {};
      if (!currentData.uploadedAt) {
        currentData.uploadedAt = row.created_at;
        const { error: updateErr } = await supabase
          .from('instagram_cache')
          .update({ data: currentData })
          .eq('id', row.id);

        if (updateErr) {
          console.error(`Failed to update row ${row.id}:`, updateErr);
        } else {
          console.log(`Updated row ${row.id} with uploadedAt = ${row.created_at}`);
        }
      }
    }
    console.log("Done database updates!");
  } catch (err) {
    console.error("Runtime error:", err);
  }
}

run();
