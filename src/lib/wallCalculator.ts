import type { DependencyProfile, Job, WallDefinition, WallStatus } from "./types";

const WEEKS_PER_MONTH = 52 / 12;

export const WALLS: WallDefinition[] = [
  {
    key: "incomeTax",
    label: "123万円の壁（所得税・住民税）",
    threshold: 1_230_000,
    appliesTo: () => true,
  },
  {
    key: "socialInsurance",
    label: "130万円の壁（社会保険）",
    threshold: 1_300_000,
    appliesTo: (profile) => profile.socialInsuranceDependent,
  },
];

export function monthlyIncomeOfJob(job: Job): number {
  return job.hourlyWage * job.hoursPerDay * job.daysPerWeek * WEEKS_PER_MONTH;
}

export function totalMonthlyIncome(jobs: Job[]): number {
  return jobs.reduce((sum, job) => sum + monthlyIncomeOfJob(job), 0);
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

/** 1月始まりの暦年で、startMonth未満の月は0円として12ヶ月分の累積収入を返す */
export function cumulativeByMonth(jobs: Job[], startMonth: number): number[] {
  const monthly = totalMonthlyIncome(jobs);
  const result: number[] = [];
  let cumulative = 0;
  for (let month = 1; month <= 12; month++) {
    if (month >= startMonth) {
      cumulative += monthly;
    }
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

export function evaluateWalls(jobs: Job[], profile: DependencyProfile): WallStatus[] {
  const cumulative = cumulativeByMonth(jobs, profile.startMonth);
  const annualProjection = cumulative[11];
  const avgWage = weightedAverageWage(jobs);

  return WALLS.filter((wall) => wall.appliesTo(profile)).map((wall) => {
    const remainingAmount = Math.max(0, wall.threshold - annualProjection);
    const remainingHours = avgWage > 0 ? remainingAmount / avgWage : 0;
    return {
      wall,
      annualProjection,
      remainingAmount,
      remainingHours,
      monthReached: monthReached(cumulative, wall.threshold),
      status: statusOf(annualProjection, wall.threshold),
    };
  });
}
