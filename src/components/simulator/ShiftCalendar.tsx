"use client";

import { useState } from "react";
import type { Job, WallDefinition } from "@/lib/types";
import { generateShiftDays, computeWallCrossingDate } from "@/lib/shiftCalendar";
import { buildJobColorMapFromJobs } from "@/lib/jobColors";
import { formatYen } from "@/lib/format";

interface ShiftCalendarProps {
  jobs: Job[];
  walls: WallDefinition[];
  year: number;
}

const WALL_MARK_COLOR: Record<string, string> = {
  incomeTax: "var(--series-1)",
  socialInsurance: "var(--series-6)",
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

interface DayEntry {
  jobId: string;
  jobName: string;
  amount: number;
}

/**
 * 実際のシフト日を「本物のカレンダー」として月単位で表示する。年間ヒートマップ版は
 * 小さすぎて見づらいというフィードバックを受けて月表示に作り直した。
 * job.weekdaysを指定したバイトが1つも無ければ何も描画しない(この機能はオプトイン)。
 */
export function ShiftCalendar({ jobs, walls, year }: ShiftCalendarProps) {
  const calendarJobs = jobs.filter((j) => j.weekdays && j.weekdays.length > 0);
  const currentRealMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(currentRealMonth);
  const [selected, setSelected] = useState<string | null>(null);

  if (calendarJobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-(--border-hairline) p-6 text-sm text-muted">
        「今の状況」タブのバイト詳細設定で「稼働曜日を指定する」を使うと、実際のシフト日をカレンダーで表示し、壁に到達する具体的な日付を確認できます。
      </div>
    );
  }

  const jobColors = buildJobColorMapFromJobs(jobs);

  const dayMap = new Map<string, DayEntry[]>();
  for (const job of calendarJobs) {
    for (const day of generateShiftDays(job, year)) {
      if (!day.date.startsWith(`${year}-${String(month).padStart(2, "0")}`)) continue;
      const list = dayMap.get(day.date) ?? [];
      list.push({ jobId: day.jobId, jobName: job.name || "バイト", amount: day.amount });
      dayMap.set(day.date, list);
    }
  }

  const crossingDates = walls
    .map((wall) => ({ wall, date: computeWallCrossingDate(jobs, year, wall.key, wall.threshold) }))
    .filter((c): c is { wall: WallDefinition; date: string } => c.date !== null);
  const crossingByDate = new Map(crossingDates.map((c) => [c.date, c.wall]));

  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const cells: { date: string; day: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d });
  }

  const selectedEntries = selected ? (dayMap.get(selected) ?? []) : [];

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((m) => (m === 1 ? 12 : m - 1))}
          aria-label="前の月"
          className="rounded px-3 py-1.5 text-lg text-secondary outline-none hover:bg-(--brand-soft) focus-visible:ring-2 focus-visible:ring-brand"
        >
          ‹
        </button>
        <div className="text-lg font-semibold text-primary">
          {year}年{month}月
        </div>
        <button
          type="button"
          onClick={() => setMonth((m) => (m === 12 ? 1 : m + 1))}
          aria-label="次の月"
          className="rounded px-3 py-1.5 text-lg text-secondary outline-none hover:bg-(--brand-soft) focus-visible:ring-2 focus-visible:ring-brand"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {cells.map((cell) => {
          const entries = dayMap.get(cell.date) ?? [];
          const crossingWall = crossingByDate.get(cell.date);
          const isSelected = selected === cell.date;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => setSelected((s) => (s === cell.date ? null : cell.date))}
              aria-pressed={isSelected}
              aria-label={
                entries.length > 0
                  ? `${cell.date} 勤務 ${entries.map((e) => `${e.jobName} ${formatYen(e.amount)}`).join("、")}${crossingWall ? ` (${crossingWall.label}到達)` : ""}`
                  : cell.date
              }
              className={`flex aspect-square flex-col items-start rounded-md border p-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
                isSelected ? "border-brand" : "border-(--border-hairline) hover:border-series-1"
              }`}
              style={
                crossingWall
                  ? { boxShadow: `inset 0 0 0 2px ${WALL_MARK_COLOR[crossingWall.key] ?? "var(--status-critical)"}` }
                  : undefined
              }
            >
              <span className="text-[11px] text-muted">{cell.day}</span>
              <div className="mt-auto flex flex-wrap gap-0.5">
                {entries.map((e, i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full"
                    style={{ background: jobColors.get(e.jobId) }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="mt-4 text-sm text-secondary">
          <span className="font-semibold text-primary">{selected}</span>
          {selectedEntries.length > 0 ? (
            <>
              {": "}
              {selectedEntries.map((e, i) => (
                <span key={i}>
                  {i > 0 && "、"}
                  {e.jobName} {formatYen(e.amount)}
                </span>
              ))}
            </>
          ) : (
            ": 稼働なし"
          )}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-(--gridline) pt-4 text-xs text-secondary">
        {calendarJobs.map((job) => (
          <div key={job.id} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: jobColors.get(job.id) }} />
            {job.name || "バイト"}
          </div>
        ))}
        {crossingDates.map((c) => (
          <div key={c.wall.key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm border-2"
              style={{ borderColor: WALL_MARK_COLOR[c.wall.key] ?? "var(--status-critical)" }}
            />
            {c.wall.label.split("（")[0]}到達: {c.date}
          </div>
        ))}
      </div>
    </div>
  );
}
