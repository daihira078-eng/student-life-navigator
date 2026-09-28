import { describe, expect, it } from "vitest";
import {
  cumulativeByMonth,
  evaluateWalls,
  getWalls,
  isSpecificDependentAge,
  monthlyIncomeForWall,
  monthlyWageIncome,
} from "./wallCalculator";
import type { DependencyProfile, Job } from "./types";

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    name: "テストバイト",
    hourlyWage: 1200,
    daysPerWeek: 3,
    hoursPerDay: 4,
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

describe("isSpecificDependentAge", () => {
  it("18歳は特定扶養控除の対象外", () => {
    expect(isSpecificDependentAge(18)).toBe(false);
  });
  it("19歳は対象(下限)", () => {
    expect(isSpecificDependentAge(19)).toBe(true);
  });
  it("23歳は対象(上限)", () => {
    expect(isSpecificDependentAge(23)).toBe(true);
  });
  it("24歳は対象外", () => {
    expect(isSpecificDependentAge(24)).toBe(false);
  });
});

describe("getWalls", () => {
  it("19〜23歳・社保扶養ありなら社会保険の壁は150万円(2025年10月改正後)", () => {
    const social = getWalls(profile({ currentAge: 20 })).find((w) => w.key === "socialInsurance");
    expect(social?.threshold).toBe(1_500_000);
  });

  it("24歳以上は社会保険の壁が130万円のまま", () => {
    const social = getWalls(profile({ currentAge: 24 })).find((w) => w.key === "socialInsurance");
    expect(social?.threshold).toBe(1_300_000);
  });

  it("所得税の壁は年齢によらず123万円で固定", () => {
    const incomeTax = getWalls(profile({ currentAge: 24 })).find((w) => w.key === "incomeTax");
    expect(incomeTax?.threshold).toBe(1_230_000);
  });

  it("社会保険上の扶養に入っていない場合は社会保険の壁を出さない", () => {
    const walls = getWalls(profile({ socialInsuranceDependent: false }));
    expect(walls).toHaveLength(1);
    expect(walls[0].key).toBe("incomeTax");
  });

  it("currentAgeが未設定(旧localStorageデータ)でも19歳扱いにフォールバックする", () => {
    const legacyProfile = {
      socialInsuranceDependent: true,
      targetYear: 2026,
    } as DependencyProfile;
    const social = getWalls(legacyProfile).find((w) => w.key === "socialInsurance");
    expect(social?.threshold).toBe(1_500_000);
  });
});

describe("monthlyIncomeForWall", () => {
  it("通勤手当は所得税の壁では除外される", () => {
    const j = job({ monthlyCommutingAllowance: 10_000 });
    expect(monthlyIncomeForWall(j, "incomeTax")).toBe(monthlyWageIncome(j));
  });

  it("通勤手当は社会保険の壁では含まれる", () => {
    const j = job({ monthlyCommutingAllowance: 10_000 });
    expect(monthlyIncomeForWall(j, "socialInsurance")).toBe(monthlyWageIncome(j) + 10_000);
  });

  it("通勤手当が未設定(旧データ)なら0円としてフォールバックする", () => {
    const j = { ...job(), monthlyCommutingAllowance: undefined } as unknown as Job;
    expect(monthlyIncomeForWall(j, "socialInsurance")).toBe(monthlyWageIncome(j));
  });
});

describe("cumulativeByMonth (稼働月の判定)", () => {
  it("開始月より前は収入0円", () => {
    const cumulative = cumulativeByMonth([job({ startMonth: 6 })], "incomeTax");
    expect(cumulative[4]).toBe(0); // 5月時点の累積
    expect(cumulative[5]).toBeGreaterThan(0); // 6月時点の累積
  });

  it("終了月以降は辞めたバイトとして計上されなくなる", () => {
    const cumulative = cumulativeByMonth([job({ startMonth: 1, endMonth: 3 })], "incomeTax");
    expect(cumulative[2]).toBe(cumulative[11]); // 3月以降は増えない
  });

  it("endMonthがnull(継続中)なら年末まで積み上がり続ける", () => {
    const cumulative = cumulativeByMonth([job({ startMonth: 1, endMonth: null })], "incomeTax");
    expect(cumulative[11]).toBeGreaterThan(cumulative[0]);
  });
});

describe("evaluateWalls", () => {
  it("壁を超えていない場合はgood判定で、超過系フィールドは全てnull", () => {
    const jobs = [job({ hourlyWage: 1000, daysPerWeek: 2, hoursPerDay: 3 })];
    const incomeTax = evaluateWalls(jobs, profile()).find((w) => w.wall.key === "incomeTax")!;
    expect(incomeTax.status).toBe("good");
    expect(incomeTax.excessImpact).toBeNull();
    expect(incomeTax.shiftSuggestion).toBeNull();
  });

  it("壁を超える場合はcritical判定になり、回避シフト時間と負担額が算出される", () => {
    const jobs = [job({ hourlyWage: 2000, daysPerWeek: 5, hoursPerDay: 6 })];
    const incomeTax = evaluateWalls(jobs, profile()).find((w) => w.wall.key === "incomeTax")!;
    expect(incomeTax.status).toBe("critical");
    expect(incomeTax.monthReached).not.toBeNull();
    expect(incomeTax.shiftSuggestion?.weeklyHourReduction).toBeGreaterThan(0);
    expect(incomeTax.excessImpact?.amount).toBeGreaterThan(0);
  });

  it("複数バイトの内訳(breakdown)の合計が年間見込みと一致する", () => {
    const jobA = job({ id: "a", name: "A", hourlyWage: 1000, daysPerWeek: 2, hoursPerDay: 4 });
    const jobB = job({ id: "b", name: "B", hourlyWage: 1500, daysPerWeek: 1, hoursPerDay: 3 });
    const incomeTax = evaluateWalls([jobA, jobB], profile()).find((w) => w.wall.key === "incomeTax")!;
    expect(incomeTax.breakdown).toHaveLength(2);
    const total = incomeTax.breakdown.reduce((sum, b) => sum + b.annualIncome, 0);
    expect(total).toBeCloseTo(incomeTax.annualProjection, 5);
  });

  it("社会保険上の扶養に入っていない場合、結果に社会保険の壁が含まれない", () => {
    const walls = evaluateWalls([job()], profile({ socialInsuranceDependent: false }));
    expect(walls.find((w) => w.wall.key === "socialInsurance")).toBeUndefined();
  });
});
