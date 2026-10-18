"use server";

import { getStatsRepository } from "@/lib/repositories";

/** Fire-and-forget view counter; failures are swallowed so they never break the page. */
export async function recordViewAction(productId: string): Promise<void> {
  if (!productId || productId.length > 64) return;
  try {
    await getStatsRepository().recordView(productId);
  } catch {
    // analytics must never surface errors to the visitor
  }
}
