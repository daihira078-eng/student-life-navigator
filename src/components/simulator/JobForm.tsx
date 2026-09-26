"use client";

import type { Job } from "@/lib/types";

let nextId = 1;
export function createEmptyJob(): Job {
  return {
    id: `job-${nextId++}`,
    name: "",
    hourlyWage: 1200,
    daysPerWeek: 2,
    hoursPerDay: 4,
  };
}

interface JobFormProps {
  jobs: Job[];
  onChange: (jobs: Job[]) => void;
}

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              週の勤務日数
              <input
                type="number"
                min={0}
                max={7}
                value={job.daysPerWeek}
                onChange={(e) =>
                  updateJob(job.id, { daysPerWeek: Number(e.target.value) })
                }
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-secondary">
              1日の勤務時間
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={job.hoursPerDay}
                onChange={(e) =>
                  updateJob(job.id, { hoursPerDay: Number(e.target.value) })
                }
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
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
