// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const FALLBACK_URL = "https://lydgkhcyiimgrdcoibsa.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_Ijixh2lDJzwX0VtPlan-Mw_GEBNGKQN";

function cleanEnv(value: string | undefined): string {
  const trimmed = (value ?? "").trim().replace(/^["']|["']$/g, "");
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return "";
  return trimmed;
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
  vite: {
    plugins: [
      {
        name: "supabase-env-fallback",
        config(_, { mode }) {
          const env = loadEnv(mode, process.cwd(), "");
          const url =
            cleanEnv(process.env.VITE_SUPABASE_URL) ||
            cleanEnv(env.VITE_SUPABASE_URL) ||
            FALLBACK_URL;
          const anonKey =
            cleanEnv(process.env.VITE_SUPABASE_ANON_KEY) ||
            cleanEnv(env.VITE_SUPABASE_ANON_KEY) ||
            FALLBACK_ANON_KEY;
          process.env.VITE_SUPABASE_URL = url;
          process.env.VITE_SUPABASE_ANON_KEY = anonKey;
        },
      },
    ],
  },
});
