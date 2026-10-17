import { HandHeart, Leaf, MessageCircle, PackageCheck } from "lucide-react";

const values = [
  { icon: HandHeart, title: "Тільки ручна робота", text: "Жодних перепродажів із фабрик — лише речі, зроблені самими майстрами." },
  { icon: Leaf, title: "Натуральні матеріали", text: "Глина, льон, вовна, дерево, соєвий віск. Усе чесно вказано в картці." },
  { icon: MessageCircle, title: "Прямий зв'язок", text: "Пишіть майстру, домовляйтеся про колір, розмір чи гравіювання." },
  { icon: PackageCheck, title: "Дбайливе пакування", text: "Кожна річ їде у крафті та стружці — приїде ціла й гарна." },
];

export function ValuesStrip() {
  return (
    <section className="container-page mt-20 sm:mt-24">
      <div className="grid gap-6 rounded-[2rem] bg-ink-900 px-6 py-10 text-linen-50 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
        {values.map((v) => (
          <div key={v.title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-clay-500/20 text-clay-200">
              <v.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-sans text-base font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-linen-300">{v.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
