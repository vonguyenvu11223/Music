import { createSupabaseServerClient } from "./src/lib/supabase/server";

async function checkSchema() {
  const supabase = await createSupabaseServerClient();
  
  console.log("Checking liked_songs schema...");
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'liked_songs' });
  
  if (error) {
    // If RPC doesn't exist, try a direct query to information_schema
    console.log("RPC failed, trying direct SQL query via .from().select()...");
    const { data: cols, error: colError } = await supabase
      .from('liked_songs')
      .select('*')
      .limit(1);
      
    if (colError) {
      console.error("Error fetching from liked_songs:", colError.message);
    } else {
      console.log("Columns found in liked_songs:", Object.keys(cols[0] || {}));
    }
  } else {
    console.log("Schema:", data);
  }
}

// Note: This script is just for reference, I can't run it easily without a proper environment.
