"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import { selectOnFocus } from "@/lib/selectOnFocus";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function createEmptyJob(): Job {
  return {
    // crypto.randomUUID()を使うのは、モジュール内カウンターだとページを再読み込みするたびに
    // 1から採番し直され、localStorageに保存済みのIDと衝突して2つのバイトが同一ID扱いに
    // なるバグが発生したため(片方を編集すると両方変わってしまう)
    id: `job-${crypto.randomUUID()}`,
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

const fieldClass =
  "rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand";

export function JobForm({ jobs, onChange }: JobFormProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  function updateJob(id: string, patch: Partial<Job>) {
    onChange(jobs.map((job) => (job.id === id ? { ...job, ...patch } : job)));
  }

  function removeJob(id: string) {
    onChange(jobs.filter((job) => job.id !== id));
    setConfirmingDeleteId(null);
  }

  function addJob() {
    onChange([...jobs, createEmptyJob()]);
  }

  function toggleWeekday(job: Job, dow: number) {
    const current = job.weekdays ?? [];
    const next = current.includes(dow)
      ? current.filter((d) => d !== dow)
      : [...current, dow].sort((a, b) => a - b);
    updateJob(job.id, { weekdays: next, daysPerWeek: next.length });
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col">
      <div className="mb-1 flex items-baseline justify-between border-b-2 border-(--text-primary) pb-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-primary">登録中のバイト</h2>
        <span className="text-[11px] text-muted">{jobs.length}件</span>
      </div>
      {jobs.map((job, index) => {
        const expanded = expandedIds.has(job.id);
        const confirmingDelete = confirmingDeleteId === job.id;
        return (
          <div key={job.id} className="border-b border-(--gridline) py-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <input
                type="text"
                value={job.name}
                onChange={(e) => updateJob(job.id, { name: e.target.value })}
                placeholder={`バイト${index + 1}`}
                className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-primary outline-none hover:border-(--border-hairline) focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
              />
              {jobs.length > 1 &&
                (confirmingDelete ? (
                  <span className="flex shrink-0 items-center gap-2 text-xs">
                    <span className="text-secondary">削除する？</span>
                    <button
                      type="button"
                      onClick={() => removeJob(job.id)}
                      className="font-semibold text-status-critical hover:opacity-80"
                    >
                      削除する
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(null)}
                      className="text-muted hover:text-primary"
                    >
                      キャンセル
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(job.id)}
                    className="shrink-0 text-sm text-muted hover:text-status-critical"
                  >
                    削除
                  </button>
                ))}
            </div>

            {/* 必須: これだけで計算が成立する最小セット。日数・時間は「もう分かっている事実」を
                正確に入れる場面なので、連続値を探るスライダーではなく数値入力にしている */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs text-secondary">
                時給（円）
                <input
                  type="number"
                  min={0}
                  value={job.hourlyWage}
                  onChange={(e) =>
                    updateJob(job.id, { hourlyWage: Number(e.target.value) })
                  }
                  onFocus={selectOnFocus}
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-secondary">
                週の勤務日数
                <input
                  type="number"
                  min={0}
                  max={7}
                  step={0.5}
                  value={job.daysPerWeek}
                  disabled={(job.weekdays?.length ?? 0) > 0}
                  onChange={(e) =>
                    updateJob(job.id, { daysPerWeek: Number(e.target.value) })
                  }
                  onFocus={selectOnFocus}
                  className={`${fieldClass} disabled:opacity-50`}
                />
                {(job.weekdays?.length ?? 0) > 0 && (
                  <span className="text-[10px] text-muted">曜日指定から自動計算</span>
                )}
              </label>
              <label className="flex flex-col gap-1 text-xs text-secondary">
                1日の勤務時間
                <input
                  type="number"
                  min={0}
                  max={12}
                  step={0.5}
                  value={job.hoursPerDay}
                  onChange={(e) =>
                    updateJob(job.id, { hoursPerDay: Number(e.target.value) })
                  }
                  onFocus={selectOnFocus}
                  className={fieldClass}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => toggleExpanded(job.id)}
              aria-expanded={expanded}
              aria-controls={`job-details-${job.id}`}
              className="mt-3 rounded text-xs font-medium text-series-1 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
            >
              {expanded ? "− 詳しい設定を閉じる" : "+ もっと詳しく入力する（通勤手当・期間）"}
            </button>

            {/* 推奨: 精度を上げるための追加項目 */}
            {expanded && (
              <div
                id={`job-details-${job.id}`}
                className="mt-3 grid grid-cols-2 gap-3 border-t border-(--border-hairline) pt-3 sm:grid-cols-4"
              >
                <label className="flex flex-col gap-1 text-xs text-secondary">
                  通勤手当（円/月）
                  <input
                    type="number"
                    min={0}
                    value={job.monthlyCommutingAllowance}
                    onChange={(e) =>
                      updateJob(job.id, { monthlyCommutingAllowance: Number(e.target.value) })
                    }
                    onFocus={selectOnFocus}
                    className={fieldClass}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-secondary">
                  開始月
                  <select
                    value={job.startMonth}
                    onChange={(e) =>
                      updateJob(job.id, { startMonth: Number(e.target.value) })
                    }
                    className={fieldClass}
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
                    className={fieldClass}
                  >
                    <option value="none">継続中</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        〜{m}月
                      </option>
                    ))}
                  </select>
                </label>

                <div className="col-span-2 sm:col-span-4">
                  <span className="text-xs text-secondary">
                    稼働曜日を指定する（任意。指定すると壁到達日をカレンダーで確認できます）
                  </span>
                  <div className="mt-1.5 flex gap-2">
                    {WEEKDAY_LABELS.map((label, dow) => {
                      const active = (job.weekdays ?? []).includes(dow);
                      return (
                        <button
                          key={dow}
                          type="button"
                          onClick={() => toggleWeekday(job, dow)}
                          aria-pressed={active}
                          className={`h-12 w-12 rounded-full text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
                            active
                              ? "bg-brand text-white"
                              : "border border-(--border-hairline) text-secondary hover:border-series-1"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={addJob}
        className="mt-4 self-start rounded border border-dashed border-(--border-hairline) px-3 py-1.5 text-sm text-secondary hover:border-series-1 hover:text-series-1"
      >
        + バイトを追加
      </button>
    </div>
  );
}
