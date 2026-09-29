import { describe, expect, it } from "vitest";
import { clearRecord, findRecord, getPatternHours, upsertRecord } from "./actualShiftData";
import type { Job } from "./types";

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    name: "テストバイト",
    hourlyWage: 1000,
    daysPerWeek: 1,
    hoursPerDay: 4,
    startMonth: 1,
    endMonth: null,
    monthlyCommutingAllowance: 0,
    ...overrides,
  };
}

describe("getPatternHours", () => {
  it("weekdays未指定なら常に0", () => {
    expect(getPatternHours(job(), "2026-09-02")).toBe(0);
  });

  it("パターンに一致する曜日ならhoursPerDayを返す(2026-09-02は水曜)", () => {
    const j = job({ weekdays: [3], hoursPerDay: 5 });
    expect(getPatternHours(j, "2026-09-02")).toBe(5);
  });

  it("曜日は合っていても稼働期間外なら0", () => {
    const j = job({ weekdays: [3], startMonth: 10 });
    expect(getPatternHours(j, "2026-09-02")).toBe(0);
  });
});

describe("upsertRecord / findRecord / clearRecord", () => {
  it("新規追加できる", () => {
    const records = upsertRecord([], "job-1", "2026-09-02", 4);
    expect(findRecord(records, "job-1", "2026-09-02")?.hours).toBe(4);
  });

  it("既存レコードは上書きされる(重複しない)", () => {
    let records = upsertRecord([], "job-1", "2026-09-02", 4);
    records = upsertRecord(records, "job-1", "2026-09-02", 0);
    expect(records).toHaveLength(1);
    expect(findRecord(records, "job-1", "2026-09-02")?.hours).toBe(0);
  });

  it("clearRecordで該当レコードだけ消える", () => {
    let records = upsertRecord([], "job-1", "2026-09-02", 4);
    records = upsertRecord(records, "job-2", "2026-09-02", 3);
    records = clearRecord(records, "job-1", "2026-09-02");
    expect(findRecord(records, "job-1", "2026-09-02")).toBeUndefined();
    expect(findRecord(records, "job-2", "2026-09-02")?.hours).toBe(3);
  });
});
