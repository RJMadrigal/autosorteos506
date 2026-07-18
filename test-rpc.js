import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://zgbmmpdtavyiytjwekim.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYm1tcGR0YXZ5aXl0andla2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjE4MTQsImV4cCI6MjA5OTczNzgxNH0.stDSyfKvpybTWQVfp_CsK-_wijOGbMrGpLUZueo11r8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing reserve_tickets RPC...");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase.rpc("reserve_tickets", {
    p_numbers: ["0001", "0002"],
    p_session_id: "test-session",
    p_expires_at: expiresAt
  });
  
  console.log("RPC Data:", data);
  if (error) {
    console.error("RPC Error:", error);
  }
}

test();
