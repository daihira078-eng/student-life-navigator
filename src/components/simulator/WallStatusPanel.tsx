"use client";

import { useState } from "react";
import type { WallStatus } from "@/lib/types";
import { formatHours, formatYen } from "@/lib/format";
import { generateAdvice } from "@/lib/adviceGenerator";
import { AnimatedRing } from "./AnimatedRing";

const WALL_ACCENT: Record<string, string> = {
  incomeTax: "var(--series-1)",
  socialInsurance: "var(--series-6)",
};

const STATUS_COLOR: Record<WallStatus["status"], string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

/** リングのセグメント色。バイトの登場順で固定して、複数の壁をまたいでも同じバイトは同じ色になるようにする */
const JOB_SEGMENT_COLORS = [
  "var(--series-2)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-3)",
  "var(--series-8)",
];

function buildJobColorMap(walls: WallStatus[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const w of walls) {
    for (const c of w.breakdown) {
      if (!map.has(c.jobId)) {
        map.set(c.jobId, JOB_SEGMENT_COLORS[map.size % JOB_SEGMENT_COLORS.length]);
      }
    }
  }
  return map;
}

const STATUS_LABEL: Record<WallStatus["status"], string> = {
  good: "余裕あり",
  warning: "壁に接近中",
  critical: "壁を超える見込み",
};

/** KPIセルの見出しは短くし、詳しい説明(19-23歳向け等)はリング側のラベルに残す */
function shortWallLabel(wall: WallStatus["wall"]): string {
  const man = Math.round(wall.threshold / 10000);
  return `${man}万円の壁`;
}

function KpiCell({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setExpanded((e) => !e)}
      className="border-r border-b border-(--gridline) px-4 py-3 text-left last:border-r-0"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="text-xs text-muted">{label}</div>
      <div className="text-xl font-bold text-primary tabular-nums">{value}</div>
      {expanded ? (
        <div className="mt-1 text-xs text-muted">{sub}</div>
      ) : (
        <div className="mt-1 text-xs text-muted underline decoration-dotted">詳細を見る</div>
      )}
    </button>
  );
}

export function WallStatusPanel({ walls }: { walls: WallStatus[] }) {
  if (walls.length === 0) {
    return (
      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4 text-sm text-secondary">
        社会保険上の扶養に入っていない場合、社会保険の壁は表示されません。
      </div>
    );
  }

  const jobColors = buildJobColorMap(walls);
  const advice = generateAdvice(walls);

  const cells = walls.flatMap((w) => [
    {
      key: `${w.wall.key}-usage`,
      label: `${shortWallLabel(w.wall)} 使用率`,
      value: `${Math.round(Math.min(1, w.annualProjection / w.wall.threshold) * 100)}%`,
      sub: `${formatYen(w.annualProjection)} / ${formatYen(w.wall.threshold)}`,
      accent: WALL_ACCENT[w.wall.key] ?? "var(--gridline)",
    },
    {
      key: `${w.wall.key}-hours`,
      label: "あと働ける時間",
      value: w.remainingAmount > 0 ? formatHours(w.remainingHours) : "超過",
      sub: w.monthReached ? `${w.monthReached}月に到達見込み` : "年内到達見込みなし",
      accent: STATUS_COLOR[w.status],
    },
  ]);

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div
        className="grid border-l border-t border-(--gridline)"
        style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
      >
        {cells.map((c) => (
          <KpiCell key={c.key} label={c.label} value={c.value} sub={c.sub} accent={c.accent} />
        ))}
      </div>

      <div className="mt-6 flex gap-6">
        {walls.map((w) => (
          <AnimatedRing
            key={w.wall.key}
            segments={w.breakdown.map((c) => ({
              color: jobColors.get(c.jobId) ?? "var(--gridline)",
              annualIncome: c.annualIncome,
            }))}
            threshold={w.wall.threshold}
            status={w.status}
            pctColor={STATUS_COLOR[w.status]}
            label={w.wall.label}
            sub={STATUS_LABEL[w.status]}
          />
        ))}
      </div>

      {jobColors.size > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1">
          {[...jobColors.entries()].map(([jobId, color]) => {
            const name = walls
              .flatMap((w) => w.breakdown)
              .find((c) => c.jobId === jobId)?.jobName;
            return (
              <div key={jobId} className="flex items-center gap-1.5 text-xs text-secondary">
                <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
                {name}
              </div>
            );
          })}
        </div>
      )}

      {advice && (
        <div
          className="mt-5 rounded-md border px-4 py-3 text-sm text-primary"
          style={{
            background: `color-mix(in oklab, ${STATUS_COLOR[advice.status]} 10%, var(--surface-1))`,
            borderColor: `color-mix(in oklab, ${STATUS_COLOR[advice.status]} 35%, var(--gridline))`,
          }}
        >
          <span className="font-semibold" style={{ color: STATUS_COLOR[advice.status] }}>
            ひとことアドバイス:{" "}
          </span>
          {advice.message}
        </div>
      )}

      {walls.map(
        (w) =>
          (w.excessImpact || w.shiftSuggestion) && (
            <div key={`${w.wall.key}-notice`} className="mt-5 border-t border-(--gridline) pt-4">
              {w.excessImpact && (
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-secondary">{w.excessImpact.label}</span>
                  <span className="font-semibold" style={{ color: STATUS_COLOR.critical }}>
                    −{formatYen(w.excessImpact.amount)}
                  </span>
                </div>
              )}
              {w.excessImpact?.hoursEquivalent && (
                <p className="mt-1 text-xs text-secondary">
                  {w.excessImpact.hoursEquivalent.jobName}での勤務 約
                  <span className="font-semibold text-primary">
                    {formatHours(w.excessImpact.hoursEquivalent.hours)}
                  </span>
                  分に相当
                </p>
              )}
              {w.excessImpact && <p className="mt-1 text-xs text-muted">{w.excessImpact.note}</p>}
              {w.shiftSuggestion && (
                <p className="mt-2 text-sm text-secondary">
                  <span className="font-semibold text-brand">回避の目安: </span>
                  <span className="font-semibold text-primary">{w.shiftSuggestion.jobName}</span>
                  の週の勤務時間を約
                  <span className="font-semibold text-primary">
                    {formatHours(w.shiftSuggestion.weeklyHourReduction)}
                  </span>
                  減らすと、年間見込みが壁以内に収まります
                </p>
              )}
            </div>
          ),
      )}
    </div>
  );
}
