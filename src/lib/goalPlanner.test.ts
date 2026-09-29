import { describe, expect, it } from "vitest";
import { computeWallProgress, estimateEarnings, planGoal } from "./goalPlanner";
import { evaluateWalls, getWalls, WEEKS_PER_MONTH } from "./wallCalculator";
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
    expect(plan?.allocations[0]?.weeklyHourIncrease).toBeGreaterThan(0);
  });

  it("全バイト分の配分パターンを時給が高い順に並べて返す", () => {
    const jobA = job({ id: "a", name: "安いバイト", hourlyWage: 1000, daysPerWeek: 1, hoursPerDay: 1 });
    const jobB = job({ id: "b", name: "高いバイト", hourlyWage: 2000, daysPerWeek: 1, hoursPerDay: 1 });
    const walls = evaluateWalls([jobA, jobB], profile());
    const plan = planGoal([jobA, jobB], walls, 10000, []);
    expect(plan?.allocations).toHaveLength(2);
    expect(plan?.allocations[0]?.jobId).toBe("b");
    expect(plan?.allocations[1]?.jobId).toBe("a");
    // 時給が高いバイトの方が、同じ金額を稼ぐのに必要な時間は少ないはず
    expect(plan!.allocations[0]!.weeklyHourIncrease).toBeLessThan(plan!.allocations[1]!.weeklyHourIncrease!);
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

  it("週の必要増加時間は amount / (稼働月数 × 週数/月 × 時給) と一致する（手計算で検証可能なケース）", () => {
    // 1〜12月フル稼働、現在月を1月に固定 → 稼働月数=12ヶ月、週数=52週ぴったり
    const jobs = [job({ hourlyWage: 1200, startMonth: 1, endMonth: null })];
    const walls = evaluateWalls(jobs, profile());
    const now = new Date(2026, 0, 1); // 2026-01-01, currentMonth=1
    const plan = planGoal(jobs, walls, 60000, [], null, now);
    expect(plan?.shortfall).toBe(0);
    const expected = 60000 / (52 * 1200);
    expect(plan?.allocations[0]?.weeklyHourIncrease).toBeCloseTo(expected, 10);
    // 52週 × 期待時間 × 時給 = 目標額に戻ることも確認
    const roundTrip = (plan!.allocations[0]!.weeklyHourIncrease! * 52 * 1200);
    expect(roundTrip).toBeCloseTo(60000, 6);
  });

  it("期限(targetMonth)を指定すると、今月〜期限月の範囲だけで必要時間を計算する", () => {
    const jobs = [job({ hourlyWage: 1000, startMonth: 1, endMonth: null })];
    const walls = evaluateWalls(jobs, profile());
    const now = new Date(2026, 0, 1); // currentMonth=1
    const planFullYear = planGoal(jobs, walls, 30000, [], null, now); // 期限指定なし=年末まで(12ヶ月)
    const planThreeMonths = planGoal(jobs, walls, 30000, [], 3, now); // 3月末までの3ヶ月
    // 期限が短いほど、同じ金額を稼ぐのに必要な週あたり時間は増えるはず
    expect(planThreeMonths!.allocations[0]!.weeklyHourIncrease!).toBeGreaterThan(
      planFullYear!.allocations[0]!.weeklyHourIncrease!,
    );
  });

  it("期限が既に過ぎている(バイトの稼働期間と重ならない)場合はweeklyHourIncreaseがnull", () => {
    const jobs = [job({ hourlyWage: 1000, startMonth: 6, endMonth: null })]; // 6月開始
    const walls = evaluateWalls(jobs, profile());
    const now = new Date(2026, 0, 1); // currentMonth=1
    const plan = planGoal(jobs, walls, 30000, [], 3, now); // 期限は3月末 → 6月開始のバイトとは重ならない
    expect(plan?.allocations[0]?.weeklyHourIncrease).toBeNull();
  });

  it("バイトが複数ある場合はevenSplit(均等配分)も返す", () => {
    const jobA = job({ id: "a", name: "バイトA", hourlyWage: 1000 });
    const jobB = job({ id: "b", name: "バイトB", hourlyWage: 1500 });
    const walls = evaluateWalls([jobA, jobB], profile());
    const plan = planGoal([jobA, jobB], walls, 20000, []);
    expect(plan?.evenSplit).toHaveLength(2);
    expect(plan?.evenSplit?.every((a) => a.shareAmount === 10000)).toBe(true);
  });

  it("バイトが1つだけの場合はevenSplitはnull", () => {
    const jobs = [job()];
    const walls = evaluateWalls(jobs, profile());
    const plan = planGoal(jobs, walls, 20000, []);
    expect(plan?.evenSplit).toBeNull();
  });
});

describe("estimateEarnings", () => {
  it("週の増加時間から、期間内に稼げる金額を逆算する（planGoalの逆計算と一致する）", () => {
    const testJob = job({ hourlyWage: 1200, startMonth: 1, endMonth: null });
    const now = new Date(2026, 0, 1);
    const weeklyHourIncrease = 60000 / (52 * 1200);
    const earnings = estimateEarnings(testJob, weeklyHourIncrease, null, now);
    expect(earnings).toBeCloseTo(60000, 6);
  });

  it("稼働期間と重ならない場合はnull", () => {
    const testJob = job({ hourlyWage: 1000, startMonth: 6, endMonth: null });
    const now = new Date(2026, 0, 1);
    const earnings = estimateEarnings(testJob, 5, 3, now);
    expect(earnings).toBeNull();
  });

  it("週数の計算にWEEKS_PER_MONTHを使っている(1ヶ月分)", () => {
    const testJob = job({ hourlyWage: 1000, startMonth: 1, endMonth: 1 });
    const now = new Date(2026, 0, 1);
    const earnings = estimateEarnings(testJob, 2, 1, now);
    expect(earnings).toBeCloseTo(2 * WEEKS_PER_MONTH * 1000, 6);
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
