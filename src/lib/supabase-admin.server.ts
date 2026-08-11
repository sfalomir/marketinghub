import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

function readLocalEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const text = readFileSync(path.join(process.cwd(), ".env"), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      if (trimmed.slice(0, eq).trim() === key) {
        return trimmed.slice(eq + 1).trim();
      }
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function getSupabaseAdmin(): SupabaseClient<Database> {
  const url =
    readLocalEnv("VITE_SUPABASE_URL") ??
    (import.meta.env.VITE_SUPABASE_URL as string | undefined);
  const serviceKey = readLocalEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Agrégala en .env (sin prefijo VITE_) para operaciones de servidor.",
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
