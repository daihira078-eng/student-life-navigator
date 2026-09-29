import type { Job } from "./types";
import type { ActualIncomeRecord } from "./actualIncomeData";
import { totalMonthlyIncomeForWall } from "./wallCalculator";

/**
 * 「予測」と「実績」の平均誤差率を計算する。ActualComparisonChartの表示と
 * ホーム画面の統計表示の両方で、同じ数値を同じロジックで出すために共通化した。
 */
export function computeAverageErrorRate(jobs: Job[], actualIncome: ActualIncomeRecord[]): number | null {
  const valid = actualIncome
    .map((record) => ({
      predicted: totalMonthlyIncomeForWall(jobs, record.month, "incomeTax"),
      actual: record.amount,
    }))
    .filter((d) => d.actual > 0);

  if (valid.length === 0) return null;

  return (
    valid.reduce((sum, d) => sum + Math.abs(d.predicted - d.actual) / d.actual, 0) / valid.length
  );
}
