import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslator } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/repositories";
import { AuthForm } from "@/components/auth/auth-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.login") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  if (user) redirect(nextPath && nextPath.startsWith("/") ? nextPath : "/");
  return <AuthForm mode="login" next={nextPath} demo={isDemoMode()} />;
}
