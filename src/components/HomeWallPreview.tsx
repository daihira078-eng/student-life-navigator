"use client";

import Link from "next/link";
import { evaluateWalls } from "@/lib/wallCalculator";
import { DEFAULT_JOBS, DEFAULT_PROFILE } from "@/lib/defaultData";
import { ACTUAL_INCOME_2026 } from "@/lib/actualIncomeData";
import { computeAverageErrorRate } from "@/lib/predictionAccuracy";
import { formatHours, formatYen } from "@/lib/format";
import { WallIconMark } from "@/lib/pwaIcon";
import { getJobIcon } from "@/components/icons";
import { buildJobColorMapFromJobs } from "@/lib/jobColors";
import type { WallStatus } from "@/lib/types";

const STATUS_COLOR: Record<WallStatus["status"], string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

const STATUS_BADGE_LABEL: Record<WallStatus["status"], string> = {
  good: "扶養内",
  warning: "要注意",
  critical: "超過",
};

const JOB_COLORS = buildJobColorMapFromJobs(DEFAULT_JOBS);

// 公開ページなので勤務先の実名は出さず、業種がわかる程度にぼかす
const JOB_DISPLAY_NAMES: Record<string, string> = {
  "job-cazan": "喫茶店",
  "job-vexum": "インターン先",
};

const JOB_ICON_BY_ID: Record<string, string | undefined> = Object.fromEntries(
  DEFAULT_JOBS.map((j) => [j.id, j.icon]),
);

/**
 * ホーム画面用の実データプレビュー。説明文だけで機能を語るより、
 * 開発者本人の実際の入力(喫茶店×インターン先)で計算した本物の数字を
 * そのまま見せた方が説得力があるという判断で追加した。架空の利用者数やダミーの
 * インタラクティブデモは使わない(実データだけが持つ説得力を削ぐため)。
 */
export function HomeWallPreview() {
  const walls = evaluateWalls(DEFAULT_JOBS, DEFAULT_PROFILE);
  const errorRate = computeAverageErrorRate(DEFAULT_JOBS, ACTUAL_INCOME_2026);

  // より迫っている方(残り枠が小さい方)の壁を主役にする
  const primary = walls.reduce((a, b) => (b.remainingAmount < a.remainingAmount ? b : a));
  const progressPct = Math.min(100, Math.round((primary.annualProjection / primary.wall.threshold) * 100));
  const manYen = (primary.annualProjection / 10000).toFixed(1);

  return (
    <div className="relative">
      <div className="grid-backdrop pointer-events-none absolute -inset-8 sm:-inset-12" aria-hidden />
      <div className="wall-card-shadow relative border border-(--border-hairline) bg-surface">
        <div className="flex items-center gap-2 border-b border-(--border-hairline) px-4 py-2.5">
          <div className="h-5 w-5 shrink-0 overflow-hidden rounded-sm">
            <WallIconMark size={20} />
          </div>
          <span className="text-xs font-semibold text-secondary">一人暮らし新生活 総合最適化ナビ</span>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">現在の年収見込み</span>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                color: STATUS_COLOR[primary.status],
                background: `color-mix(in oklab, ${STATUS_COLOR[primary.status]} 14%, transparent)`,
              }}
            >
              {STATUS_BADGE_LABEL[primary.status]}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold tabular-nums text-primary">{manYen}</span>
            <span className="text-sm text-muted">万円</span>
          </div>

          <div className="mt-4 h-1.5 w-full bg-(--gridline)">
            <div
              className="h-full"
              style={{ width: `${progressPct}%`, background: "var(--brand)" }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted">
            <span>0円</span>
            <span>{primary.wall.label}</span>
          </div>

          <p className="mt-3 text-sm text-secondary">
            あと<span className="font-semibold text-primary">{formatHours(primary.remainingHours)}</span>
            働けます
          </p>

          <div className="mt-5 border-t border-(--gridline) pt-4">
            <div className="mb-2 text-xs font-semibold text-muted">バイト先</div>
            <div className="flex flex-col">
              {primary.breakdown.map((c) => {
                const Icon = getJobIcon(JOB_ICON_BY_ID[c.jobId]);
                const color = JOB_COLORS.get(c.jobId) ?? "var(--gridline)";
                return (
                  <div
                    key={c.jobId}
                    className="flex items-center gap-3 border-b border-(--gridline) py-2.5 text-sm last:border-b-0"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: `color-mix(in oklab, ${color} 16%, transparent)`,
                        color,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 font-medium text-primary">
                      {JOB_DISPLAY_NAMES[c.jobId] ?? c.jobName}
                    </span>
                    <span className="font-semibold text-primary">{formatYen(c.annualIncome)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="wall-card-shadow absolute -top-4 right-4 flex items-center gap-2 border border-(--border-hairline) bg-surface px-3 py-2 text-xs">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: STATUS_COLOR[primary.status] }}
        >
          !
        </span>
        <span className="text-secondary">
          {primary.wall.label.split("（")[0]}まで
          <strong className="ml-1 text-primary">{formatHours(primary.remainingHours)}</strong>
        </span>
      </div>

      {errorRate !== null && (
        <p className="mt-4 text-center text-xs text-secondary">
          実績と比較した予測誤差率:{" "}
          <span className="font-semibold text-primary">約{Math.round(errorRate * 100)}%</span>
          <span className="text-muted">（実績との答え合わせ機能より）</span>
        </p>
      )}

      <div className="mt-2 text-center">
        <Link href="/simulator" className="text-sm font-medium text-brand hover:opacity-80">
          自分のデータでシミュレーションする →
        </Link>
      </div>
    </div>
  );
}
