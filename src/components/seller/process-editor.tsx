"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useT } from "@/i18n/client";
import { uploadImageAction } from "@/lib/seller/actions";
import type { ProcessStep } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

/** Editor for "how it's made" steps; serialises to a hidden JSON field named `process`. */
export function ProcessEditor({ initial = [] }: { initial?: ProcessStep[] }) {
  const { t } = useT();
  const [steps, setSteps] = useState<ProcessStep[]>(initial);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<number | null>(null);

  const update = (i: number, patch: Partial<ProcessStep>) => setSteps((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, dir: -1 | 1) =>
    setSteps((list) => {
      const next = [...list];
      const j = i + dir;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const pickImage = (i: number) => {
    setTarget(i);
    fileRef.current?.click();
  };
  const onFile = async (file: File | undefined) => {
    if (!file || target === null) return;
    setUploading(target);
    const fd = new FormData();
    fd.append("file", file);
    const r = await uploadImageAction(fd);
    if (r.url) update(target, { imageUrl: r.url });
    else toast.error(r.error ?? t("common.actionFailed"));
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="process" value={JSON.stringify(steps)} />
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      {steps.length === 0 && <p className="text-sm text-ink-500">{t("process.editorEmpty")}</p>}
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="grid gap-3 rounded-2xl border border-ink-900/10 bg-white p-4 sm:grid-cols-[auto_1fr_auto]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-500 text-xs font-bold text-white">{i + 1}</span>
            <div className="space-y-2">
              <Input value={s.title} onChange={(e) => update(i, { title: e.target.value })} placeholder={t("process.stepTitle")} maxLength={80} className="h-10" />
              <Textarea value={s.text} onChange={(e) => update(i, { text: e.target.value })} placeholder={t("process.stepText")} rows={2} maxLength={500} />
              <div className="flex items-center gap-3">
                {s.imageUrl && (
                  <span className="relative h-14 w-14 overflow-hidden rounded-xl bg-linen-200">
                    <Image src={s.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                )}
                <Button type="button" size="sm" variant="outline" onClick={() => pickImage(i)} loading={uploading === i}>
                  <ImagePlus className="h-4 w-4" /> {s.imageUrl ? t("process.replacePhoto") : t("process.addPhoto")}
                </Button>
                {s.imageUrl && (
                  <button type="button" onClick={() => update(i, { imageUrl: null })} className="text-xs text-ink-500 hover:text-danger-500">{t("process.removePhoto")}</button>
                )}
              </div>
            </div>
            <div className="flex gap-1 sm:flex-col">
              <Button type="button" size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t("process.moveUp")}><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === steps.length - 1} aria-label={t("process.moveDown")}><ArrowDown className="h-4 w-4" /></Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => setSteps((list) => list.filter((_, j) => j !== i))} aria-label={t("common.delete")}><Trash2 className="h-4 w-4 text-danger-500" /></Button>
            </div>
          </li>
        ))}
      </ol>
      {steps.length < 8 && (
        <Button type="button" size="sm" variant="outline" onClick={() => setSteps((list) => [...list, { title: "", text: "", imageUrl: null }])}>
          <Plus className="h-4 w-4" /> {t("process.addStep")}
        </Button>
      )}
    </div>
  );
}
