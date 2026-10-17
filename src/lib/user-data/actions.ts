"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getUserDataRepository } from "@/lib/repositories";
import type { CartLine } from "@/lib/types";

/** Returns server-side favourites and cart for the signed-in user (empty for guests). */
export async function loadUserDataAction(): Promise<{ favorites: string[]; cart: CartLine[]; userId: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { favorites: [], cart: [], userId: null };
  const repo = getUserDataRepository();
  const [favorites, cart] = await Promise.all([repo.getFavorites(user.id), repo.getCart(user.id)]);
  return { favorites, cart, userId: user.id };
}

export async function syncFavoriteAction(productId: string, on: boolean): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await getUserDataRepository().setFavorite(user.id, productId, on);
}

export async function syncCartLineAction(productId: string, quantity: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await getUserDataRepository().setCartLine(user.id, productId, quantity);
}

export async function syncAllAction(favorites: string[], cart: CartLine[]): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const repo = getUserDataRepository();
  await Promise.all([
    ...favorites.map((id) => repo.setFavorite(user.id, id, true)),
    ...cart.map((line) => repo.setCartLine(user.id, line.productId, line.quantity)),
  ]);
}
