"use client";

import type { FixedCost } from "@/lib/types";

let nextId = 1;
export function createEmptyFixedCost(): FixedCost {
  return { id: `cost-${nextId++}`, name: "", monthlyAmount: 0 };
}

interface FixedCostFormProps {
  fixedCosts: FixedCost[];
  onChange: (fixedCosts: FixedCost[]) => void;
}

export function FixedCostForm({ fixedCosts, onChange }: FixedCostFormProps) {
  function update(id: string, patch: Partial<FixedCost>) {
    onChange(fixedCosts.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function remove(id: string) {
    onChange(fixedCosts.filter((c) => c.id !== id));
  }

  function add() {
    onChange([...fixedCosts, createEmptyFixedCost()]);
  }

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">月々の固定費・サブスク</div>
      <div className="flex flex-col gap-2">
        {fixedCosts.map((cost) => (
          <div key={cost.id} className="flex items-center gap-2">
            <input
              type="text"
              value={cost.name}
              onChange={(e) => update(cost.id, { name: e.target.value })}
              placeholder="例: Netflix"
              className="flex-1 rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
            />
            <input
              type="number"
              min={0}
              value={cost.monthlyAmount}
              onChange={(e) => update(cost.id, { monthlyAmount: Number(e.target.value) })}
              className="w-28 rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
            />
            <span className="text-xs text-muted">円/月</span>
            <button
              type="button"
              onClick={() => remove(cost.id)}
              className="text-xs text-muted hover:text-status-critical"
            >
              削除
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 self-start rounded border border-dashed border-(--border-hairline) px-3 py-1.5 text-sm text-secondary hover:border-series-1 hover:text-series-1"
      >
        + 固定費を追加
      </button>
    </div>
  );
}
