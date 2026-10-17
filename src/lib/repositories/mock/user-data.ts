import type { UserDataRepository } from "../types";
import { getMockState } from "./store";

export const mockUserDataRepository: UserDataRepository = {
  async getFavorites(userId) {
    return [...(getMockState().favorites.get(userId) ?? [])];
  },
  async setFavorite(userId, productId, on) {
    const state = getMockState();
    const set = state.favorites.get(userId) ?? new Set<string>();
    if (on) set.add(productId);
    else set.delete(productId);
    state.favorites.set(userId, set);
  },
  async getCart(userId) {
    const cart = getMockState().carts.get(userId) ?? new Map<string, number>();
    return [...cart.entries()].map(([productId, quantity]) => ({ productId, quantity }));
  },
  async setCartLine(userId, productId, quantity) {
    const state = getMockState();
    const cart = state.carts.get(userId) ?? new Map<string, number>();
    if (quantity <= 0) cart.delete(productId);
    else cart.set(productId, quantity);
    state.carts.set(userId, cart);
  },
  async clearCart(userId) {
    getMockState().carts.delete(userId);
  },
};
