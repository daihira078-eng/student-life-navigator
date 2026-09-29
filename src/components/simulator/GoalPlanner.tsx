"use client";

import type { Job, WallStatus } from "@/lib/types";
import type { ActualIncomeRecord } from "@/lib/actualIncomeData";
import { computeWallProgress, planGoal } from "@/lib/goalPlanner";
import { formatHours, formatYen } from "@/lib/format";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { selectOnFocus } from "@/lib/selectOnFocus";

interface GoalPlannerProps {
  jobs: Job[];
  walls: WallStatus[];
  actualIncome: ActualIncomeRecord[];
}

export function GoalPlanner({ jobs, walls, actualIncome }: GoalPlannerProps) {
  const [goalAmount, setGoalAmount] = useLocalStorageState<number>("simulator:goalAmount", 50000);
  const plan = planGoal(jobs, walls, goalAmount, actualIncome);
  const progress = walls.map((w) => computeWallProgress(jobs, w.wall, actualIncome));

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-1 text-sm font-semibold text-primary">目標から逆算</div>
      <p className="mb-3 text-xs text-secondary">
        「実績との答え合わせ」タブに入力済みの月はその実績を、未入力の月は今のシフト設定からの予測を使って、壁までの残り枠を計算します。そこから「年内にあといくら稼ぎたいか」を入れると、それぞれのバイト1つだけで賄うとしたら週の勤務時間をどれだけ増やせばいいかを全パターン並べます。
      </p>

      {progress.length > 0 && (
        <div className="mb-4 flex flex-col gap-1.5 rounded-md bg-(--page-plane) p-3 text-xs text-secondary">
          {progress.map((p) => (
            <div key={p.wallKey} className="flex items-center justify-between gap-2">
              <span>{p.wallLabel.split("（")[0]}（実績＋予測）</span>
              <span className="tabular-nums">
                <span className="font-semibold text-primary">{formatYen(p.blendedTotal)}</span>
                {" / "}
                {formatYen(p.threshold)}
                <span className="ml-1 text-muted">（残り{formatYen(p.remaining)}）</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <span className="text-secondary">追加で稼ぎたい金額</span>
        <input
          type="number"
          min={0}
          value={goalAmount}
          onChange={(e) => setGoalAmount(Number(e.target.value))}
          onFocus={selectOnFocus}
          className="w-32 rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
        />
        <span className="text-xs text-muted">円</span>
      </label>

      {plan && (
        <div className="mt-4 border-t border-(--gridline) pt-4 text-sm text-secondary">
          {plan.shortfall > 0 && (
            <p className="mb-3">
              <span className="font-semibold text-status-critical">{plan.bindingWallLabel}</span>
              の制約により、目標
              <span className="font-semibold text-primary">{formatYen(goalAmount)}</span>
              のうち
              <span className="font-semibold text-status-critical">{formatYen(plan.shortfall)}分</span>
              は壁を超えないと達成できません。壁以内で達成できる最大額は
              <span className="font-semibold text-primary">{formatYen(plan.achievableAmount)}</span>
              です。
            </p>
          )}

          <p className="mb-2 text-xs text-muted">
            {formatYen(plan.achievableAmount)}を、それぞれ1つのバイトだけで賄う場合に必要な週の増加時間（時給が高い順）
          </p>
          <ul className="flex flex-col gap-1.5">
            {plan.allocations.map((a) => (
              <li
                key={a.jobId}
                className="flex items-center justify-between gap-2 rounded-md bg-(--page-plane) px-3 py-2"
              >
                <span className="font-medium text-primary">
                  {a.jobName}
                  <span className="ml-1.5 text-xs text-muted">（時給{formatYen(a.hourlyWage)}）</span>
                </span>
                <span className="font-semibold text-brand">
                  週約{formatHours(a.weeklyHourIncrease)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
