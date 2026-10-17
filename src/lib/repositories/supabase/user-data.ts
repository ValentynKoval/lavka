import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserDataRepository } from "../types";

export const supabaseUserDataRepository: UserDataRepository = {
  async getFavorites(userId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("favorites").select("product_id").eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.product_id);
  },
  async setFavorite(userId, productId, on) {
    const supabase = await createSupabaseServerClient();
    const { error } = on
      ? await supabase.from("favorites").upsert({ user_id: userId, product_id: productId })
      : await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId);
    if (error) throw new Error(error.message);
  },
  async getCart(userId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("cart_items").select("product_id, quantity").eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({ productId: r.product_id, quantity: r.quantity }));
  },
  async setCartLine(userId, productId, quantity) {
    const supabase = await createSupabaseServerClient();
    const { error } =
      quantity > 0
        ? await supabase
            .from("cart_items")
            .upsert({ user_id: userId, product_id: productId, quantity, updated_at: new Date().toISOString() })
        : await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", productId);
    if (error) throw new Error(error.message);
  },
  async clearCart(userId) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
  },
};
