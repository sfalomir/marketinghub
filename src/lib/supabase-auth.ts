import { supabase } from "./supabase";
import type { User, UserInsert } from "./supabase-types";
import type { Role } from "./mh-types";

export type PublicUser = User;

function isEmailTaken(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("already exists") ||
    lower.includes("user already")
  );
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function createUser(input: {
  name: string;
  last_name?: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  job_title?: string;
  role?: Role;
  status?: "Activo" | "Inactivo" | "Suspendido";
  avatar_url?: string;
}): Promise<PublicUser> {
  const { getSupabaseAdmin } = await import("./supabase-admin.server");
  const admin = getSupabaseAdmin();

  const email = input.email.trim().toLowerCase();
  const role = input.role ?? "Colaborador";

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name: input.name.trim(),
      last_name: input.last_name?.trim() ?? "",
      role,
    },
  });

  if (authError) {
    if (isEmailTaken(authError.message)) throw new Error("EMAIL_TAKEN");
    throw authError;
  }

  if (!authData.user) {
    throw new Error("No se pudo crear el usuario en Auth.");
  }

  const userData: UserInsert = {
    id: authData.user.id,
    name: input.name.trim(),
    last_name: input.last_name?.trim() ?? "",
    email,
    phone: input.phone?.trim() ?? "",
    company: input.company?.trim() ?? "",
    job_title: input.job_title?.trim() ?? "",
    role,
    status: input.status ?? "Activo",
    avatar_url: input.avatar_url?.trim() ?? "",
  };

  const { data: user, error: userError } = await admin
    .from("users")
    .upsert(userData, { onConflict: "id" })
    .select()
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  return user;
}

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

export function asPublicUser(user: User): PublicUser {
  return user;
}

export async function listUsers(): Promise<PublicUser[]> {
  const { data, error } = await supabase.from("users").select("*").order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data || [];
}
