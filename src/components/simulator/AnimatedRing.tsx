"use client";

import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

interface AnimatedRingProps {
  ratio: number;
  color: string;
  label: string;
  sub: string;
}

export function AnimatedRing({ ratio, color, label, sub }: AnimatedRingProps) {
  const animatedPct = useAnimatedNumber(Math.round(ratio * 100));
  return (
    <div className="flex-1 text-center">
      <div
        className="mx-auto flex h-28 w-28 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${color} 0% ${animatedPct}%, var(--gridline) ${animatedPct}% 100%)`,
        }}
      >
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-surface">
          <span className="text-lg font-bold text-primary tabular-nums">
            {Math.round(animatedPct)}%
          </span>
        </div>
      </div>
      <div className="mt-2 text-sm text-secondary">{label}</div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}
