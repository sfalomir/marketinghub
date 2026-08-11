const FALLBACK_URL = "https://lydgkhcyiimgrdcoibsa.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_Ijixh2lDJzwX0VtPlan-Mw_GEBNGKQN";

function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return "";
  return trimmed;
}

function fromProcess(key: string): string {
  try {
    return clean(globalThis.process?.env?.[key]);
  } catch {
    return "";
  }
}

function asHttpUrl(value: string): string {
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return value;
  } catch {
    /* ignore invalid values from host env */
  }
  return "";
}

function asAnonKey(value: string): string {
  if (value.startsWith("sb_publishable_") || value.startsWith("eyJ")) return value;
  return "";
}

export function getSupabaseUrl(): string {
  return (
    asHttpUrl(fromProcess("VITE_SUPABASE_URL")) ||
    asHttpUrl(fromProcess("SUPABASE_URL")) ||
    asHttpUrl(clean(import.meta.env.VITE_SUPABASE_URL)) ||
    FALLBACK_URL
  );
}

export function getSupabaseAnonKey(): string {
  return (
    asAnonKey(fromProcess("VITE_SUPABASE_ANON_KEY")) ||
    asAnonKey(fromProcess("SUPABASE_ANON_KEY")) ||
    asAnonKey(clean(import.meta.env.VITE_SUPABASE_ANON_KEY)) ||
    FALLBACK_ANON_KEY
  );
}

export function requireSupabaseUrl(): string {
  return getSupabaseUrl();
}
