import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, requireSupabaseUrl } from "./supabase-env";

const supabaseUrl = requireSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

if (!supabaseAnonKey) {
  throw new Error(
    "Falta VITE_SUPABASE_ANON_KEY. En Render agrégala en Environment (sin comillas) y vuelve a hacer Deploy.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
