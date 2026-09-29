"use client";

import { useMemo, useState } from "react";
import type { Job, WallDefinition } from "@/lib/types";
import { generateShiftDays, computeWallCrossingDate } from "@/lib/shiftCalendar";
import { buildJobColorMapFromJobs } from "@/lib/jobColors";
import { formatYen } from "@/lib/format";

interface ShiftHeatmapProps {
  jobs: Job[];
  walls: WallDefinition[];
  year: number;
}

const WALL_MARK_COLOR: Record<string, string> = {
  incomeTax: "var(--series-1)",
  socialInsurance: "var(--series-6)",
};

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

interface DayCell {
  date: string;
  col: number;
  row: number;
  jobId: string | null;
  amount: number;
}

/**
 * GitHubのコントリビューショングラフ風に、実際のシフト日を1年分のマス目で表示する。
 * job.weekdaysを指定したバイトが1つも無ければ何も描画しない(この機能はオプトイン)。
 */
export function ShiftHeatmap({ jobs, walls, year }: ShiftHeatmapProps) {
  const [hovered, setHovered] = useState<DayCell | null>(null);
  const calendarJobs = jobs.filter((j) => j.weekdays && j.weekdays.length > 0);

  const { cells, colCount } = useMemo(() => {
    const yearStart = new Date(year, 0, 1);
    const firstSunday = new Date(yearStart);
    firstSunday.setDate(yearStart.getDate() - yearStart.getDay());

    const dayMap = new Map<string, { jobId: string; amount: number }>();
    for (const job of calendarJobs) {
      for (const day of generateShiftDays(job, year)) {
        // 同じ日に複数バイトがある場合は最初に登場したバイトの色で代表させる
        if (!dayMap.has(day.date)) {
          dayMap.set(day.date, { jobId: day.jobId, amount: day.amount });
        }
      }
    }

    const result: DayCell[] = [];
    let maxCol = 0;
    for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      const col = Math.floor((d.getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000));
      maxCol = Math.max(maxCol, col);
      const entry = dayMap.get(dateStr);
      result.push({
        date: dateStr,
        col,
        row: d.getDay(),
        jobId: entry?.jobId ?? null,
        amount: entry?.amount ?? 0,
      });
    }

    return { cells: result, colCount: maxCol + 1 };
  }, [calendarJobs, year]);

  const jobColors = buildJobColorMapFromJobs(jobs);

  const crossingDates = walls
    .map((wall) => ({
      wall,
      date: computeWallCrossingDate(jobs, year, wall.key, wall.threshold),
    }))
    .filter((c) => c.date !== null);

  if (calendarJobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-(--border-hairline) p-4 text-xs text-muted">
        バイトの詳細設定で「稼働曜日を指定する」を使うと、実際のシフト日をカレンダーで表示し、壁に到達する具体的な日付を確認できます。
      </div>
    );
  }

  const cellSize = 11;
  const cellGap = 3;
  const monthColPositions = MONTH_LABELS.map((_, i) => {
    const firstOfMonth = cells.find((c) => c.date === `${year}-${String(i + 1).padStart(2, "0")}-01`);
    return firstOfMonth?.col ?? 0;
  });

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">{year}年の稼働カレンダー</div>
      <div className="overflow-x-auto">
        <div style={{ position: "relative", width: colCount * (cellSize + cellGap), minWidth: "100%" }}>
          <div style={{ position: "relative", height: 14 }}>
            {MONTH_LABELS.map((label, i) => (
              <span
                key={label}
                style={{
                  position: "absolute",
                  left: monthColPositions[i] * (cellSize + cellGap),
                  fontSize: 10,
                }}
                className="text-muted"
              >
                {label}
              </span>
            ))}
          </div>
          <div style={{ position: "relative", height: 7 * (cellSize + cellGap) }}>
            {cells.map((cell) => {
              const crossing = crossingDates.find((c) => c.date === cell.date);
              const color = cell.jobId ? jobColors.get(cell.jobId) ?? "var(--gridline)" : "var(--gridline)";
              return (
                <button
                  key={cell.date}
                  type="button"
                  onMouseEnter={() => setHovered(cell)}
                  onMouseLeave={() => setHovered((h) => (h?.date === cell.date ? null : h))}
                  onFocus={() => setHovered(cell)}
                  onBlur={() => setHovered((h) => (h?.date === cell.date ? null : h))}
                  aria-label={
                    cell.jobId
                      ? `${cell.date} 勤務 ${formatYen(cell.amount)}${crossing ? ` (${crossing.wall.label}到達)` : ""}`
                      : cell.date
                  }
                  style={{
                    position: "absolute",
                    left: cell.col * (cellSize + cellGap),
                    top: cell.row * (cellSize + cellGap),
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 2,
                    background: cell.jobId ? color : "var(--gridline)",
                    outline: crossing ? `2px solid ${WALL_MARK_COLOR[crossing.wall.key] ?? "var(--status-critical)"}` : "none",
                    outlineOffset: 1,
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {hovered && (
        <p className="mt-2 text-xs text-secondary">
          <span className="font-semibold text-primary">{hovered.date}</span>
          {hovered.jobId ? `: ${formatYen(hovered.amount)}` : ": 稼働なし"}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-(--gridline) pt-3 text-xs text-secondary">
        {calendarJobs.map((job) => (
          <div key={job.id} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: jobColors.get(job.id) }} />
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
