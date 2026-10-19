"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { uploadImageAction } from "@/lib/seller/actions";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

export interface UploadedImage {
  url: string;
  alt: string;
}

interface ImageUploaderProps {
  /** Form field name. Single mode posts the URL; multi mode posts a JSON array. */
  name: string;
  label: string;
  hint?: string;
  initial?: UploadedImage[];
  max?: number;
  single?: boolean;
  wide?: boolean;
  error?: string;
}

export function ImageUploader({ name, label, hint, initial = [], max = 8, single = false, wide = false, error }: ImageUploaderProps) {
  const { t } = useT();
  const [images, setImages] = useState<UploadedImage[]>(initial);
  const [uploading, setUploading] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = Math.max(0, max - images.length);
    const list = Array.from(files).slice(0, single ? 1 : room);
    if (list.length === 0) {
      toast.info(t("seller.upload.limit", { n: max }));
      return;
    }
    setUploading((n) => n + list.length);
    for (const file of list) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const result = await uploadImageAction(formData);
        if (result.url) {
          const next = { url: result.url, alt: file.name.replace(/\.[a-z0-9]+$/i, "") };
          setImages((prev) => (single ? [next] : [...prev, next].slice(0, max)));
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch {
        toast.error(t("seller.upload.failed"));
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));
  const makeCover = (index: number) =>
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      return [item, ...next];
    });

  const value = single ? (images[0]?.url ?? "") : JSON.stringify(images);
  const canAdd = single ? true : images.length < max;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink-700">{label}</span>
        {!single && <span className="text-xs text-ink-500">{images.length}/{max}</span>}
      </div>
      <input type="hidden" name={name} value={value} />
      <div className={cn("grid gap-3", single ? (wide ? "grid-cols-1" : "grid-cols-[160px]") : "grid-cols-3 sm:grid-cols-4")}>
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className={cn("group relative overflow-hidden rounded-2xl bg-linen-200", wide ? "aspect-[16/6]" : "aspect-square")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-start justify-between p-2 opacity-0 transition group-hover:opacity-100">
              {!single && i !== 0 ? (
                <button type="button" onClick={() => makeCover(i)} className="rounded-full bg-white/90 p-1.5 text-ink-700 hover:text-sand-500" aria-label={t("seller.upload.makeCover")}>
                  <Star className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => remove(i)} className="rounded-full bg-white/90 p-1.5 text-ink-700 hover:text-danger-500" aria-label={t("seller.upload.remove")}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {!single && i === 0 && (
              <span className="absolute bottom-2 left-2 rounded-full bg-ink-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-linen-50">{t("seller.upload.main")}</span>
            )}
          </div>
        ))}
        {canAdd && (
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-900/15 bg-linen-50 text-center text-xs text-ink-500 transition hover:border-clay-500 hover:text-clay-600",
              wide ? "aspect-[16/6]" : "aspect-square",
              single && images.length > 0 && "hidden",
              error && "border-danger-500",
            )}
          >
            {uploading > 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            <span className="px-2">{uploading > 0 ? t("seller.upload.uploading") : single ? t("seller.upload.choose") : t("seller.upload.add")}</span>
            <input ref={inputRef} type="file" accept="image/*" multiple={!single} className="sr-only" onChange={(e) => onFiles(e.target.files)} disabled={uploading > 0} />
          </label>
        )}
      </div>
      {single && images.length > 0 && (
        <button type="button" onClick={() => inputRef.current?.click()} className="text-xs font-semibold text-clay-600 hover:underline">
          {t("seller.upload.replace")}
        </button>
      )}
      {error ? <p className="text-sm text-danger-500">{error}</p> : hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
      <p className="text-xs text-ink-300">{t("seller.upload.formats")}</p>
    </div>
  );
}
