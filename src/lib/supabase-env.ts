const PROJECT_REF = "lydgkhcyiimgrdcoibsa";
const FALLBACK_URL = `https://${PROJECT_REF}.supabase.co`;
const FALLBACK_ANON_KEY = "sb_publishable_Ijixh2lDJzwX0VtPlan-Mw_GEBNGKQN";
const FALLBACK_ANON_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZGdraGN5aWltZ3JkY29pYnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTY1ODcsImV4cCI6MjEwMjAzMjU4N30.cDZIpRK8RAxCYzQc_arfolalVhgKtnj0YtGqR6JoE58";

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

function jwtPayload(token: string): { role?: string; ref?: string } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as { role?: string; ref?: string };
  } catch {
    return null;
  }
}

function asHttpUrl(value: string): string {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    if (!parsed.hostname.includes(`${PROJECT_REF}.supabase.co`)) return "";
    return value;
  } catch {
    return "";
  }
}

function asAnonKey(value: string): string {
  if (value === FALLBACK_ANON_KEY || value === FALLBACK_ANON_JWT) return value;
  if (value.startsWith("sb_publishable_") && value.length > 40) return value;
  if (value.startsWith("eyJ")) {
    const payload = jwtPayload(value);
    if (payload?.role === "anon" && payload.ref === PROJECT_REF) return value;
  }
  return "";
}

export function asServiceRoleKey(value: string | undefined): string | undefined {
  const key = clean(value);
  if (!key) return undefined;
  if (key.startsWith("sb_secret_") && key.length > 40) return key;
  if (key.startsWith("eyJ")) {
    const payload = jwtPayload(key);
    if (payload?.role === "service_role" && payload.ref === PROJECT_REF) return key;
  }
  return undefined;
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
