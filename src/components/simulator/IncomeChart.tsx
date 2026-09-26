"use client";

import {
  CartesianGrid,
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

interface IncomeChartProps {
  cumulative: number[]; // 12ヶ月分
  walls: WallStatus[];
  overallStatus: WallStatus["status"];
  targetYear: number;
}

const LINE_COLOR: Record<WallStatus["status"], string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-(--border-hairline) bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="text-muted">{label}月</div>
      <div className="font-medium text-primary">{formatYen(payload[0].value)}</div>
    </div>
  );
}

export function IncomeChart({ cumulative, walls, overallStatus, targetYear }: IncomeChartProps) {
  const data = cumulative.map((value, index) => ({ month: index + 1, income: value }));

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
            <Line
              type="monotone"
              dataKey="income"
              stroke={LINE_COLOR[overallStatus]}
              strokeWidth={2}
              dot={{ r: 3, fill: LINE_COLOR[overallStatus], stroke: "var(--surface-1)", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
