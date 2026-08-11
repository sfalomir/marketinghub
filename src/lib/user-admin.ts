import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/supabase-types";

const roleEnum = z.enum(["Administrador", "Marketing", "Colaborador"]);
const statusEnum = z.enum(["Activo", "Inactivo", "Suspendido"]);

const userWriteSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
  last_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
  email: z.string().trim().email("Email inválido").max(255, "Máximo 255 caracteres"),
  phone: z.string().trim().max(20, "Máximo 20 caracteres").optional().default(""),
  company: z.string().trim().max(100, "Máximo 100 caracteres").optional().default(""),
  job_title: z.string().trim().max(100, "Máximo 100 caracteres").optional().default(""),
  role: roleEnum,
  status: statusEnum,
  avatar_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
      message: "Debe ser una URL válida o estar vacío",
    })
    .optional()
    .default(""),
});

export const listUsersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

export const createUserAdminFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    userWriteSchema.extend({ password: z.string().min(8, "Mínimo 8 caracteres").max(100) }).parse(data),
  )
  .handler(async ({ data }): Promise<{ ok: true; user: User } | { ok: false; error: string }> => {
    const { createUser } = await import("@/lib/supabase-auth");
    try {
      const user = (await createUser(data)) as User;
      return { ok: true, user };
    } catch (err) {
      if (err instanceof Error && err.message === "EMAIL_TAKEN") {
        return { ok: false, error: "Ya existe un usuario con ese correo." };
      }
      return { ok: false, error: err instanceof Error ? err.message : "Error al crear usuario" };
    }
  });

export const updateUserFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => userWriteSchema.extend({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<{ ok: true; user: User } | { ok: false; error: string }> => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    if (!admin) return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." };
    const { id, ...fields } = data;

    const { data: updated, error } = await admin
      .from("users")
      .update({
        name: fields.name,
        last_name: fields.last_name,
        email: fields.email,
        phone: fields.phone ?? "",
        company: fields.company ?? "",
        job_title: fields.job_title ?? "",
        role: fields.role,
        status: fields.status,
        avatar_url: fields.avatar_url ?? "",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, user: updated };
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    if (!admin) return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." };

    const { error: tableError } = await admin.from("users").delete().eq("id", data.id);
    if (tableError) return { ok: false, error: tableError.message };

    const { error: authError } = await admin.auth.admin.deleteUser(data.id);
    if (authError) console.warn("[deleteUser] auth user deletion failed:", authError.message);

    return { ok: true };
  });

export const recordLastAccessFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    await supabase.from("users").update({ last_access: new Date().toISOString() }).eq("id", data.id);
  });
