import { describe, expect, it } from "vitest";
import { planGoal } from "./goalPlanner";
import { evaluateWalls } from "./wallCalculator";
import type { DependencyProfile, Job } from "./types";

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    name: "テストバイト",
    hourlyWage: 1000,
    daysPerWeek: 1,
    hoursPerDay: 2,
    startMonth: 1,
    endMonth: null,
    monthlyCommutingAllowance: 0,
    ...overrides,
  };
}

function profile(overrides: Partial<DependencyProfile> = {}): DependencyProfile {
  return {
    currentAge: 20,
    socialInsuranceDependent: true,
    targetYear: 2026,
    ...overrides,
  };
}

describe("planGoal", () => {
  it("バイトが無い場合はnull", () => {
    const walls = evaluateWalls([], profile());
    expect(planGoal([], walls, 50000)).toBeNull();
  });

  it("目標金額が0以下の場合はnull", () => {
    const jobs = [job()];
    const walls = evaluateWalls(jobs, profile());
    expect(planGoal(jobs, walls, 0)).toBeNull();
  });

  it("壁に十分余裕があれば目標を完全に達成できる(shortfall=0)", () => {
    const jobs = [job({ hourlyWage: 1000, daysPerWeek: 1, hoursPerDay: 1 })];
    const walls = evaluateWalls(jobs, profile());
    const plan = planGoal(jobs, walls, 30000);
    expect(plan?.shortfall).toBe(0);
    expect(plan?.bindingWallLabel).toBeNull();
    expect(plan?.weeklyHourIncrease).toBeGreaterThan(0);
  });

  it("時給が最も高いバイトを割り当て先に選ぶ", () => {
    const jobA = job({ id: "a", name: "安いバイト", hourlyWage: 1000, daysPerWeek: 1, hoursPerDay: 1 });
    const jobB = job({ id: "b", name: "高いバイト", hourlyWage: 2000, daysPerWeek: 1, hoursPerDay: 1 });
    const walls = evaluateWalls([jobA, jobB], profile());
    const plan = planGoal([jobA, jobB], walls, 10000);
    expect(plan?.targetJobId).toBe("b");
  });

  it("壁の残り枠を超える目標は、枠内の最大額に切り詰められる(shortfall>0)", () => {
    // ほぼ壁いっぱいまで稼いでいる状態を作る
    const jobs = [job({ hourlyWage: 3000, daysPerWeek: 5, hoursPerDay: 8 })];
    const walls = evaluateWalls(jobs, profile());
    const plan = planGoal(jobs, walls, 1_000_000);
    expect(plan?.shortfall).toBeGreaterThan(0);
    expect(plan?.bindingWallLabel).not.toBeNull();
    expect(plan?.achievableAmount).toBeLessThan(1_000_000);
  });
});
