"use client";

import type { ActualIncomeRecord } from "@/lib/actualIncomeData";
import { selectOnFocus } from "@/lib/selectOnFocus";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

interface ActualIncomeFormProps {
  records: ActualIncomeRecord[];
  onChange: (records: ActualIncomeRecord[]) => void;
}

export function ActualIncomeForm({ records, onChange }: ActualIncomeFormProps) {
  function update(index: number, patch: Partial<ActualIncomeRecord>) {
    onChange(records.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function remove(index: number) {
    onChange(records.filter((_, i) => i !== index));
  }

  function add() {
    const usedMonths = new Set(records.map((r) => r.month));
    const nextMonth = MONTHS.find((m) => !usedMonths.has(m)) ?? 1;
    onChange(
      [...records, { month: nextMonth, amount: 0 }].sort((a, b) => a.month - b.month),
    );
  }

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">実績を入力</div>
      <div className="flex flex-col gap-2">
        {records.map((record, index) => (
          <div key={index} className="flex flex-col gap-1 border-b border-(--gridline) pb-2 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-2">
              <select
                value={record.month}
                onChange={(e) => update(index, { month: Number(e.target.value) })}
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={record.amount}
                onChange={(e) => update(index, { amount: Number(e.target.value) })}
                onFocus={selectOnFocus}
                className="w-32 rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
              />
              <span className="text-xs text-muted">円（給料のみ）</span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-xs text-muted hover:text-status-critical"
              >
                削除
              </button>
            </div>
            <input
              type="text"
              value={record.note ?? ""}
              onChange={(e) => update(index, { note: e.target.value })}
              placeholder="（任意）予定と差が出た理由など一言メモ"
              className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-xs text-secondary outline-none placeholder:text-muted focus:border-series-1"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 self-start rounded border border-dashed border-(--border-hairline) px-3 py-1.5 text-sm text-secondary hover:border-series-1 hover:text-series-1"
      >
        + 実績を追加
      </button>
    </div>
  );
}
