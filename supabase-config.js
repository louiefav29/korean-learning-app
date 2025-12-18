const { createClient } = supabase;

const supabaseUrl = "__SUPABASE_URL__";
const supabaseKey = "__SUPABASE_ANON_KEY__";

window.supabase = createClient(supabaseUrl, supabaseKey);
window.supabaseClient = window.supabase; // For backward compatibility
