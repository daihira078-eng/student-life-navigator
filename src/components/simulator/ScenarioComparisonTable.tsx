import type { DependencyProfile, Scenario } from "@/lib/types";
import { evaluateWalls } from "@/lib/wallCalculator";
import { formatYen } from "@/lib/format";

const STATUS_COLOR: Record<"good" | "warning" | "critical", string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

interface ScenarioComparisonTableProps {
  scenarios: Scenario[];
  profile: DependencyProfile;
}

export function ScenarioComparisonTable({ scenarios, profile }: ScenarioComparisonTableProps) {
  const results = scenarios.map((s) => ({ scenario: s, walls: evaluateWalls(s.jobs, profile) }));
  const wallKeys = results[0]?.walls.map((w) => w.wall.key) ?? [];

  return (
    <div className="overflow-x-auto rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">シナリオ比較</div>
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="pb-2 pr-4">シナリオ</th>
            {wallKeys.map((key) => (
              <th key={key} className="pb-2 pr-4">
                {results[0].walls.find((w) => w.wall.key === key)?.wall.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map(({ scenario, walls }) => (
            <tr key={scenario.id} className="border-t border-(--border-hairline)">
              <td className="py-2 pr-4 font-medium text-primary">{scenario.name}</td>
              {walls.map((w) => (
                <td key={w.wall.key} className="py-2 pr-4">
                  <span className="font-medium text-primary">{formatYen(w.annualProjection)}</span>
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      color: STATUS_COLOR[w.status],
                      background: `color-mix(in oklab, ${STATUS_COLOR[w.status]} 18%, transparent)`,
                    }}
                  >
                    {w.status === "good" ? "余裕" : w.status === "warning" ? "接近" : "超過"}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
