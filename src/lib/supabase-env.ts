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

export function getSupabaseUrl(): string {
  return (
    fromProcess("VITE_SUPABASE_URL") ||
    fromProcess("SUPABASE_URL") ||
    clean(import.meta.env.VITE_SUPABASE_URL) ||
    FALLBACK_URL
  );
}

export function getSupabaseAnonKey(): string {
  return (
    fromProcess("VITE_SUPABASE_ANON_KEY") ||
    fromProcess("SUPABASE_ANON_KEY") ||
    clean(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    FALLBACK_ANON_KEY
  );
}

export function requireSupabaseUrl(): string {
  const url = getSupabaseUrl();

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("protocol");
    }
  } catch {
    throw new Error(
      `VITE_SUPABASE_URL no es una URL válida ("${url}"). Usa el formato https://xxxx.supabase.co`,
    );
  }

  return url;
}
