import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://zgbmmpdtavyiytjwekim.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYm1tcGR0YXZ5aXl0andla2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjE4MTQsImV4cCI6MjA5OTczNzgxNH0.stDSyfKvpybTWQVfp_CsK-_wijOGbMrGpLUZueo11r8";
const s = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
async function run() {
  const { data: tickets } = await s.from('tickets').select('*');
  console.log("Tickets:", tickets);
  const { data: orders } = await s.from('orders').select('order_id, numbers, status');
  console.log("Orders:", orders);
}
run();
