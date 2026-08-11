import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { asServiceRoleKey, requireSupabaseUrl } from "./supabase-env";
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
        return trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function getServiceRoleKey(): string | undefined {
  return asServiceRoleKey(readLocalEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  const serviceKey = getServiceRoleKey();
  if (!serviceKey) return null;

  return createClient<Database>(requireSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
