"use client";

import { useState } from "react";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import { formatYen } from "@/lib/format";

interface RingSegment {
  jobName: string;
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

const SIZE = 168;
const CENTER = SIZE / 2;
const STROKE_WIDTH = 15;
const RADIUS = CENTER - STROKE_WIDTH / 2 - 5; // 外側5pxは超過リング用に空けておく
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * 「壁」を12時位置の固定ティックとして表現し、SVGでバイトごとの内訳をセグメント表示するリング。
 * conic-gradientではなくSVG circleのstroke-dasharrayで描くのは、セグメントごとに
 * onMouseEnterでホバーできる実体(DOM要素)が必要なため。
 * 100%(=壁到達)を超えた分は、外側にもう一段リングを重ねて示す。
 */
export function AnimatedRing({ segments, threshold, status, pctColor, label, sub }: AnimatedRingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const totalIncome = segments.reduce((sum, s) => sum + s.annualIncome, 0);
  const ratio = threshold > 0 ? totalIncome / threshold : 0;

  const animatedFillPct = useAnimatedNumber(Math.round(Math.min(1, ratio) * 100));
  const animatedOverflowPct = useAnimatedNumber(Math.round(Math.min(1, Math.max(0, ratio - 1)) * 100));
  const animatedDisplayPct = useAnimatedNumber(Math.round(ratio * 100));

  const arcs = segments.reduce<Array<RingSegment & { from: number; to: number; index: number }>>(
    (acc, seg, i) => {
      const cursor = acc.length > 0 ? acc[acc.length - 1].to : 0;
      const share = totalIncome > 0 ? (seg.annualIncome / totalIncome) * animatedFillPct : 0;
      acc.push({ ...seg, from: cursor, to: cursor + share, index: i });
      return acc;
    },
    [],
  );
  const trackArc = { from: arcs.length > 0 ? arcs[arcs.length - 1].to : 0, to: 100 };

  function dashProps(fromPct: number, toPct: number) {
    const len = ((toPct - fromPct) / 100) * CIRCUMFERENCE;
    const offset = -(fromPct / 100) * CIRCUMFERENCE;
    return { strokeDasharray: `${len} ${CIRCUMFERENCE}`, strokeDashoffset: offset };
  }

  const hoveredArc = hovered !== null ? arcs[hovered] : null;

  return (
    <div className="flex-1 text-center">
      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 -rotate-90"
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={TRACK_COLOR[status]}
            strokeWidth={STROKE_WIDTH}
            {...dashProps(trackArc.from, trackArc.to)}
          />
          {arcs.map((arc) => (
            <circle
              key={arc.jobName + arc.index}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={hovered === arc.index ? STROKE_WIDTH + 3 : STROKE_WIDTH}
              className="cursor-pointer outline-none transition-[stroke-width] focus-visible:opacity-80"
              {...dashProps(arc.from, arc.to)}
              tabIndex={0}
              role="img"
              aria-label={`${arc.jobName}: ${formatYen(arc.annualIncome)}`}
              onMouseEnter={() => setHovered(arc.index)}
              onMouseLeave={() => setHovered((h) => (h === arc.index ? null : h))}
              onFocus={() => setHovered(arc.index)}
              onBlur={() => setHovered((h) => (h === arc.index ? null : h))}
            />
          ))}
        </svg>

        <div
          className="absolute left-1/2 -top-[3px] h-3 w-[3px] -translate-x-1/2 rounded-sm"
          style={{ background: TICK_COLOR[status] }}
        />

        {animatedOverflowPct > 0 && (
          <div
            className="absolute -inset-[9px] rounded-full"
            style={{
              background: `conic-gradient(var(--status-critical) 0% ${animatedOverflowPct}%, transparent ${animatedOverflowPct}% 100%)`,
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px))",
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-5 flex items-center justify-center rounded-full bg-surface">
          <span className="text-xl font-bold tabular-nums" style={{ color: pctColor }}>
            {Math.round(animatedDisplayPct)}%
          </span>
        </div>

        {hoveredArc && (
          <div className="pointer-events-none absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-(--border-hairline) bg-surface px-2.5 py-1.5 text-xs shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full align-middle" style={{ background: hoveredArc.color }} />{" "}
            <span className="text-secondary">{hoveredArc.jobName}:</span>{" "}
            <span className="font-semibold text-primary">{formatYen(hoveredArc.annualIncome)}</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-secondary">{label}</div>
      <div className="text-xs text-muted">{sub}</div>
      {arcs.length > 0 && (
        <span className="sr-only">
          内訳:{" "}
          {arcs.map((arc) => `${arc.jobName} ${formatYen(arc.annualIncome)}`).join("、")}
        </span>
      )}
    </div>
  );
}
