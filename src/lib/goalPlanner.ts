import type { ActualIncomeRecord } from "./actualIncomeData";
import type { Job, WallStatus } from "./types";
import { WEEKS_PER_MONTH, totalMonthlyIncomeForWall } from "./wallCalculator";

export interface GoalPlan {
  targetJobId: string;
  targetJobName: string;
  weeklyHourIncrease: number;
  achievableAmount: number; // 壁の制約内で実際に達成できる額
  shortfall: number; // 0なら目標を完全に達成できる。正の値なら壁を超えないと届かない分
  bindingWallLabel: string | null; // 制約になっている壁。shortfallが0ならnull
}

export interface WallProgress {
  wallKey: WallStatus["wall"]["key"];
  wallLabel: string;
  threshold: number;
  blendedTotal: number; // 実績(入力済みの月)＋予測(未入力の月)の合計
  remaining: number; // threshold - blendedTotal (0未満は0)
}

/**
 * 実績が入力されている月はその金額を、入力されていない月は今のシフト設定からの
 * 予測を使って、壁ごとの年間見込み額を合成する。「予測だけ」だと実際に稼いだ分を
 * 無視してしまうため、目標逆算はこの実績込みの数字を基準にする。
 */
export function computeWallProgress(
  jobs: Job[],
  wall: WallStatus["wall"],
  actualIncome: ActualIncomeRecord[],
): WallProgress {
  const actualByMonth = new Map(actualIncome.map((r) => [r.month, r.amount]));
  let blendedTotal = 0;
  for (let month = 1; month <= 12; month++) {
    blendedTotal += actualByMonth.get(month) ?? totalMonthlyIncomeForWall(jobs, month, wall.key);
  }
  return {
    wallKey: wall.key,
    wallLabel: wall.label,
    threshold: wall.threshold,
    blendedTotal,
    remaining: Math.max(0, wall.threshold - blendedTotal),
  };
}

/**
 * 「年内にあといくら稼ぎたいか」から、壁を超えない範囲でどのバイトの週の勤務時間を
 * 増やすのが最も効率的かを逆算する。実績が入力されている月はその金額を使うため、
 * 「これまで実際に稼いだ分」を踏まえた残り枠が基準になる。
 *
 * 追加分の割り当て先には時給が最も高いバイトを選ぶ。同じ金額を稼ぐのに必要な
 * 労働時間が最も短く済み、シフトを増やす負担が一番小さいため。
 * 制約(壁の残り枠)は、対象の複数の壁のうち最も枠が小さいものを基準にする。
 */
export function planGoal(
  jobs: Job[],
  walls: WallStatus[],
  goalAmount: number,
  actualIncome: ActualIncomeRecord[],
): GoalPlan | null {
  if (jobs.length === 0 || walls.length === 0 || goalAmount <= 0) return null;

  const progress = walls.map((w) => computeWallProgress(jobs, w.wall, actualIncome));
  const binding = progress.reduce((a, b) => (b.remaining < a.remaining ? b : a));
  const achievableAmount = Math.min(goalAmount, binding.remaining);
  const shortfall = goalAmount - achievableAmount;

  const targetJob = jobs.reduce((a, b) => (b.hourlyWage > a.hourlyWage ? b : a));
  const activeMonths = (targetJob.endMonth ?? 12) - targetJob.startMonth + 1;
  const weeklyHourIncrease =
    activeMonths > 0 && targetJob.hourlyWage > 0
      ? achievableAmount / (activeMonths * WEEKS_PER_MONTH * targetJob.hourlyWage)
      : 0;

  return {
    targetJobId: targetJob.id,
    targetJobName: targetJob.name || "バイト",
    weeklyHourIncrease,
    achievableAmount,
    shortfall,
    bindingWallLabel: shortfall > 0 ? binding.wallLabel : null,
  };
}
