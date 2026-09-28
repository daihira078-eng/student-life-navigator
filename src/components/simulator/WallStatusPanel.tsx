import type { WallStatus } from "@/lib/types";
import { formatHours, formatYen } from "@/lib/format";
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

const STATUS_LABEL: Record<WallStatus["status"], string> = {
  good: "余裕あり",
  warning: "壁に接近中",
  critical: "壁を超える見込み",
};

function KpiCell({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      className="border-r border-b border-(--gridline) px-4 py-3 last:border-r-0"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="text-xs text-muted">{label}</div>
      <div className="text-xl font-bold text-primary tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
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

  const cells = walls.flatMap((w) => [
    {
      key: `${w.wall.key}-usage`,
      label: `${w.wall.label} 使用率`,
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
            ratio={Math.min(1, w.annualProjection / w.wall.threshold)}
            color={STATUS_COLOR[w.status]}
            label={w.wall.label}
            sub={STATUS_LABEL[w.status]}
          />
        ))}
      </div>

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
