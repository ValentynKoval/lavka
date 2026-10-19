"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { localizeError } from "@/i18n/errors";
import { getTranslator } from "@/i18n/server";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { getChatRepository } from "@/lib/repositories";
import type { Message } from "@/lib/types";

/** Opens (or reuses) the buyer's conversation with a shop and redirects to it. */
export async function startConversationAction(shopId: string, shopSlug: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/shop/${shopSlug}`)}`);
  const conversation = await getChatRepository().getOrCreateConversation(user.id, shopId);
  redirect(`/messages/${conversation.id}`);
}

export async function sendMessageAction(conversationId: string, body: string): Promise<{ message?: Message; error?: string }> {
  const translator = await getTranslator();
  const { t } = translator;
  const user = await requireUser();
  const text = body.trim();
  if (!text) return { error: t("chat.errors.empty") };
  if (text.length > 2000) return { error: t("chat.errors.tooLong") };
  try {
    const message = await getChatRepository().sendMessage(conversationId, user.id, text);
    revalidatePath("/messages");
    return { message };
  } catch (e) {
    return { error: localizeError(translator, e, "chat.errors.sendFailed") };
  }
}

/** Polling fallback (demo mode) and catch-up after reconnect. */
export async function fetchMessagesAction(conversationId: string, after?: string): Promise<Message[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const conversation = await getChatRepository().getConversation(user.id, conversationId);
  if (!conversation) return [];
  return getChatRepository().listMessages(conversationId, after);
}

export async function markReadAction(conversationId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await getChatRepository().markRead(conversationId, user.id);
}
