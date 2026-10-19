import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getChatRepository } from "@/lib/repositories";
import { ConversationList } from "@/components/chat/conversation-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.messages") };
}

export default async function MessagesPage() {
  const { t } = await getTranslator();
  const user = await requireUser("/messages");
  const conversations = await getChatRepository().listConversations(user.id);
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("chat.eyebrow")}</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("chat.title")}</h1>
        <p className="mt-3 text-sm text-ink-500">{t("chat.intro")}</p>
      </div>
      {conversations.length === 0 ? (
        <EmptyState icon={<MessageCircle className="h-6 w-6" />} title={t("chat.emptyTitle")} description={t("chat.emptyText")} action={<Button href="/shops">{t("common.toShops")}</Button>} />
      ) : (
        <div className="max-w-3xl">
          <ConversationList conversations={conversations} viewerId={user.id} />
        </div>
      )}
    </div>
  );
}
