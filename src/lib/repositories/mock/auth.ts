import { cookies } from "next/headers";
import { AppError } from "@/lib/errors";
import type { Profile } from "@/lib/types";
import type { AuthService } from "../types";
import { getMockState, newId } from "./store";

export const DEMO_SESSION_COOKIE = "lavka_demo_session";

function toProfile(user: { id: string; email: string; fullName: string; avatarUrl: string | null; role: Profile["role"]; createdAt: string }): Profile {
  return { id: user.id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl, role: user.role, createdAt: user.createdAt };
}

export const mockAuthService: AuthService = {
  async getCurrentUser() {
    const store = await cookies();
    const id = store.get(DEMO_SESSION_COOKIE)?.value;
    if (!id) return null;
    const user = getMockState().users.find((u) => u.id === id);
    return user ? toProfile(user) : null;
  },
  async signIn(email, password) {
    const user = getMockState().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) return { error: "auth.errors.invalidCredentials" };
    const store = await cookies();
    store.set(DEMO_SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return {};
  },
  async signUp(email, password, fullName) {
    const state = getMockState();
    const normalized = email.trim().toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === normalized)) {
      return { error: "auth.errors.exists" };
    }
    const user = {
      id: newId("user"),
      email: normalized,
      password,
      fullName: fullName.trim(),
      avatarUrl: null,
      role: "buyer" as const,
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    const store = await cookies();
    store.set(DEMO_SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return {};
  },
  async signOut() {
    const store = await cookies();
    store.delete(DEMO_SESSION_COOKIE);
  },
};

export { AppError };
