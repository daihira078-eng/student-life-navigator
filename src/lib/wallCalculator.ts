import type { DependencyProfile, ExcessImpact, Job, WallDefinition, WallStatus } from "./types";

const WEEKS_PER_MONTH = 52 / 12;

/**
 * 123万円: 令和7年度税制改正後の所得税の壁（基礎控除58万+給与所得控除65万）。全員共通。
 * 社会保険の壁: 2025年10月の被扶養者認定基準改正により、19〜23歳(特定扶養親族)は130万円→150万円に
 * 引き上げ済み（日本年金機構 https://www.nenkin.go.jp/oshirase/taisetu/2025/202508/0819.html）。
 * それ以外の年齢は従来通り130万円のまま。
 */
export function getWalls(profile: DependencyProfile): WallDefinition[] {
  const walls: WallDefinition[] = [
    {
      key: "incomeTax",
      label: "123万円の壁（所得税・住民税）",
      threshold: 1_230_000,
    },
  ];

  if (profile.socialInsuranceDependent) {
    const threshold = profile.isSpecificDependent ? 1_500_000 : 1_300_000;
    walls.push({
      key: "socialInsurance",
      label: profile.isSpecificDependent
        ? "150万円の壁（社会保険、19〜23歳・2025年10月改正後）"
        : "130万円の壁（社会保険）",
      threshold,
    });
  }

  return walls;
}

export function monthlyIncomeOfJob(job: Job): number {
  return job.hourlyWage * job.hoursPerDay * job.daysPerWeek * WEEKS_PER_MONTH;
}

export function totalMonthlyIncome(jobs: Job[], month: number): number {
  return jobs
    .filter((job) => job.startMonth <= month)
    .reduce((sum, job) => sum + monthlyIncomeOfJob(job), 0);
}

export function weightedAverageWage(jobs: Job[]): number {
  const totalHours = jobs.reduce((sum, j) => sum + j.hoursPerDay * j.daysPerWeek, 0);
  if (totalHours === 0) return 0;
  const totalWagedHours = jobs.reduce(
    (sum, j) => sum + j.hourlyWage * j.hoursPerDay * j.daysPerWeek,
    0,
  );
  return totalWagedHours / totalHours;
}

/** 1月始まりの暦年で、各バイトの開始月より前は0円として12ヶ月分の累積収入を返す */
export function cumulativeByMonth(jobs: Job[]): number[] {
  const result: number[] = [];
  let cumulative = 0;
  for (let month = 1; month <= 12; month++) {
    cumulative += totalMonthlyIncome(jobs, month);
    result.push(cumulative);
  }
  return result;
}

function monthReached(cumulative: number[], threshold: number): number | null {
  const index = cumulative.findIndex((value) => value >= threshold);
  return index === -1 ? null : index + 1;
}

function statusOf(annualProjection: number, threshold: number): WallStatus["status"] {
  if (annualProjection >= threshold) return "critical";
  if (annualProjection >= threshold * 0.9) return "warning";
  return "good";
}

/**
 * 概算値。所得税は課税所得の最低税率区分(5%)、住民税は一律10%として超過分に掛けて試算。
 * 実際の税額は各種控除の適用状況によって変わるため、あくまで目安として表示する。
 * 社会保険の壁は「税」ではなく、扶養から外れて自分で保険料を払う崖なので別ロジック。
 */
function estimateExcessImpact(wall: WallDefinition, annualProjection: number): ExcessImpact | null {
  const excess = annualProjection - wall.threshold;
  if (excess <= 0) return null;

  if (wall.key === "incomeTax") {
    const amount = excess * 0.05 + excess * 0.1;
    return {
      label: "税負担の目安（所得税+住民税）",
      amount,
      note: "超過分に所得税5%+住民税10%をかけた概算です。実際の税額は各種控除の適用状況で変わります",
    };
  }

  // socialInsurance: 壁を超えると扶養から外れ、収入全体に対して自分で保険料を払う必要が生じる
  return {
    label: "扶養を外れた場合の社会保険料の目安（年間）",
    amount: 190_000,
    note: "壁を境に段階的な負担ではなく、扶養から外れた分そのまま自己負担が発生する『崖』です。金額は年収130万円前後の一般的な目安であり、勤務先の加入状況により変わります",
  };
}

export function evaluateWalls(jobs: Job[], profile: DependencyProfile): WallStatus[] {
  const cumulative = cumulativeByMonth(jobs);
  const annualProjection = cumulative[11];
  const avgWage = weightedAverageWage(jobs);
  const walls = getWalls(profile);

  return walls.map((wall) => {
    const remainingAmount = Math.max(0, wall.threshold - annualProjection);
    const remainingHours = avgWage > 0 ? remainingAmount / avgWage : 0;
    return {
      wall,
      annualProjection,
      remainingAmount,
      remainingHours,
      monthReached: monthReached(cumulative, wall.threshold),
      status: statusOf(annualProjection, wall.threshold),
      excessImpact: estimateExcessImpact(wall, annualProjection),
    };
  });
}
