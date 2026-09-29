import { describe, expect, it } from "vitest";
import { computeWallProgress, planGoal } from "./goalPlanner";
import { evaluateWalls, getWalls } from "./wallCalculator";
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
    expect(planGoal([], walls, 50000, [])).toBeNull();
  });

  it("目標金額が0以下の場合はnull", () => {
    const jobs = [job()];
    const walls = evaluateWalls(jobs, profile());
    expect(planGoal(jobs, walls, 0, [])).toBeNull();
  });

  it("壁に十分余裕があれば目標を完全に達成できる(shortfall=0)", () => {
    const jobs = [job({ hourlyWage: 1000, daysPerWeek: 1, hoursPerDay: 1 })];
    const walls = evaluateWalls(jobs, profile());
    const plan = planGoal(jobs, walls, 30000, []);
    expect(plan?.shortfall).toBe(0);
    expect(plan?.bindingWallLabel).toBeNull();
    expect(plan?.weeklyHourIncrease).toBeGreaterThan(0);
  });

  it("時給が最も高いバイトを割り当て先に選ぶ", () => {
    const jobA = job({ id: "a", name: "安いバイト", hourlyWage: 1000, daysPerWeek: 1, hoursPerDay: 1 });
    const jobB = job({ id: "b", name: "高いバイト", hourlyWage: 2000, daysPerWeek: 1, hoursPerDay: 1 });
    const walls = evaluateWalls([jobA, jobB], profile());
    const plan = planGoal([jobA, jobB], walls, 10000, []);
    expect(plan?.targetJobId).toBe("b");
  });

  it("壁の残り枠を超える目標は、枠内の最大額に切り詰められる(shortfall>0)", () => {
    // ほぼ壁いっぱいまで稼いでいる状態を作る
    const jobs = [job({ hourlyWage: 3000, daysPerWeek: 5, hoursPerDay: 8 })];
    const walls = evaluateWalls(jobs, profile());
    const plan = planGoal(jobs, walls, 1_000_000, []);
    expect(plan?.shortfall).toBeGreaterThan(0);
    expect(plan?.bindingWallLabel).not.toBeNull();
    expect(plan?.achievableAmount).toBeLessThan(1_000_000);
  });

  it("実績が入力されている月は予測より実績を優先して残り枠を計算する", () => {
    const jobs = [job({ hourlyWage: 1000, daysPerWeek: 1, hoursPerDay: 1 })];
    const walls = evaluateWalls(jobs, profile());
    // 1月の実績を予測よりずっと大きい額で記録 → 残り枠がその分減るはず
    const withActual = planGoal(jobs, walls, 1_200_000, [{ month: 1, amount: 900_000 }]);
    const withoutActual = planGoal(jobs, walls, 1_200_000, []);
    expect(withActual?.achievableAmount).toBeLessThan(withoutActual?.achievableAmount ?? Infinity);
  });
});

describe("computeWallProgress", () => {
  it("実績の無い月は予測(週平均ベース)を使う", () => {
    const jobs = [job({ hourlyWage: 1000, daysPerWeek: 1, hoursPerDay: 1 })];
    const wall = getWalls(profile())[0];
    const progress = computeWallProgress(jobs, wall, []);
    expect(progress.blendedTotal).toBeGreaterThan(0);
    expect(progress.remaining).toBe(wall.threshold - progress.blendedTotal);
  });

  it("実績がある月はその金額をそのまま使う", () => {
    const jobs = [job({ hourlyWage: 1000, daysPerWeek: 1, hoursPerDay: 1 })];
    const wall = getWalls(profile())[0];
    const progress = computeWallProgress(jobs, wall, [{ month: 1, amount: 500_000 }]);
    // 1月分は500,000円が使われ、残り11ヶ月は予測なので、予測のみの合計より大きくなるはず
    const withoutActual = computeWallProgress(jobs, wall, []);
    expect(progress.blendedTotal).toBeGreaterThan(withoutActual.blendedTotal);
  });
});
