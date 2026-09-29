import { describe, expect, it } from "vitest";
import { computeWallCrossingDate, generateShiftDays } from "./shiftCalendar";
import type { Job } from "./types";

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    name: "テストバイト",
    hourlyWage: 1000,
    daysPerWeek: 2,
    hoursPerDay: 4,
    startMonth: 1,
    endMonth: null,
    monthlyCommutingAllowance: 0,
    ...overrides,
  };
}

describe("generateShiftDays", () => {
  it("weekdaysが未指定なら空配列", () => {
    expect(generateShiftDays(job(), 2026)).toEqual([]);
  });

  it("指定した曜日のみが列挙される(月・水)", () => {
    const days = generateShiftDays(job({ weekdays: [1, 3], startMonth: 1, endMonth: 1 }), 2026);
    // 2026年1月は全て月曜または水曜のみのはず
    for (const d of days) {
      const dow = new Date(d.date).getDay();
      expect([1, 3]).toContain(dow);
    }
    expect(days.length).toBeGreaterThan(0);
  });

  it("startMonth〜endMonthの範囲外は含まれない", () => {
    const days = generateShiftDays(job({ weekdays: [0, 1, 2, 3, 4, 5, 6], startMonth: 3, endMonth: 3 }), 2026);
    for (const d of days) {
      expect(d.date.startsWith("2026-03")).toBe(true);
    }
  });

  it("各日の金額は時給×1日の勤務時間", () => {
    const days = generateShiftDays(
      job({ weekdays: [1], startMonth: 1, endMonth: 1, hourlyWage: 1200, hoursPerDay: 3 }),
      2026,
    );
    expect(days[0].amount).toBe(3600);
  });
});

describe("computeWallCrossingDate", () => {
  it("weekdays未指定のバイトのみの場合はnull(対象外)", () => {
    const date = computeWallCrossingDate([job()], 2026, "incomeTax", 1_230_000);
    expect(date).toBeNull();
  });

  it("十分稼ぐ場合は年内のどこかで壁に到達する", () => {
    const jobs = [
      job({ weekdays: [0, 1, 2, 3, 4, 5, 6], hourlyWage: 3000, hoursPerDay: 8, startMonth: 1, endMonth: null }),
    ];
    const date = computeWallCrossingDate(jobs, 2026, "incomeTax", 1_230_000);
    expect(date).not.toBeNull();
    expect(date).toMatch(/^2026-\d{2}-\d{2}$/);
  });

  it("稼ぎが少なければ年内に到達せずnull", () => {
    const jobs = [job({ weekdays: [1], hourlyWage: 1000, hoursPerDay: 2 })];
    const date = computeWallCrossingDate(jobs, 2026, "incomeTax", 1_230_000);
    expect(date).toBeNull();
  });

  it("社会保険の壁では通勤手当も月初に加算される", () => {
    const jobs = [
      job({
        weekdays: [1],
        hourlyWage: 100,
        hoursPerDay: 1,
        startMonth: 1,
        endMonth: 1,
        monthlyCommutingAllowance: 2_000_000,
      }),
    ];
    const date = computeWallCrossingDate(jobs, 2026, "socialInsurance", 1_000_000);
    expect(date).toBe("2026-01-01");
  });

  it("所得税の壁では通勤手当は加算されない", () => {
    const jobs = [
      job({
        weekdays: [1],
        hourlyWage: 100,
        hoursPerDay: 1,
        startMonth: 1,
        endMonth: 1,
        monthlyCommutingAllowance: 2_000_000,
      }),
    ];
    const date = computeWallCrossingDate(jobs, 2026, "incomeTax", 1_000_000);
    expect(date).toBeNull();
  });
});
