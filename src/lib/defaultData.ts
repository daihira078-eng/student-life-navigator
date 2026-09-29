import type { DependencyProfile, Job } from "./types";

/**
 * 開発者本人の実データ(CAZAN珈琲店・VEXUM)。シミュレーターの初期値であると同時に、
 * ホーム画面のミニプレビューにもそのまま使う。
 */
export const DEFAULT_JOBS: Job[] = [
  {
    id: "job-cazan",
    name: "CAZAN珈琲店",
    hourlyWage: 1190,
    daysPerWeek: 2.5,
    hoursPerDay: 4,
    startMonth: 4,
    endMonth: null,
    monthlyCommutingAllowance: 0,
  },
  {
    id: "job-vexum",
    name: "VEXUM",
    hourlyWage: 1300,
    daysPerWeek: 1,
    hoursPerDay: 3.5,
    startMonth: 8,
    endMonth: null,
    monthlyCommutingAllowance: 0,
  },
];

export const DEFAULT_PROFILE: DependencyProfile = {
  currentAge: 19,
  socialInsuranceDependent: true,
  targetYear: new Date().getFullYear(),
};
