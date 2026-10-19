"use client";

import { useT } from "@/i18n/client";
import type { DailyPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

/*
 * Dependency-free SVG charts. Colours come from the design tokens so they follow dark mode.
 */

interface AreaChartProps {
  data: DailyPoint[];
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
  className?: string;
}

function useDayLabel() {
  const { formatDate } = useT();
  return (day: string) => formatDate(day, { day: "numeric", month: "short" });
}

export function AreaChart({ data, color = "var(--color-clay-500)", height = 160, formatValue = (v) => String(v), className }: AreaChartProps) {
  const { t } = useT();
  const dayLabel = useDayLabel();
  const width = 600;
  const pad = { top: 12, right: 8, bottom: 26, left: 8 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const points = data.map((d, i) => ({ x: pad.left + i * step, y: pad.top + innerH - (d.value / max) * innerH, ...d }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L${(pad.left + innerW).toFixed(1)},${(pad.top + innerH).toFixed(1)} L${pad.left},${(pad.top + innerH).toFixed(1)} Z`;
  const gradientId = `area-${Math.abs(hash(path))}`;
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-auto w-full", className)} role="img" aria-label={t("charts.chart")}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad.left} x2={width - pad.right} y1={pad.top + innerH - f * innerH} y2={pad.top + innerH - f * innerH} stroke="var(--color-ink-900)" strokeOpacity="0.06" />
      ))}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={p.day}>
          <circle cx={p.x} cy={p.y} r="3" fill={color} className="opacity-0 hover:opacity-100" />
          <title>{`${dayLabel(p.day)}: ${formatValue(p.value)}`}</title>
          {i % labelEvery === 0 && (
            <text x={p.x} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--color-ink-500)">
              {dayLabel(p.day)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

interface BarChartProps {
  data: DailyPoint[];
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
  className?: string;
}

export function BarChart({ data, color = "var(--color-moss-500)", height = 160, formatValue = (v) => String(v), className }: BarChartProps) {
  const { t } = useT();
  const dayLabel = useDayLabel();
  const width = 600;
  const pad = { top: 12, right: 8, bottom: 26, left: 8 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / Math.max(1, data.length);
  const barW = Math.max(3, slot * 0.6);
  const labelEvery = Math.ceil(data.length / 6);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-auto w-full", className)} role="img" aria-label={t("charts.bars")}>
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = pad.left + i * slot + (slot - barW) / 2;
        return (
          <g key={d.day}>
            <rect x={x} y={pad.top + innerH - h} width={barW} height={h} rx="3" fill={color} opacity={d.value === 0 ? 0.15 : 0.9}>
              <title>{`${dayLabel(d.day)}: ${formatValue(d.value)}`}</title>
            </rect>
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--color-ink-500)">
                {dayLabel(d.day)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Sparkline({ data, color = "var(--color-clay-500)", className }: { data: DailyPoint[]; color?: string; className?: string }) {
  const width = 120;
  const height = 36;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(height - 4 - (d.value / max) * (height - 8)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-9 w-28", className)} aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DonutChart({ segments, size = 140 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const { t } = useT();
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 50;
  const c = 2 * Math.PI * r;
  const arcs = segments.reduce<{ label: string; color: string; value: number; len: number; offset: number }[]>((acc, s) => {
    const offset = acc.reduce((sum, a) => sum + a.len, 0);
    return [...acc, { ...s, len: (s.value / total) * c, offset }];
  }, []);
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={t("charts.donut")}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-linen-200)" strokeWidth="14" />
      {arcs.map((s) => (
        <circle key={s.label} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={`${s.len} ${c - s.len}`} strokeDashoffset={-s.offset} transform="rotate(-90 60 60)">
          <title>{`${s.label}: ${s.value}`}</title>
        </circle>
      ))}
      <text x="60" y="64" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--color-ink-900)">
        {total}
      </text>
    </svg>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
