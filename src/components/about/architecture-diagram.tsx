import { getTranslator } from "@/i18n/server";

/** How a request flows: browser → Next.js → repository interfaces → Supabase or the in-memory demo. */
export async function ArchitectureDiagram() {
  const { raw } = await getTranslator();
  const labels = raw<Record<"browser" | "next" | "repos" | "supabase" | "demo" | "nextSub" | "reposSub" | "supabaseSub" | "demoSub", string>>("about.arch");
  const box = "fill-linen-50/5 stroke-linen-50/20";
  const title = "fill-linen-50 font-sans text-[15px] font-semibold";
  const sub = "fill-linen-300 font-sans text-[11px]";
  const arrow = "stroke-clay-200";
  return (
    <svg viewBox="0 0 600 300" className="h-auto w-full" role="img" aria-label={`${labels.browser} → ${labels.next} → ${labels.repos} → ${labels.supabase} / ${labels.demo}`}>
      <defs>
        <marker id="arch-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" className="fill-clay-200" />
        </marker>
        <style>{`.arch-flow{stroke-dasharray:6 8;animation:arch-dash 1.6s linear infinite}@keyframes arch-dash{to{stroke-dashoffset:-28}}@media (prefers-reduced-motion:reduce){.arch-flow{animation:none}}`}</style>
      </defs>

      <rect x="10" y="110" width="120" height="80" rx="18" className={box} strokeWidth="1.5" />
      <text x="70" y="146" textAnchor="middle" className={title}>{labels.browser}</text>
      <text x="70" y="166" textAnchor="middle" className={sub}>React 19</text>

      <rect x="160" y="100" width="150" height="100" rx="18" className={box} strokeWidth="1.5" />
      <text x="235" y="138" textAnchor="middle" className={title}>{labels.next}</text>
      <text x="235" y="158" textAnchor="middle" className={sub}>{labels.nextSub}</text>
      <text x="235" y="176" textAnchor="middle" className={sub}>RSC · Server Actions</text>

      <rect x="340" y="110" width="120" height="80" rx="18" className="fill-clay-500/20 stroke-clay-200/60" strokeWidth="1.5" />
      <text x="400" y="146" textAnchor="middle" className={title}>{labels.repos}</text>
      <text x="400" y="166" textAnchor="middle" className={sub}>{labels.reposSub}</text>

      <rect x="490" y="40" width="100" height="90" rx="18" className={box} strokeWidth="1.5" />
      <text x="540" y="78" textAnchor="middle" className={title}>{labels.supabase}</text>
      <text x="540" y="96" textAnchor="middle" className={sub}>{labels.supabaseSub}</text>
      <text x="540" y="112" textAnchor="middle" className={sub}>Auth · Realtime</text>

      <rect x="490" y="170" width="100" height="90" rx="18" className={box} strokeWidth="1.5" strokeDasharray="5 5" />
      <text x="540" y="208" textAnchor="middle" className={title}>{labels.demo}</text>
      <text x="540" y="228" textAnchor="middle" className={sub}>{labels.demoSub}</text>

      <line x1="130" y1="150" x2="158" y2="150" className={`arch-flow ${arrow}`} strokeWidth="2" markerEnd="url(#arch-arrow)" />
      <line x1="310" y1="150" x2="338" y2="150" className={`arch-flow ${arrow}`} strokeWidth="2" markerEnd="url(#arch-arrow)" />
      <path d="M460 140 C 475 140, 475 85, 488 85" fill="none" className={`arch-flow ${arrow}`} strokeWidth="2" markerEnd="url(#arch-arrow)" />
      <path d="M460 160 C 475 160, 475 215, 488 215" fill="none" className={`arch-flow ${arrow}`} strokeWidth="2" markerEnd="url(#arch-arrow)" />
    </svg>
  );
}
