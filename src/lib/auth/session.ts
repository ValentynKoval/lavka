import { cache } from "react";
import { redirect } from "next/navigation";
import { getAuthService, getSellerRepository } from "@/lib/repositories";
import type { Profile, Shop } from "@/lib/types";

/** Current user, memoised per request so layout and pages share one lookup. */
export const getCurrentUser = cache(async (): Promise<Profile | null> => {
  try {
    return await getAuthService().getCurrentUser();
  } catch {
    return null;
  }
});

export async function requireUser(next?: string): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

/** Admin-only pages: redirects everyone else to the home page. */
export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

/** The signed-in master together with their shop; redirects to onboarding when the shop is missing. */
export async function requireSeller(): Promise<{ user: Profile; shop: Shop }> {
  const user = await requireUser("/seller");
  const shop = await getSellerRepository().getShopByOwner(user.id);
  if (!shop) redirect("/seller/onboarding");
  return { user, shop };
}
