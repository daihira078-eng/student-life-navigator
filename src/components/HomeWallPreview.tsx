"use client";

import Link from "next/link";
import { evaluateWalls } from "@/lib/wallCalculator";
import { DEFAULT_JOBS, DEFAULT_PROFILE } from "@/lib/defaultData";
import { ACTUAL_INCOME_2026 } from "@/lib/actualIncomeData";
import { computeAverageErrorRate } from "@/lib/predictionAccuracy";
import { AnimatedRing } from "@/components/simulator/AnimatedRing";
import type { WallStatus } from "@/lib/types";

const STATUS_COLOR: Record<WallStatus["status"], string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

const STATUS_LABEL: Record<WallStatus["status"], string> = {
  good: "余裕あり",
  warning: "壁に接近中",
  critical: "壁を超える見込み",
};

const JOB_COLORS: Record<string, string> = {
  "job-cazan": "var(--series-2)",
  "job-vexum": "var(--series-4)",
};

// 公開ページなので勤務先の実名は出さず、業種がわかる程度にぼかす
const JOB_DISPLAY_NAMES: Record<string, string> = {
  "job-cazan": "喫茶店",
  "job-vexum": "インターン先",
};

/**
 * ホーム画面用の実データプレビュー。説明文だけで機能を語るより、
 * 開発者本人の実際の入力(喫茶店×インターン先)で計算した本物のリングを
 * そのまま見せた方が説得力があるという判断で追加した。
 */
export function HomeWallPreview() {
  const walls = evaluateWalls(DEFAULT_JOBS, DEFAULT_PROFILE);
  const errorRate = computeAverageErrorRate(DEFAULT_JOBS, ACTUAL_INCOME_2026);

  return (
    <div className="rounded-2xl border border-(--border-hairline) bg-surface p-6 shadow-sm">
      <p className="text-center text-xs text-muted">
        開発者本人の実データ（喫茶店 × インターン先、{DEFAULT_PROFILE.targetYear}年）
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-10">
        {walls.map((w) => (
          <AnimatedRing
            key={w.wall.key}
            segments={w.breakdown.map((c) => ({
              jobName: JOB_DISPLAY_NAMES[c.jobId] ?? c.jobName,
              color: JOB_COLORS[c.jobId] ?? "var(--gridline)",
              annualIncome: c.annualIncome,
            }))}
            threshold={w.wall.threshold}
            status={w.status}
            pctColor={STATUS_COLOR[w.status]}
            label={w.wall.label}
            sub={STATUS_LABEL[w.status]}
          />
        ))}
      </div>

      {errorRate !== null && (
        <p className="mt-5 text-center text-sm text-secondary">
          実績と比較した予測誤差率:{" "}
          <span className="font-semibold text-primary">約{Math.round(errorRate * 100)}%</span>
          <span className="text-xs text-muted">（実績との答え合わせ機能より）</span>
        </p>
      )}

      <div className="mt-4 text-center">
        <Link href="/simulator" className="text-sm font-medium text-brand hover:opacity-80">
          自分のデータでシミュレーションする →
        </Link>
      </div>
    </div>
  );
}
