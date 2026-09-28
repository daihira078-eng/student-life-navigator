"use client";

import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

interface RingSegment {
  color: string;
  annualIncome: number;
}

interface AnimatedRingProps {
  segments: RingSegment[];
  threshold: number;
  status: "good" | "warning" | "critical";
  pctColor: string;
  label: string;
  sub: string;
}

const TRACK_COLOR: Record<AnimatedRingProps["status"], string> = {
  good: "var(--gridline)",
  warning: "color-mix(in oklab, var(--status-warning) 45%, var(--gridline))",
  critical: "var(--gridline)",
};

const TICK_COLOR: Record<AnimatedRingProps["status"], string> = {
  good: "var(--text-muted)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

/**
 * 「壁」を12時位置の固定ティックとして表現し、conic-gradientでバイトごとの内訳を
 * セグメント表示するリング。100%(=壁到達)を超えた分は、外側にもう一段リングを重ねて示す。
 */
export function AnimatedRing({ segments, threshold, status, pctColor, label, sub }: AnimatedRingProps) {
  const totalIncome = segments.reduce((sum, s) => sum + s.annualIncome, 0);
  const ratio = threshold > 0 ? totalIncome / threshold : 0;

  const animatedFillPct = useAnimatedNumber(Math.round(Math.min(1, ratio) * 100));
  const animatedOverflowPct = useAnimatedNumber(Math.round(Math.min(1, Math.max(0, ratio - 1)) * 100));
  const animatedDisplayPct = useAnimatedNumber(Math.round(ratio * 100));

  let cursor = 0;
  const stops: string[] = [];
  for (const seg of segments) {
    if (totalIncome <= 0) break;
    const share = (seg.annualIncome / totalIncome) * animatedFillPct;
    const from = cursor;
    const to = cursor + share;
    stops.push(`${seg.color} ${from}% ${to}%`);
    cursor = to;
  }
  stops.push(`${TRACK_COLOR[status]} ${cursor}% 100%`);

  return (
    <div className="flex-1 text-center">
      <div
        className="mx-auto h-32 w-32 rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      >
        <div className="relative h-full w-full">
          <div
            className="absolute left-1/2 -top-[3px] h-3 w-[3px] -translate-x-1/2 rounded-sm"
            style={{ background: TICK_COLOR[status] }}
          />
          {animatedOverflowPct > 0 && (
            <div
              className="absolute -inset-[7px] rounded-full"
              style={{
                background: `conic-gradient(var(--status-critical) 0% ${animatedOverflowPct}%, transparent ${animatedOverflowPct}% 100%)`,
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))",
              }}
            />
          )}
          <div className="absolute inset-3 flex items-center justify-center rounded-full bg-surface">
            <span className="text-lg font-bold tabular-nums" style={{ color: pctColor }}>
              {Math.round(animatedDisplayPct)}%
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm text-secondary">{label}</div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}
