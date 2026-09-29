import type { Job, WallStatus } from "./types";
import { WEEKS_PER_MONTH } from "./wallCalculator";

export interface GoalPlan {
  targetJobId: string;
  targetJobName: string;
  weeklyHourIncrease: number;
  achievableAmount: number; // 壁の制約内で実際に達成できる額
  shortfall: number; // 0なら目標を完全に達成できる。正の値なら壁を超えないと届かない分
  bindingWallLabel: string | null; // 制約になっている壁。shortfallが0ならnull
}

/**
 * 「年内にあといくら稼ぎたいか」から、壁を超えない範囲でどのバイトの週の勤務時間を
 * 増やすのが最も効率的かを逆算する。
 *
 * 追加分の割り当て先には時給が最も高いバイトを選ぶ。同じ金額を稼ぐのに必要な
 * 労働時間が最も短く済み、シフトを増やす負担が一番小さいため。
 * 制約(壁の残り枠)は、対象の複数の壁のうち最も枠が小さいものを基準にする。
 */
export function planGoal(jobs: Job[], walls: WallStatus[], goalAmount: number): GoalPlan | null {
  if (jobs.length === 0 || walls.length === 0 || goalAmount <= 0) return null;

  const binding = walls.reduce((a, b) => (b.remainingAmount < a.remainingAmount ? b : a));
  const achievableAmount = Math.min(goalAmount, Math.max(0, binding.remainingAmount));
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
    bindingWallLabel: shortfall > 0 ? binding.wall.label : null,
  };
}
