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
          className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-sm font-semibold text-primary outline-none focus:border-series-1"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-muted hover:text-status-critical"
        >
          このシナリオを削除
        </button>
      </div>
      <JobForm jobs={scenario.jobs} onChange={(jobs) => onChange({ ...scenario, jobs })} />
    </div>
  );
}
