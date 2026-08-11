import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, requireSupabaseUrl } from "./supabase-env";

const supabaseUrl = requireSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

if (!supabaseAnonKey) {
  throw new Error("Falta VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
