import type { ActualIncomeRecord } from "./actualIncomeData";

const MIN_MONTHS = 3; // 実績が薄すぎると提案の根拠にしない(scheduleDrift.tsと同じ考え方)
const CONSERVATIVE_RATIO = 0.8;
const STANDARD_RATIO = 0.9;
const AGGRESSIVE_RATIO = 0.95;
const CONSERVATIVE_PACE_BELOW = 0.75; // 月平均ペースが壁の月割り額の75%未満→堅実派寄り
const AGGRESSIVE_PACE_ABOVE = 0.95; // 95%以上→攻める派寄り

export interface RiskToleranceSuggestion {
  suggestedRatio: number;
  label: "堅実派" | "標準" | "攻める派";
  averagePaceRatio: number; // 参考表示用(壁の月割り額に対する実績の平均比率)
}

/**
 * 実績月収が「壁に年度末ちょうど到達するペース(閾値÷12)」に対して平均してどれくらいの
 * 水準で推移しているかを見て、堅実派/標準/攻める派のどれが近いかを提案する。
 * 累計額ではなく月ごとの比率の平均を使うのは、バイトを始めた月が年の途中でも
 * (例: 4月開始)、それだけで「堅実派」側に偏って判定されるのを避けるため。
 * 自動では確定しない(他のパーソナライズ機能と同じく、気づかせて本人の操作に委ねる)。
 */
export function suggestWarningRatio(
  actualIncome: ActualIncomeRecord[],
  wallThreshold: number,
): RiskToleranceSuggestion | null {
  const monthsWithData = actualIncome.filter((r) => r.amount > 0);
  if (monthsWithData.length < MIN_MONTHS) return null;

  const monthlyPace = wallThreshold / 12;
  if (monthlyPace <= 0) return null;

  const averagePaceRatio =
    monthsWithData.reduce((sum, r) => sum + r.amount / monthlyPace, 0) / monthsWithData.length;

  if (averagePaceRatio < CONSERVATIVE_PACE_BELOW) {
    return { suggestedRatio: CONSERVATIVE_RATIO, label: "堅実派", averagePaceRatio };
  }
  if (averagePaceRatio >= AGGRESSIVE_PACE_ABOVE) {
    return { suggestedRatio: AGGRESSIVE_RATIO, label: "攻める派", averagePaceRatio };
  }
  return { suggestedRatio: STANDARD_RATIO, label: "標準", averagePaceRatio };
}
