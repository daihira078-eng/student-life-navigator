import type { DiagnosisResult } from "@/lib/types";
import { formatYen } from "@/lib/format";

export function DiagnosisCard({ result }: { result: DiagnosisResult }) {
  const hasDiff = result.annualDiff !== null && result.annualDiff > 0;

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">{result.label}</span>
        {hasDiff && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              color: "var(--status-good)",
              background: "color-mix(in oklab, var(--status-good) 18%, transparent)",
            }}
          >
            年間 {formatYen(result.annualDiff!)}の差
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-xs text-muted">現状</div>
          <div className="font-medium text-primary">{result.currentLabel}</div>
        </div>
        <div>
          <div className="text-xs text-muted">比較先</div>
          <div className="font-medium text-primary">{result.compareLabel}</div>
        </div>
      </div>

      <p className="mt-2 text-xs text-secondary">{result.note}</p>
      <p className="mt-1 text-xs text-muted">{result.sourceNote}</p>

      {result.fitNote && (
        <div className="mt-3 rounded-md border border-dashed border-series-1 p-3 text-xs">
          <span className="font-medium text-series-1">①現状の評価: </span>
          <span className="text-secondary">{result.fitNote}</span>
        </div>
      )}
    </div>
  );
}
