import type { CommissionStatus } from "@/lib/types";

/** Who may move a commission from one status to another. */
export const COMMISSION_TRANSITIONS: Record<CommissionStatus, { seller: CommissionStatus[]; buyer: CommissionStatus[] }> = {
  new: { seller: ["quoted", "declined"], buyer: ["declined"] },
  quoted: { seller: ["declined"], buyer: ["accepted", "declined"] },
  accepted: { seller: ["done", "declined"], buyer: [] },
  declined: { seller: [], buyer: [] },
  done: { seller: [], buyer: [] },
};

export function canCommissionTransition(from: CommissionStatus, to: CommissionStatus, role: "seller" | "buyer"): boolean {
  return COMMISSION_TRANSITIONS[from][role].includes(to);
}

/** Statuses that still need somebody's attention (shown with a badge). */
export const OPEN_COMMISSION_STATUSES: CommissionStatus[] = ["new", "quoted", "accepted"];

/** Short-lived slug for a collection: transliterated title + 4 random chars. */
export function collectionSlug(title: string, slugify: (s: string) => string, random = Math.random): string {
  const base = slugify(title).slice(0, 40).replace(/-+$/, "") || "collection";
  const suffix = Math.floor(random() * 36 ** 4)
    .toString(36)
    .padStart(4, "0");
  return `${base}-${suffix}`;
}
