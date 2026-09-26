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
import type { Job } from "@/lib/types";
import { totalMonthlyIncomeForWall } from "@/lib/wallCalculator";
import type { ActualIncomeRecord } from "@/lib/actualIncomeData";
import { formatYen } from "@/lib/format";

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

interface ActualComparisonChartProps {
  jobs: Job[];
  actualIncome: ActualIncomeRecord[];
}

export function ActualComparisonChart({ jobs, actualIncome }: ActualComparisonChartProps) {
  const records = [...actualIncome].sort((a, b) => a.month - b.month);
  const data = records.map((record) => ({
    month: record.month,
    予測: Math.round(totalMonthlyIncomeForWall(jobs, record.month, "incomeTax")),
    実績: record.amount,
  }));

  const validForError = data.filter((d) => d.実績 > 0);
  const avgErrorRate =
    validForError.length > 0
      ? validForError.reduce((sum, d) => sum + Math.abs(d.予測 - d.実績) / d.実績, 0) /
        validForError.length
      : null;

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">実績との答え合わせ（給料のみ）</span>
        {avgErrorRate !== null && (
          <span className="text-xs text-muted">平均誤差率 約{Math.round(avgErrorRate * 100)}%</span>
        )}
      </div>
      <p className="mb-3 text-xs text-secondary">
        今の入力（時給・シフト）で計算した「予測」と、実際に記録していた「実績」を並べています。ズレが大きい場合、当時のシフトは今より変動が大きかった可能性があります。
      </p>
      {data.length === 0 ? (
        <p className="text-sm text-secondary">左のフォームから実績を追加すると、ここに比較が表示されます。</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} iconType="circle" />
              <Bar dataKey="予測" fill="var(--series-5)" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="実績" fill="var(--series-8)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
