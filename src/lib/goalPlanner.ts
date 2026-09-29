import type { ActualIncomeRecord } from "./actualIncomeData";
import type { Job, WallStatus } from "./types";
import { WEEKS_PER_MONTH, totalMonthlyIncomeForWall } from "./wallCalculator";

export interface Goal {
  id: string;
  name: string;
  amount: number;
  targetMonth: number | null; // nullなら年内(12月末)が期限
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

export interface JobAllocation {
  jobId: string;
  jobName: string;
  hourlyWage: number;
  weeklyHourIncrease: number | null; // nullは指定期間内ではこのバイトだけでは達成不可
}

export interface EvenSplitAllocation extends JobAllocation {
  shareAmount: number; // このバイトが担当する金額(均等割り)
}

export interface GoalPlan {
  achievableAmount: number; // 壁の制約内で実際に達成できる額
  shortfall: number; // 0なら目標を完全に達成できる。正の値なら壁を超えないと届かない分
  bindingWallLabel: string | null; // 制約になっている壁。shortfallが0ならnull
  allocations: JobAllocation[]; // 「このバイト1つだけで賄うなら」を時給が高い順に並べたもの
  evenSplit: EvenSplitAllocation[] | null; // 複数バイトある場合のみ、全バイトに均等配分した場合
}

/**
 * 「今月から指定した月末まで」の実働期間を求める。バイトの稼働期間(startMonth〜endMonth)と
 * 目標の期限(targetMonth)の両方に収まる範囲。期限が既に過ぎている等で範囲が成立しない場合はnull。
 */
function activeWindow(
  job: Job,
  targetMonth: number | null,
  currentMonth: number,
): { start: number; end: number } | null {
  const jobEnd = job.endMonth ?? 12;
  const windowEnd = targetMonth ? Math.min(targetMonth, jobEnd) : jobEnd;
  const windowStart = Math.max(job.startMonth, currentMonth);
  if (windowEnd < windowStart) return null;
  return { start: windowStart, end: windowEnd };
}

function computeAllocation(
  job: Job,
  amount: number,
  targetMonth: number | null,
  currentMonth: number,
): JobAllocation {
  const window = activeWindow(job, targetMonth, currentMonth);
  const base = { jobId: job.id, jobName: job.name || "バイト", hourlyWage: job.hourlyWage };
  if (!window || job.hourlyWage <= 0) {
    return { ...base, weeklyHourIncrease: null };
  }
  const months = window.end - window.start + 1;
  return { ...base, weeklyHourIncrease: amount / (months * WEEKS_PER_MONTH * job.hourlyWage) };
}

/**
 * 「（期限までに）あといくら稼ぎたいか」から、壁を超えない範囲で達成できる額を求め、
 * 「そのバイト1つだけで賄うとしたら週の勤務時間をどれだけ増やす必要があるか」を
 * 全バイト分並べる。1つに絞らないのは、時給以外の事情(シフトの空き・通いやすさ等)で
 * どのバイトを増やすか選ぶのは本人次第なため。バイトが複数ある場合は、全バイトに
 * 均等に金額を割り振った場合のパターンも合わせて返す。
 *
 * 実績が入力されている月はその金額を使うため、「これまで実際に稼いだ分」を踏まえた
 * 残り枠が基準になる。期限(targetMonth)を指定した場合、必要時間は「今月〜期限月」に
 * 絞って計算するため、期限が近いほど週あたりの必要時間は多くなる。
 */
export function planGoal(
  jobs: Job[],
  walls: WallStatus[],
  goalAmount: number,
  actualIncome: ActualIncomeRecord[],
  targetMonth: number | null = null,
  now: Date = new Date(),
): GoalPlan | null {
  if (jobs.length === 0 || walls.length === 0 || goalAmount <= 0) return null;

  const progress = walls.map((w) => computeWallProgress(jobs, w.wall, actualIncome));
  const binding = progress.reduce((a, b) => (b.remaining < a.remaining ? b : a));
  const achievableAmount = Math.min(goalAmount, binding.remaining);
  const shortfall = goalAmount - achievableAmount;
  const currentMonth = now.getMonth() + 1;

  const allocations = jobs
    .map((job) => computeAllocation(job, achievableAmount, targetMonth, currentMonth))
    .sort((a, b) => b.hourlyWage - a.hourlyWage);

  let evenSplit: EvenSplitAllocation[] | null = null;
  if (jobs.length > 1) {
    const shareAmount = achievableAmount / jobs.length;
    evenSplit = jobs.map((job) => ({
      ...computeAllocation(job, shareAmount, targetMonth, currentMonth),
      shareAmount,
    }));
  }

  return {
    achievableAmount,
    shortfall,
    bindingWallLabel: shortfall > 0 ? binding.wallLabel : null,
    allocations,
    evenSplit,
  };
}

/**
 * 目標金額からの逆算とは逆方向：「週にH時間増やせるなら、指定期間でいくら稼げるか」を計算する。
 * 時間の方が制約になっている場合(シフトの空きが週◯時間までしかない等)に使う。
 */
export function estimateEarnings(
  job: Job,
  weeklyHourIncrease: number,
  targetMonth: number | null = null,
  now: Date = new Date(),
): number | null {
  const currentMonth = now.getMonth() + 1;
  const window = activeWindow(job, targetMonth, currentMonth);
  if (!window) return null;
  const months = window.end - window.start + 1;
  return weeklyHourIncrease * WEEKS_PER_MONTH * months * job.hourlyWage;
}
