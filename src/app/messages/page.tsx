import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getChatRepository } from "@/lib/repositories";
import { ConversationList } from "@/components/chat/conversation-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Повідомлення" };

export default async function MessagesPage() {
  const user = await requireUser("/messages");
  const conversations = await getChatRepository().listConversations(user.id);
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Чат</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">Повідомлення</h1>
        <p className="mt-3 text-sm text-ink-500">Листування з майстрами та покупцями. Нові повідомлення з&apos;являються без оновлення сторінки.</p>
      </div>
      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-6 w-6" />}
          title="Розмов ще немає"
          description="Напишіть майстру зі сторінки виробу або лавки — уточніть розмір, колір чи термін виготовлення."
          action={<Button href="/shops">До майстрів</Button>}
        />
      ) : (
        <div className="max-w-3xl">
          <ConversationList conversations={conversations} viewerId={user.id} />
        </div>
      )}
    </div>
  );
}
