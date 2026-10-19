import { HandHeart, Leaf, MessageCircle, PackageCheck } from "lucide-react";
import { getTranslator } from "@/i18n/server";

const icons = [HandHeart, Leaf, MessageCircle, PackageCheck];

export async function ValuesStrip() {
  const { raw } = await getTranslator();
  const values = raw<{ title: string; text: string }[]>("home.values");
  return (
    <section className="container-page mt-20 sm:mt-24">
      <div className="grid gap-6 rounded-[2rem] bg-ink-900 px-6 py-10 text-linen-50 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
        {values.map((v, i) => {
          const Icon = icons[i] ?? HandHeart;
          return (
            <div key={v.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-clay-500/20 text-clay-200">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-sans text-base font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-linen-300">{v.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
