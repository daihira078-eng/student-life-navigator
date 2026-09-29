import { describe, expect, it } from "vitest";
import { buildWallNotification, shouldSkipToday } from "./wallNotification";
import { evaluateWalls } from "./wallCalculator";
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

describe("buildWallNotification", () => {
  it("壁に余裕がある場合は通知しない(null)", () => {
    const walls = evaluateWalls([job({ hourlyWage: 800, daysPerWeek: 1, hoursPerDay: 2 })], profile());
    expect(buildWallNotification(walls)).toBeNull();
  });

  it("壁を超える場合はcriticalタイトルで通知内容を作る", () => {
    const walls = evaluateWalls([job({ hourlyWage: 2000, daysPerWeek: 5, hoursPerDay: 6 })], profile());
    const content = buildWallNotification(walls);
    expect(content?.title).toBe("壁を超える見込みです");
    expect(content?.body.length).toBeGreaterThan(0);
  });
});

describe("shouldSkipToday", () => {
  it("同じ日付ならスキップする", () => {
    expect(shouldSkipToday("2026-09-28", "2026-09-28")).toBe(true);
  });

  it("日付が変わっていればスキップしない", () => {
    expect(shouldSkipToday("2026-09-27", "2026-09-28")).toBe(false);
  });

  it("未通知(null)ならスキップしない", () => {
    expect(shouldSkipToday(null, "2026-09-28")).toBe(false);
  });
});
