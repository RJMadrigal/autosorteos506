import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://dummy.supabase.co";

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "dummy-key";

if (!supabaseUrl || supabaseUrl === "https://dummy.supabase.co") {
  console.error("[Supabase] VITE_SUPABASE_URL is missing!");
} else {
  console.log("[Supabase] URL loaded:", supabaseUrl.slice(0, 30) + "...");
}

if (!supabaseKey || supabaseKey === "dummy-key") {
  console.error("[Supabase] Service key is missing!");
} else {
  console.log("[Supabase] Key loaded: ok");
}

// ws como transport garantiza compatibilidad tanto en Node 20 (local) como Node 22 (Vercel)
export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

