"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MultiYearPoint, WallDefinition } from "@/lib/types";
import { formatYen } from "@/lib/format";

interface MultiYearChartProps {
  points: MultiYearPoint[];
  wallKey: WallDefinition["key"];
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
      <div className="text-muted">{label}歳</div>
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

export function MultiYearChart({ points, wallKey }: MultiYearChartProps) {
  const data = points
    .map((p) => {
      const wall = p.walls.find((w) => w.wall.key === wallKey);
      if (!wall) return null;
      return {
        age: p.age,
        年間見込み: Math.round(wall.annualProjection),
        壁の閾値: wall.wall.threshold,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="age"
            tickFormatter={(a) => `${a}歳`}
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
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} iconType="circle" />
          <Bar dataKey="年間見込み" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="壁の閾値" fill="var(--series-6)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
