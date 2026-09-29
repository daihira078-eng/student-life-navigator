"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import {
  type ActualShiftRecord,
  clearRecord,
  findRecord,
  getPatternHours,
  upsertRecord,
} from "@/lib/actualShiftData";
import { buildJobColorMapFromJobs } from "@/lib/jobColors";
import { formatYen } from "@/lib/format";
import { selectOnFocus } from "@/lib/selectOnFocus";

interface ActualShiftCalendarProps {
  jobs: Job[];
  records: ActualShiftRecord[];
  onChange: (records: ActualShiftRecord[]) => void;
  year: number;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type DayStatus = "worked" | "skipped" | "unlogged" | "none";

export function ActualShiftCalendar({ jobs, records, onChange, year }: ActualShiftCalendarProps) {
  const patternJobs = jobs.filter((j) => j.weekdays && j.weekdays.length > 0);
  const currentRealMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(currentRealMonth);
  const [selected, setSelected] = useState<string | null>(null);
  const [customHours, setCustomHours] = useState<Record<string, string>>({});

  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-(--border-hairline) p-6 text-sm text-muted">
        シミュレーターでバイトを登録すると、ここで実際に働いた日を記録できます。
      </div>
    );
  }

  const jobColors = buildJobColorMapFromJobs(jobs);

  function statusOf(job: Job, date: string): DayStatus {
    const record = findRecord(records, job.id, date);
    if (record) return record.hours > 0 ? "worked" : "skipped";
    return getPatternHours(job, date) > 0 ? "unlogged" : "none";
  }

  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const cells: { date: string; day: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d });
  }

  // 表示中の月のサマリー(予定 vs 実績)
  let plannedYen = 0;
  let plannedDays = 0;
  let actualYen = 0;
  let loggedDays = 0;
  for (const cell of cells) {
    for (const job of jobs) {
      const pattern = getPatternHours(job, cell.date);
      if (pattern > 0) {
        plannedYen += pattern * job.hourlyWage;
        plannedDays += 1;
      }
      const record = findRecord(records, job.id, cell.date);
      if (record) {
        loggedDays += 1;
        actualYen += record.hours * job.hourlyWage;
      }
    }
  }

  function handleQuickAction(jobId: string, date: string, action: "planned" | "skipped") {
    const job = jobs.find((j) => j.id === jobId);
    const hours = action === "planned" ? getPatternHours(job!, date) : 0;
    onChange(upsertRecord(records, jobId, date, hours));
  }

  function handleCustomHoursSubmit(jobId: string, date: string) {
    const key = `${jobId}:${date}`;
    const value = Number(customHours[key]);
    if (Number.isNaN(value) || value < 0) return;
    onChange(upsertRecord(records, jobId, date, value));
  }

  function handleClear(jobId: string, date: string) {
    onChange(clearRecord(records, jobId, date));
  }

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
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

      <p className="mb-4 text-xs text-secondary">
        予定: <span className="font-semibold text-primary">{formatYen(plannedYen)}</span>（
        {plannedDays}日） / 実績記録: <span className="font-semibold text-primary">{formatYen(actualYen)}</span>
        （{loggedDays}日分記録済み）
      </p>

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
          const isSelected = selected === cell.date;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => setSelected((s) => (s === cell.date ? null : cell.date))}
              aria-pressed={isSelected}
              className={`flex aspect-square flex-col items-start rounded-md border p-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
                isSelected ? "border-brand" : "border-(--border-hairline) hover:border-series-1"
              }`}
            >
              <span className="text-[11px] text-muted">{cell.day}</span>
              <div className="mt-auto flex flex-wrap gap-0.5">
                {jobs.map((job) => {
                  const status = statusOf(job, cell.date);
                  if (status === "none") return null;
                  const color = jobColors.get(job.id) ?? "var(--gridline)";
                  if (status === "worked") {
                    return <span key={job.id} className="h-2 w-2 rounded-full" style={{ background: color }} />;
                  }
                  if (status === "skipped") {
                    return (
                      <span
                        key={job.id}
                        className="h-2 w-2 rounded-full border border-(--border-hairline)"
                        style={{ background: "transparent" }}
                      />
                    );
                  }
                  // unlogged: 予定はあるがまだ記録していない
                  return (
                    <span
                      key={job.id}
                      className="h-2 w-2 rounded-full border-2 border-dotted"
                      style={{ borderColor: color }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-5 flex flex-col gap-3 border-t border-(--gridline) pt-4">
          <div className="text-sm font-semibold text-primary">{selected}</div>
          {patternJobs.length === 0 && jobs.length > 0 && (
            <p className="text-xs text-muted">
              シミュレーターで稼働曜日を指定していないバイトも、下から手動で記録できます。
            </p>
          )}
          {jobs.map((job) => {
            const pattern = getPatternHours(job, selected);
            const record = findRecord(records, job.id, selected);
            const key = `${job.id}:${selected}`;
            return (
              <div key={job.id} className="rounded-md bg-(--page-plane) p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-primary">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: jobColors.get(job.id) }}
                    />
                    {job.name || "バイト"}
                  </span>
                  <span className="text-xs text-muted">
                    {record ? `記録: ${record.hours}時間` : pattern > 0 ? `予定: ${pattern}時間（未記録）` : "予定なし"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {pattern > 0 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAction(job.id, selected, "planned")}
                      className="rounded border border-(--border-hairline) px-2.5 py-1 text-xs text-secondary outline-none hover:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      予定通り（{pattern}時間）
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleQuickAction(job.id, selected, "skipped")}
                    className="rounded border border-(--border-hairline) px-2.5 py-1 text-xs text-secondary outline-none hover:border-status-critical focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    休んだ
                  </button>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="時間"
                      value={customHours[key] ?? ""}
                      onFocus={selectOnFocus}
                      onChange={(e) => setCustomHours((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-16 rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-xs text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={() => handleCustomHoursSubmit(job.id, selected)}
                      className="rounded border border-(--border-hairline) px-2.5 py-1 text-xs text-secondary outline-none hover:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      時間を記録
                    </button>
                  </div>
                  {record && (
                    <button
                      type="button"
                      onClick={() => handleClear(job.id, selected)}
                      className="rounded px-2.5 py-1 text-xs text-muted outline-none hover:text-status-critical focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      記録を消す
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-(--gridline) pt-4 text-xs text-secondary">
        {jobs.map((job) => (
          <div key={job.id} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: jobColors.get(job.id) }} />
            {job.name || "バイト"}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-dotted border-muted" />
          予定あり・未記録
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-(--border-hairline)" />
          休んだ
        </div>
      </div>
    </div>
  );
}
