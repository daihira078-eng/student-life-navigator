"use client";

import type { Job } from "@/lib/types";
import type { ActualShiftRecord } from "@/lib/actualShiftData";
import { detectAllScheduleDrifts } from "@/lib/scheduleDrift";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

interface ScheduleDriftNoticeProps {
  jobs: Job[];
  onChange: (jobs: Job[]) => void;
}

/**
 * /shiftsページで記録した実績(shifts:actualShifts)と、シミュレーターの予定設定(Job.daysPerWeek/
 * hoursPerDay)がズレていたら気づかせる。予定は「仮定」、実績は「事実」という別物の設計原則を
 * 守るため、ここで検出しても絶対に自動では上書きしない。反映するかどうかは本人の操作に委ねる。
 */
export function ScheduleDriftNotice({ jobs, onChange }: ScheduleDriftNoticeProps) {
  const [actualShifts] = useLocalStorageState<ActualShiftRecord[]>("shifts:actualShifts", []);
  const drifts = detectAllScheduleDrifts(jobs, actualShifts);

  if (drifts.length === 0) return null;

  function applyDrift(jobId: string, daysPerWeek: number, hoursPerDay: number) {
    onChange(jobs.map((j) => (j.id === jobId ? { ...j, daysPerWeek, hoursPerDay, weekdays: undefined } : j)));
  }

  return (
    <div className="mb-4 flex flex-col gap-3 border-l-2 border-brand bg-(--brand-soft) px-4 py-3 text-sm">
      {drifts.map((d) => (
        <div key={d.jobId} className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-secondary">
            <span className="font-semibold text-primary">{d.jobName}</span>
            、直近の実績だと週
            <span className="font-semibold text-primary">
              {d.actualDaysPerWeek}日・{d.actualHoursPerDay}時間
            </span>
            ですが、設定は週
            <span className="font-semibold text-primary">
              {d.plannedDaysPerWeek}日・{d.plannedHoursPerDay}時間
            </span>
            になっています。
          </p>
          <button
            type="button"
            onClick={() => applyDrift(d.jobId, d.actualDaysPerWeek, d.actualHoursPerDay)}
            className="shrink-0 rounded-full border border-brand px-3 py-1 text-xs font-semibold text-brand outline-none hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand"
          >
            実績に合わせて更新する
          </button>
        </div>
      ))}
    </div>
  );
}
