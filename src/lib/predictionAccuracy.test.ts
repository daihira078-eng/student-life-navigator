import { describe, expect, it } from "vitest";
import { computeAverageErrorRate } from "./predictionAccuracy";
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

describe("computeAverageErrorRate", () => {
  it("実績が1件もない場合はnull", () => {
    expect(computeAverageErrorRate([job()], [])).toBeNull();
  });

  it("予測と実績が完全一致なら誤差率0", () => {
    const jobs = [job({ hourlyWage: 1000, daysPerWeek: 2, hoursPerDay: 4 })];
    // WEEKS_PER_MONTH=52/12として月収を逆算
    const predicted = Math.round(1000 * 4 * 2 * (52 / 12));
    const rate = computeAverageErrorRate(jobs, [{ month: 1, amount: predicted }]);
    expect(rate).toBeCloseTo(0, 2);
  });

  it("実績が0円の月は誤差率の計算から除外する", () => {
    const jobs = [job()];
    const rate = computeAverageErrorRate(jobs, [{ month: 1, amount: 0 }]);
    expect(rate).toBeNull();
  });
});
