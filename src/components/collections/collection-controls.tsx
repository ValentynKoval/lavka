"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe2, Link2, Lock, Trash2 } from "lucide-react";
import { useT } from "@/i18n/client";
import { createCollectionAction, deleteCollectionAction, updateCollectionAction, type CollectionFormState } from "@/lib/collections/actions";
import type { Collection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

const initial: CollectionFormState = {};

export function CollectionCreateForm() {
  const { t } = useT();
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (prev: CollectionFormState, fd: FormData) => {
      const r = await createCollectionAction(prev, fd);
      if (r.success) {
        toast.success(t("collections.createdToast"));
        router.refresh();
      }
      return r;
    },
    initial,
  );
  return (
    <form action={action} className="grid gap-4 rounded-3xl bg-linen-100 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end" key={state.created?.id ?? "new"}>
      <Field label={t("collections.fieldTitle")} htmlFor="col-title">
        <Input id="col-title" name="title" maxLength={80} required placeholder={t("collections.titlePlaceholder")} />
      </Field>
      <Field label={t("collections.fieldDescription")} htmlFor="col-desc">
        <Input id="col-desc" name="description" maxLength={400} placeholder={t("collections.descriptionPlaceholder")} />
      </Field>
      <div className="flex flex-col gap-3">
        <Checkbox name="isPublic" value="1" defaultChecked label={t("collections.publicLabel")} />
        <Button type="submit" loading={pending}>{t("collections.create")}</Button>
      </div>
      {state.error && <p role="alert" className="text-sm text-danger-500 sm:col-span-3">{state.error}</p>}
    </form>
  );
}

/** Visibility toggle, copy link and delete for the owner's collection card. */
export function CollectionCardControls({ collection }: { collection: Collection }) {
  const { t } = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const run = (fn: () => Promise<{ error?: string }>, ok: string) =>
    startTransition(async () => {
      const r = await fn();
      if (r.error) toast.error(r.error);
      else {
        toast.success(ok);
        router.refresh();
      }
    });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/c/${collection.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("common.actionFailed"));
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => updateCollectionAction(collection.id, { isPublic: !collection.isPublic }), t("collections.visibilityChanged"))}>
        {collection.isPublic ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {collection.isPublic ? t("collections.public") : t("collections.private")}
      </Button>
      <Button size="sm" variant="outline" onClick={copy}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {copied ? t("collections.copied") : t("collections.copyLink")}
      </Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => confirm(t("collections.deleteConfirm")) && run(() => deleteCollectionAction(collection.id), t("collections.deleted"))}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ShareCollectionButton({ slug }: { slug: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${location.origin}/c/${slug}`;
    try {
      if (navigator.share) await navigator.share({ url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* cancelled */
    }
  };
  return (
    <Button variant="outline" onClick={share}>
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {copied ? t("collections.copied") : t("collections.share")}
    </Button>
  );
}

/** Inline editor for title/description on the public page (owner only). */
export function CollectionInlineEdit({ collection }: { collection: Collection }) {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!open) return <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>{t("common.edit")}</Button>;
  return (
    <form
      className="grid w-full gap-3 rounded-2xl bg-linen-100 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const r = await updateCollectionAction(collection.id, { title: String(fd.get("title") ?? ""), description: String(fd.get("description") ?? "") });
          if (r.error) toast.error(r.error);
          else {
            setOpen(false);
            router.refresh();
          }
        });
      }}
    >
      <Input name="title" defaultValue={collection.title} maxLength={80} required />
      <Textarea name="description" defaultValue={collection.description} rows={2} maxLength={400} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={pending}>{t("common.save")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
      </div>
    </form>
  );
}
