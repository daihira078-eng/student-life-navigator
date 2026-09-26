"use client";

import { useState } from "react";
import type { FixedCost } from "@/lib/types";
import { SUBSCRIPTION_CATALOG } from "@/lib/subscriptionCatalog";

let nextId = 1;
export function createEmptyFixedCost(): FixedCost {
  return { id: `cost-${nextId++}`, name: "", monthlyAmount: 0 };
}

interface FixedCostFormProps {
  fixedCosts: FixedCost[];
  onChange: (fixedCosts: FixedCost[]) => void;
}

const selectClass =
  "rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1";

export function FixedCostForm({ fixedCosts, onChange }: FixedCostFormProps) {
  const [genreId, setGenreId] = useState(SUBSCRIPTION_CATALOG[0].id);
  const genre = SUBSCRIPTION_CATALOG.find((g) => g.id === genreId)!;
  const [serviceId, setServiceId] = useState(genre.services[0].id);
  const service = genre.services.find((s) => s.id === serviceId) ?? genre.services[0];
  const [planIndex, setPlanIndex] = useState(0);
  const plan = service.plans[planIndex] ?? service.plans[0];

  function handleGenreChange(nextGenreId: string) {
    const nextGenre = SUBSCRIPTION_CATALOG.find((g) => g.id === nextGenreId)!;
    setGenreId(nextGenreId);
    setServiceId(nextGenre.services[0].id);
    setPlanIndex(0);
  }

  function handleServiceChange(nextServiceId: string) {
    const nextService = genre.services.find((s) => s.id === nextServiceId)!;
    setServiceId(nextServiceId);
    setPlanIndex(0);
    void nextService;
  }

  function addFromCatalog() {
    onChange([
      ...fixedCosts,
      { id: `cost-${nextId++}`, name: `${service.name}（${plan.name}）`, monthlyAmount: plan.monthlyAmount },
    ]);
  }

  function update(id: string, patch: Partial<FixedCost>) {
    onChange(fixedCosts.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function remove(id: string) {
    onChange(fixedCosts.filter((c) => c.id !== id));
  }

  function addBlank() {
    onChange([...fixedCosts, createEmptyFixedCost()]);
  }

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">月々の固定費・サブスク</div>

      <div className="mb-4 rounded-md border border-dashed border-(--border-hairline) p-3">
        <div className="mb-2 text-xs text-muted">候補から追加（2026年9月時点の料金）</div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={genreId} onChange={(e) => handleGenreChange(e.target.value)} className={selectClass}>
            {SUBSCRIPTION_CATALOG.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <select value={serviceId} onChange={(e) => handleServiceChange(e.target.value)} className={selectClass}>
            {genre.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={planIndex}
            onChange={(e) => setPlanIndex(Number(e.target.value))}
            className={selectClass}
          >
            {service.plans.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name}（{p.monthlyAmount.toLocaleString()}円/月）
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addFromCatalog}
            className="rounded bg-series-1 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            追加
          </button>
        </div>
      </div>

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
        onClick={addBlank}
        className="mt-3 self-start rounded border border-dashed border-(--border-hairline) px-3 py-1.5 text-sm text-secondary hover:border-series-1 hover:text-series-1"
      >
        + カタログにないものを手入力で追加
      </button>
    </div>
  );
}
