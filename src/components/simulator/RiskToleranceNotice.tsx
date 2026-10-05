"use client";

import type { DependencyProfile, WallStatus } from "@/lib/types";
import type { ActualIncomeRecord } from "@/lib/actualIncomeData";
import { suggestWarningRatio } from "@/lib/riskToleranceSuggestion";

interface RiskToleranceNoticeProps {
  profile: DependencyProfile;
  walls: WallStatus[];
  actualIncome: ActualIncomeRecord[];
  onChange: (profile: DependencyProfile) => void;
}

/**
 * 実績との答え合わせ(actualIncome)が溜まってきたら、本人の実際の稼ぎ方のペースから
 * 警告ラインの設定(堅実派/標準/攻める派)を推定して提案する。ScheduleDriftNoticeと同じく、
 * 気づかせるだけで自動では反映しない(本人がボタンを押して初めてprofileが変わる)。
 */
export function RiskToleranceNotice({ profile, walls, actualIncome, onChange }: RiskToleranceNoticeProps) {
  const incomeTaxWall = walls.find((w) => w.wall.key === "incomeTax");
  if (!incomeTaxWall) return null;

  const suggestion = suggestWarningRatio(actualIncome, incomeTaxWall.wall.threshold);
  if (!suggestion) return null;

  const currentRatio = profile.warningRatio ?? 0.9;
  if (suggestion.suggestedRatio === currentRatio) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-l-2 border-brand bg-(--brand-soft) px-4 py-3 text-sm">
      <p className="text-secondary">
        これまでの実績だと、壁の月割りペースに対して平均
        <span className="font-semibold text-primary">{Math.round(suggestion.averagePaceRatio * 100)}%</span>
        の水準で推移しています。
        <span className="font-semibold text-primary">{suggestion.label}</span>
        寄りの設定が近そうです。
      </p>
      <button
        type="button"
        onClick={() => onChange({ ...profile, warningRatio: suggestion.suggestedRatio })}
        className="shrink-0 rounded-full border border-brand px-3 py-1 text-xs font-semibold text-brand outline-none hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand"
      >
        この設定にする
      </button>
    </div>
  );
}
