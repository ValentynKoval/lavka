"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Gallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];

  if (!current) {
    return <div className="flex aspect-square items-center justify-center rounded-3xl bg-linen-200 text-ink-300">Без фото</div>;
  }

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-linen-200 shadow-card">
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt || title}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover animate-fade-up"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-sm backdrop-blur hover:bg-white"
              aria-label="Попереднє фото"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-sm backdrop-blur hover:bg-white"
              aria-label="Наступне фото"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">
              {images.map((img, i) => (
                <span key={img.id} className={cn("h-1.5 w-1.5 rounded-full bg-white/60", i === index && "w-4 bg-white")} />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="hidden gap-3 lg:flex lg:w-20 lg:flex-col">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl bg-linen-200 ring-2 ring-transparent transition",
                i === index ? "ring-clay-500" : "opacity-70 hover:opacity-100",
              )}
              aria-label={`Фото ${i + 1}`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
