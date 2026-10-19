import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthService } from "../types";
import { mapProfile } from "./mappers";

/** Maps Supabase auth errors to dictionary keys (translated by the auth actions). */
function authErrorKey(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "auth.errors.invalidCredentials";
  if (m.includes("already registered") || m.includes("already exists")) return "auth.errors.exists";
  if (m.includes("password should be at least")) return "auth.errors.passwordShort";
  if (m.includes("email not confirmed")) return "auth.errors.notConfirmed";
  if (m.includes("rate limit")) return "auth.errors.rateLimit";
  return "auth.errors.generic";
}

export const supabaseAuthService: AuthService = {
  async getCurrentUser() {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (profile) return mapProfile(profile);
    // Profile trigger may lag right after sign-up: fall back to auth metadata.
    return {
      id: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata?.full_name as string | undefined) ?? "",
      avatarUrl: null,
      role: "buyer",
      createdAt: user.created_at,
    };
  },
  async signIn(email, password) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { error: authErrorKey(error.message) } : {};
  },
  async signUp(email, password, fullName) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) return { error: authErrorKey(error.message) };
    if (!data.session) return { needsConfirmation: true };
    return {};
  },
  async signOut() {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  },
};
