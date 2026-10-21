import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Globe2, Lock } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getCollectionsRepository } from "@/lib/repositories";
import { CollectionCardControls, CollectionCreateForm } from "@/components/collections/collection-controls";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.collections") };
}

export default async function CollectionsPage() {
  const { t, tp, formatDate } = await getTranslator();
  const user = await requireUser("/collections");
  const list = await getCollectionsRepository().listOwn(user.id);
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
          <Bookmark className="h-4 w-4" /> {t("collections.eyebrow")}
        </p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("collections.myTitle")}</h1>
        <p className="mt-3 text-base text-ink-500">{t("collections.myText")}</p>
      </div>
      <CollectionCreateForm />
      {list.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-500">{t("collections.emptyHint")}</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <article key={c.id} className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-card">
              <Link href={`/c/${c.slug}`} className="grid aspect-[16/9] grid-cols-4 gap-0.5 bg-linen-200">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="relative block overflow-hidden">
                    {c.previews[i] && <Image src={c.previews[i]} alt="" fill sizes="25vw" className="object-cover" />}
                  </span>
                ))}
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  {c.isPublic ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {tp("common.items", c.itemCount)} · {formatDate(c.createdAt, { day: "numeric", month: "short" })}
                </div>
                <Link href={`/c/${c.slug}`} className="mt-2 text-xl font-semibold text-ink-900 hover:text-clay-600">{c.title}</Link>
                {c.description && <p className="mt-1 line-clamp-2 text-sm text-ink-500">{c.description}</p>}
                <div className="mt-4 flex-1" />
                <CollectionCardControls collection={c} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
