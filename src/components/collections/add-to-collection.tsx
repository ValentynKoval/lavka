"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Plus } from "lucide-react";
import { useT } from "@/i18n/client";
import { createCollectionAction, listOwnCollectionsAction, toggleCollectionItemAction } from "@/lib/collections/actions";
import type { Collection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

/**
 * "Save to collection" popover: lists the visitor's collections with checkboxes and
 * lets them create a new one inline. Guests get a link to sign in.
 */
export function AddToCollection({ productId, signedIn, className }: { productId: string; signedIn: boolean; className?: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [containing, setContaining] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const saved = containing.length > 0;

  useEffect(() => {
    if (!open || !signedIn) return;
    startTransition(async () => {
      const r = await listOwnCollectionsAction(productId);
      setCollections(r.collections);
      setContaining(r.containing);
    });
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, signedIn, productId]);

  const toggle = (c: Collection) => {
    const on = !containing.includes(c.id);
    setContaining((list) => (on ? [...list, c.id] : list.filter((id) => id !== c.id)));
    startTransition(async () => {
      const r = await toggleCollectionItemAction(c.id, productId, on);
      if (r.error) toast.error(r.error);
      else toast.success(on ? t("collections.addedTo", { title: c.title }) : t("collections.removedFrom", { title: c.title }));
    });
  };

  const create = () => {
    const name = title.trim();
    if (name.length < 2) return;
    const fd = new FormData();
    fd.set("title", name);
    fd.set("productId", productId);
    startTransition(async () => {
      const r = await createCollectionAction({}, fd);
      if (r.error || !r.created) return toast.error(r.error ?? t("common.actionFailed"));
      setCollections((list) => [r.created!, ...(list ?? [])]);
      setContaining((list) => [...list, r.created!.id]);
      setTitle("");
      toast.success(t("collections.createdAndAdded", { title: r.created.title }));
    });
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-full bg-linen-100 px-4 text-sm font-semibold text-ink-700 transition hover:bg-linen-200", saved && "text-clay-600")}
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? t("collections.saved") : t("collections.save")}
      </button>
      {open && (
        <div className="animate-fade-up absolute left-0 top-12 z-40 w-72 rounded-2xl border border-ink-900/10 bg-white p-3 shadow-float">
          {!signedIn ? (
            <p className="px-1 py-2 text-sm text-ink-700">
              {t("collections.signInHint")}{" "}
              <Link href="/login" className="font-semibold text-clay-600 hover:underline">{t("nav.login")}</Link>
            </p>
          ) : (
            <>
              <p className="px-1 text-xs font-bold uppercase tracking-wide text-ink-500">{t("collections.pickTitle")}</p>
              <ul className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
                {collections === null ? (
                  <li className="px-1 py-2 text-sm text-ink-500">{t("common.loading")}</li>
                ) : collections.length === 0 ? (
                  <li className="px-1 py-2 text-sm text-ink-500">{t("collections.none")}</li>
                ) : (
                  collections.map((c) => {
                    const on = containing.includes(c.id);
                    return (
                      <li key={c.id}>
                        <button type="button" onClick={() => toggle(c)} className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm hover:bg-linen-100">
                          <span className={cn("flex h-5 w-5 items-center justify-center rounded-md border", on ? "border-clay-500 bg-clay-500 text-white" : "border-ink-900/20")}>{on && "✓"}</span>
                          <span className="min-w-0 flex-1 truncate font-medium text-ink-900">{c.title}</span>
                          <span className="text-xs text-ink-500">{c.itemCount}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              <div className="mt-2 flex gap-2 border-t border-ink-900/5 pt-3">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), create())} placeholder={t("collections.newPlaceholder")} maxLength={80} className="h-10" />
                <Button size="sm" onClick={create} disabled={pending || title.trim().length < 2} aria-label={t("collections.create")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Link href="/collections" className="mt-2 block px-1 text-xs font-semibold text-clay-600 hover:underline">{t("collections.manage")}</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
