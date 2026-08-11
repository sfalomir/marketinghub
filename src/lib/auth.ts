import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { z } from "zod";
import {
  asPublicUser,
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  type PublicUser,
} from "./supabase-auth";

const roleSchema = z.enum(["Administrador", "Marketing", "Colaborador"]);

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(100),
  role: roleSchema.optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(100),
});

export type AuthResult = { ok: true; user: PublicUser } | { ok: false; error: string };

async function saveSession(user: PublicUser) {
  const { useAppSession } = await import("./auth-session.server");
  const session = await useAppSession();
  await session.clear();
  await session.update({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

export const registerFn = createServerFn({ method: "POST" })
  .validator((data) => registerSchema.parse(data))
  .handler(async ({ data }): Promise<AuthResult> => {
    try {
      const user = await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      await saveSession(user);
      return { ok: true, user };
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_TAKEN") {
        return { ok: false, error: "Ya existe una cuenta con ese correo." };
      }
      const msg = error instanceof Error ? error.message : "Error desconocido";
      return { ok: false, error: msg };
    }
  });

export const loginFn = createServerFn({ method: "POST" })
  .validator((data) => loginSchema.parse(data))
  .handler(async ({ data }): Promise<AuthResult> => {
    const valid = await verifyPassword(data.email, data.password);
    if (!valid) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }

    const user = await findUserByEmail(data.email);
    if (!user) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }

    await saveSession(asPublicUser(user));
    return { ok: true, user: asPublicUser(user) };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { useAppSession } = await import("./auth-session.server");
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: "/login" });
});

async function readSessionUser(): Promise<PublicUser | null> {
  const { useAppSession } = await import("./auth-session.server");
  const session = await useAppSession();
  const userId = session.data.userId;
  if (!userId) return null;

  const user = await findUserById(userId);
  if (!user) {
    await session.clear();
    return null;
  }

  return asPublicUser(user);
}

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicUser | null> => readSessionUser(),
);

export const requireUserFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicUser> => {
    const user = await readSessionUser();
    if (!user) throw redirect({ to: "/login" });
    return user;
  },
);
