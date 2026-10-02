import { describe, expect, it } from "vitest";
import { detectAllScheduleDrifts, detectScheduleDrift } from "./scheduleDrift";
import type { ActualShiftRecord } from "./actualShiftData";
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

const NOW = new Date(2026, 9, 1); // 2026-10-01

/** nowからdaysAgo日前の"YYYY-MM-DD"を返す */
function dateStr(daysAgo: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function records(jobId: string, count: number, hoursEach: number): ActualShiftRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    date: dateStr(i + 1),
    jobId,
    hours: hoursEach,
  }));
}

describe("detectScheduleDrift", () => {
  it("記録が少なすぎる(8件未満)場合はnull", () => {
    const j = job();
    const recs = records(j.id, 5, 8); // 大きくズレた時間だが件数が足りない
    expect(detectScheduleDrift(j, recs, NOW)).toBeNull();
  });

  it("予定どおりの実績ならnull(ズレなし)", () => {
    const j = job({ daysPerWeek: 2, hoursPerDay: 4 }); // 週8時間
    // 6週間×週2日=12件、1件4時間 → 実績も週2日・4時間でぴったり一致
    const recs = records(j.id, 12, 4);
    expect(detectScheduleDrift(j, recs, NOW)).toBeNull();
  });

  it("実績が予定から20%以上ズレていれば検出する", () => {
    const j = job({ daysPerWeek: 2, hoursPerDay: 4 }); // 週8時間予定
    // 6週間×週4日=24件、1件6時間 → 実績週24時間(予定の3倍、大幅ズレ)
    const recs = records(j.id, 24, 6);
    const drift = detectScheduleDrift(j, recs, NOW);
    expect(drift).not.toBeNull();
    expect(drift?.plannedDaysPerWeek).toBe(2);
    expect(drift?.plannedHoursPerDay).toBe(4);
    expect(drift?.actualDaysPerWeek).toBe(4);
    expect(drift?.actualHoursPerDay).toBe(6);
  });

  it("予定時間が0の場合はnull", () => {
    const j = job({ daysPerWeek: 0, hoursPerDay: 4 });
    const recs = records(j.id, 24, 6);
    expect(detectScheduleDrift(j, recs, NOW)).toBeNull();
  });

  it("他のバイトの記録は計算に含めない", () => {
    const j = job({ id: "job-a", daysPerWeek: 2, hoursPerDay: 4 });
    const otherJobRecords = records("job-b", 24, 6); // 別バイトの大量の記録
    expect(detectScheduleDrift(j, otherJobRecords, NOW)).toBeNull();
  });

  it("hours=0の記録(休んだ日)は実績集計から除外する", () => {
    const j = job({ daysPerWeek: 2, hoursPerDay: 4 });
    const worked = records(j.id, 12, 4); // ぴったり一致する12件
    const skipped = Array.from({ length: 10 }, (_, i) => ({
      date: dateStr(i + 100),
      jobId: j.id,
      hours: 0,
    }));
    expect(detectScheduleDrift(j, [...worked, ...skipped], NOW)).toBeNull();
  });
});

describe("detectAllScheduleDrifts", () => {
  it("ズレているバイトだけを返す", () => {
    const matching = job({ id: "job-a", name: "一致バイト", daysPerWeek: 2, hoursPerDay: 4 });
    const drifting = job({ id: "job-b", name: "ズレバイト", daysPerWeek: 2, hoursPerDay: 4 });
    const recs = [
      ...records("job-a", 12, 4), // 一致
      ...records("job-b", 24, 6), // ズレ
    ];
    const drifts = detectAllScheduleDrifts([matching, drifting], recs, NOW);
    expect(drifts).toHaveLength(1);
    expect(drifts[0]?.jobId).toBe("job-b");
  });
});
