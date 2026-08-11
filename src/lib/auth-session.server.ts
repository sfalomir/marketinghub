import { useSession } from "@tanstack/react-start/server";
import type { Role } from "@/lib/mh-types";

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

const SESSION_PASSWORD =
  process.env.SESSION_SECRET ?? "marketing-hub-local-dev-secret-32chars!!";

export function useAppSession() {
  return useSession<SessionUser>({
    name: "mh-session",
    password: SESSION_PASSWORD,
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  });
}
