"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getNotificationsRepository } from "@/lib/repositories";
import type { Notification } from "@/lib/types";

export async function listNotificationsAction(): Promise<{ items: Notification[]; unread: number }> {
  const user = await getCurrentUser();
  if (!user) return { items: [], unread: 0 };
  const repo = getNotificationsRepository();
  const [items, unread] = await Promise.all([repo.list(user.id, 30), repo.unreadCount(user.id)]);
  return { items, unread };
}

export async function markNotificationsReadAction(ids: string[] | "all"): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await getNotificationsRepository().markRead(user.id, ids);
}
