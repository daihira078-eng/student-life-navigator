"use client";

import type { Job } from "@/lib/types";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

let nextId = 1;
export function createEmptyJob(): Job {
  return {
    id: `job-${nextId++}`,
    name: "",
    hourlyWage: 1200,
    daysPerWeek: 2,
    hoursPerDay: 4,
    startMonth: 1,
    endMonth: null,
    monthlyCommutingAllowance: 0,
  };
}

interface JobFormProps {
  jobs: Job[];
  onChange: (jobs: Job[]) => void;
}

const sliderClass = "h-2 w-full cursor-pointer accent-[var(--series-1)]";

export function JobForm({ jobs, onChange }: JobFormProps) {
  function updateJob(id: string, patch: Partial<Job>) {
    onChange(jobs.map((job) => (job.id === id ? { ...job, ...patch } : job)));
  }

  function removeJob(id: string) {
    onChange(jobs.filter((job) => job.id !== id));
  }

  function addJob() {
    onChange([...jobs, createEmptyJob()]);
  }

  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job, index) => (
        <div
          key={job.id}
          className="rounded-lg border border-(--border-hairline) bg-surface p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-secondary">
              バイト{index + 1}
            </span>
            {jobs.length > 1 && (
              <button
                type="button"
                onClick={() => removeJob(job.id)}
                className="text-sm text-muted hover:text-status-critical"
              >
                削除
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <label className="flex flex-col gap-1 text-xs text-secondary">
              バイト名
              <input
                type="text"
                value={job.name}
                onChange={(e) => updateJob(job.id, { name: e.target.value })}
                placeholder="例: CAZAN珈琲店"
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary">
              時給（円）
              <input
                type="number"
                min={0}
                value={job.hourlyWage}
                onChange={(e) =>
                  updateJob(job.id, { hourlyWage: Number(e.target.value) })
                }
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary">
              通勤手当（円/月）
              <input
                type="number"
                min={0}
                value={job.monthlyCommutingAllowance}
                onChange={(e) =>
                  updateJob(job.id, { monthlyCommutingAllowance: Number(e.target.value) })
                }
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary">
              開始月
              <select
                value={job.startMonth}
                onChange={(e) =>
                  updateJob(job.id, { startMonth: Number(e.target.value) })
                }
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}月〜
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary">
              終了月
              <select
                value={job.endMonth ?? "none"}
                onChange={(e) =>
                  updateJob(job.id, {
                    endMonth: e.target.value === "none" ? null : Number(e.target.value),
                  })
                }
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
              >
                <option value="none">継続中</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    〜{m}月
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-secondary">
              <span className="flex items-center justify-between">
                週の勤務日数
                <span className="font-medium text-primary">{job.daysPerWeek}日</span>
              </span>
              <input
                type="range"
                min={0}
                max={7}
                step={0.5}
                value={job.daysPerWeek}
                onChange={(e) =>
                  updateJob(job.id, { daysPerWeek: Number(e.target.value) })
                }
                className={sliderClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary">
              <span className="flex items-center justify-between">
                1日の勤務時間
                <span className="font-medium text-primary">{job.hoursPerDay}時間</span>
              </span>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={job.hoursPerDay}
                onChange={(e) =>
                  updateJob(job.id, { hoursPerDay: Number(e.target.value) })
                }
                className={sliderClass}
              />
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addJob}
        className="self-start rounded border border-dashed border-(--border-hairline) px-3 py-1.5 text-sm text-secondary hover:border-series-1 hover:text-series-1"
      >
        + バイトを追加
      </button>
    </div>
  );
}
