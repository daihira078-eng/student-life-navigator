"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WallStatus } from "@/lib/types";
import { formatYen } from "@/lib/format";

export interface IncomeSeries {
  key: string;
  label: string;
  cumulative: number[]; // 12ヶ月分
  color: string;
}

interface IncomeChartProps {
  series: IncomeSeries[];
  walls: WallStatus[];
  targetYear: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color?: string }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-(--border-hairline) bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="text-muted">{label}月</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-secondary">{p.name}:</span>
          <span className="font-medium text-primary">{formatYen(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function IncomeChart({ series, walls, targetYear }: IncomeChartProps) {
  const data = Array.from({ length: 12 }, (_, i) => {
    const row: Record<string, number> = { month: i + 1 };
    for (const s of series) row[s.key] = s.cumulative[i];
    return row;
  });

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">
        {targetYear}年 月別 累積収入の見込み
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--gridline)" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(m) => `${m}月`}
              stroke="var(--baseline)"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => `${Math.round(v / 10000)}万`}
              stroke="var(--baseline)"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            {series.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
                iconType="circle"
              />
            )}
            {walls.map((w) => (
              <ReferenceLine
                key={w.wall.key}
                y={w.wall.threshold}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                label={{
                  value: w.wall.label,
                  position: "insideTopRight",
                  fill: "var(--text-secondary)",
                  fontSize: 11,
                }}
              />
            ))}
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3, fill: s.color, stroke: "var(--surface-1)", strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
