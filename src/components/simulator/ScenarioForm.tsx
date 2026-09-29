"use client";

import type { Scenario } from "@/lib/types";
import { JobForm } from "./JobForm";

interface ScenarioFormProps {
  scenario: Scenario;
  onChange: (scenario: Scenario) => void;
  onRemove: () => void;
}

export function ScenarioForm({ scenario, onChange, onRemove }: ScenarioFormProps) {
  return (
    <div className="rounded-lg border border-dashed border-series-2 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <input
          type="text"
          value={scenario.name}
          onChange={(e) => onChange({ ...scenario, name: e.target.value })}
          aria-label="シナリオ名"
          className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-sm font-semibold text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button
          type="button"
          onClick={onRemove}
          className="rounded text-xs text-muted outline-none hover:text-status-critical focus-visible:ring-2 focus-visible:ring-brand"
        >
          このシナリオを削除
        </button>
      </div>
      <JobForm jobs={scenario.jobs} onChange={(jobs) => onChange({ ...scenario, jobs })} />
    </div>
  );
}
