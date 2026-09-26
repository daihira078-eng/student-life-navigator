import type { WallStatus } from "@/lib/types";
import { formatHours, formatYen } from "@/lib/format";

const STATUS_COLOR: Record<WallStatus["status"], string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

const STATUS_TRACK: Record<WallStatus["status"], string> = {
  good: "color-mix(in oklab, var(--status-good) 18%, transparent)",
  warning: "color-mix(in oklab, var(--status-warning) 18%, transparent)",
  critical: "color-mix(in oklab, var(--status-critical) 18%, transparent)",
};

const STATUS_LABEL: Record<WallStatus["status"], string> = {
  good: "余裕あり",
  warning: "壁に接近中",
  critical: "壁を超える見込み",
};

export function WallGauge({ status }: { status: WallStatus }) {
  const ratio = Math.min(1, status.annualProjection / status.wall.threshold);

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">
          {status.wall.label}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ color: STATUS_COLOR[status.status], background: STATUS_TRACK[status.status] }}
        >
          {STATUS_LABEL[status.status]}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: STATUS_TRACK[status.status] }}>
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${ratio * 100}%`, background: STATUS_COLOR[status.status] }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-xs text-muted">年間見込み</div>
          <div className="font-medium text-primary">{formatYen(status.annualProjection)}</div>
        </div>
        <div>
          <div className="text-xs text-muted">壁まで残り</div>
          <div className="font-medium text-primary">
            {status.remainingAmount > 0 ? formatYen(status.remainingAmount) : "超過"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted">あと働ける時間</div>
          <div className="font-medium text-primary">
            {status.remainingAmount > 0 ? formatHours(status.remainingHours) : "0時間"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted">到達見込み月</div>
          <div className="font-medium text-primary">
            {status.monthReached ? `${status.monthReached}月` : "年内なし"}
          </div>
        </div>
      </div>

      {status.excessImpact && (
        <div
          className="mt-3 rounded-md border border-(--border-hairline) p-3"
          style={{ background: STATUS_TRACK.critical }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-secondary">{status.excessImpact.label}</span>
            <span className="text-sm font-semibold" style={{ color: STATUS_COLOR.critical }}>
              −{formatYen(status.excessImpact.amount)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{status.excessImpact.note}</p>
        </div>
      )}
    </div>
  );
}
