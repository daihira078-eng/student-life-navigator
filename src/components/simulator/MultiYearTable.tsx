import type { MultiYearPoint } from "@/lib/types";
import { formatYen } from "@/lib/format";

const STATUS_COLOR: Record<"good" | "warning" | "critical", string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

const STATUS_TEXT: Record<"good" | "warning" | "critical", string> = {
  good: "余裕",
  warning: "接近",
  critical: "超過",
};

// 列見出しは壁の種類ごとの固定ラベル。具体的な閾値(150万/130万)は年齢で変わるためセル側に表示する
const WALL_COLUMN_LABEL: Record<string, string> = {
  incomeTax: "所得税の壁",
  socialInsurance: "社会保険の壁",
};

export function MultiYearTable({ points }: { points: MultiYearPoint[] }) {
  const wallKeys = points[0]?.walls.map((w) => w.wall.key) ?? [];

  return (
    <div className="overflow-x-auto rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">年齢ごとの壁の推移</div>
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="pb-2 pr-4">年齢</th>
            <th className="pb-2 pr-4">年度</th>
            {wallKeys.map((key) => (
              <th key={key} className="pb-2 pr-4">
                {WALL_COLUMN_LABEL[key] ?? key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.age} className="border-t border-(--border-hairline)">
              <td className="py-2 pr-4 font-medium text-primary">{point.age}歳</td>
              <td className="py-2 pr-4 text-secondary">{point.year}年</td>
              {point.walls.map((w) => (
                <td key={w.wall.key} className="py-2 pr-4">
                  <span className="font-medium text-primary">{formatYen(w.annualProjection)}</span>
                  <span className="text-muted"> / {formatYen(w.wall.threshold)}</span>
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      color: STATUS_COLOR[w.status],
                      background: `color-mix(in oklab, ${STATUS_COLOR[w.status]} 18%, transparent)`,
                    }}
                  >
                    {STATUS_TEXT[w.status]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
