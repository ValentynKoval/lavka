import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/repositories";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Реєстрація" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  if (user) redirect(nextPath && nextPath.startsWith("/") ? nextPath : "/");
  return <AuthForm mode="register" next={nextPath} demo={isDemoMode()} />;
}
