import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zgbmmpdtavyiytjwekim.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYm1tcGR0YXZ5aXl0andla2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE2MTgxNCwiZXhwIjoyMDk5NzM3ODE0fQ.l2dEnilya0sDQ986MSQg_XXQHueidsuFJTHTFE57ibI";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Checking current orders...");
  const { data: orders } = await supabase.from('orders').select('*').limit(1);
  if (!orders || orders.length === 0) {
    console.log("No orders found");
    return;
  }
  
  const order = orders[0];
  console.log("Found order:", order.order_id, "with numbers:", order.numbers);
  
  const { data: tickets } = await supabase.from('tickets').select('*').eq('order_id', order.order_id);
  console.log("Current tickets for order:", tickets);
  
  const newNumbers = [...order.numbers, "9999"];
  console.log("Calling RPC with new numbers:", newNumbers);
  
  const { data: updated, error } = await supabase.rpc("update_order_tickets", {
    p_order_id: order.order_id,
    p_new_numbers: newNumbers,
    p_new_total: order.total + 4000
  });
  
  console.log("RPC result:", { updated, error });
  
  const { data: newTickets } = await supabase.from('tickets').select('*').eq('order_id', order.order_id);
  console.log("New tickets for order:", newTickets);
  
  // Revert
  await supabase.rpc("update_order_tickets", {
    p_order_id: order.order_id,
    p_new_numbers: order.numbers,
    p_new_total: order.total
  });
  console.log("Reverted");
}

run();
