import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Store } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getChatRepository, isDemoMode } from "@/lib/repositories";
import { ChatWindow } from "@/components/chat/chat-window";
import { ConversationList } from "@/components/chat/conversation-list";

export const metadata: Metadata = { title: "Розмова" };

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const user = await requireUser("/messages");
  const { id } = await params;
  const repo = getChatRepository();
  const conversation = await repo.getConversation(user.id, id);
  if (!conversation) notFound();
  const [messages, conversations] = await Promise.all([repo.listMessages(id), repo.listConversations(user.id)]);
  await repo.markRead(id, user.id);

  const iAmBuyer = conversation.buyerId === user.id;
  const title = iAmBuyer ? conversation.shop?.name ?? "Майстерня" : conversation.buyer?.fullName ?? "Покупець";
  const avatar = iAmBuyer ? conversation.shop?.avatarUrl : conversation.buyer?.avatarUrl;

  return (
    <div className="container-page py-8 sm:py-12">
      <Link href="/messages" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-clay-600 lg:hidden">
        <ChevronLeft className="h-4 w-4" /> Усі розмови
      </Link>
      <div className="mt-4 grid gap-6 lg:mt-0 lg:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <h1 className="mb-4 text-2xl font-semibold text-ink-900">Повідомлення</h1>
          <ConversationList conversations={conversations} viewerId={user.id} activeId={id} />
        </aside>
        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-3xl bg-white shadow-card">
          <header className="flex items-center gap-3 border-b border-ink-900/5 px-5 py-4">
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-moss-100 text-sm font-bold text-moss-700">
              {avatar ? <Image src={avatar} alt="" fill sizes="44px" className="object-cover" /> : title.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink-900">{title}</p>
              <p className="text-xs text-ink-500">{iAmBuyer ? "Майстер зазвичай відповідає протягом дня" : "Покупець"}</p>
            </div>
            {iAmBuyer && conversation.shop && (
              <Link href={`/shop/${conversation.shop.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-ink-900/40">
                <Store className="h-3.5 w-3.5" /> Лавка
              </Link>
            )}
          </header>
          <ChatWindow conversationId={id} initialMessages={messages} viewerId={user.id} realtime={!isDemoMode()} />
        </section>
      </div>
    </div>
  );
}
