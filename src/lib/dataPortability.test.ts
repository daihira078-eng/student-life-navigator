import { describe, expect, it } from "vitest";
import { parseImportedData } from "./dataPortability";

describe("parseImportedData", () => {
  it("正しい形のJSONをそのままパースできる", () => {
    const json = JSON.stringify({
      version: 1,
      exportedAt: "2026-09-28T00:00:00.000Z",
      jobs: [{ id: "a", name: "A", hourlyWage: 1000, daysPerWeek: 2, hoursPerDay: 3, startMonth: 1, endMonth: null, monthlyCommutingAllowance: 0 }],
      profile: { currentAge: 20, socialInsuranceDependent: true, targetYear: 2026 },
      extraScenarios: [],
      actualIncome: [{ month: 4, amount: 70000 }],
    });
    const data = parseImportedData(json);
    expect(data.jobs).toHaveLength(1);
    expect(data.profile.currentAge).toBe(20);
    expect(data.actualIncome).toHaveLength(1);
  });

  it("extraScenarios/actualIncomeが欠けていても空配列を補う", () => {
    const json = JSON.stringify({
      jobs: [],
      profile: { currentAge: 20, socialInsuranceDependent: true, targetYear: 2026 },
    });
    const data = parseImportedData(json);
    expect(data.extraScenarios).toEqual([]);
    expect(data.actualIncome).toEqual([]);
  });

  it("jobsが配列でない場合はエラーを投げる", () => {
    const json = JSON.stringify({ jobs: "not-an-array", profile: {} });
    expect(() => parseImportedData(json)).toThrow();
  });

  it("profileが無い場合はエラーを投げる", () => {
    const json = JSON.stringify({ jobs: [] });
    expect(() => parseImportedData(json)).toThrow();
  });

  it("JSONとして壊れている場合はエラーを投げる", () => {
    expect(() => parseImportedData("{不正なJSON")).toThrow();
  });

  it("このアプリと無関係なJSON(配列など)はエラーを投げる", () => {
    expect(() => parseImportedData("[1,2,3]")).toThrow();
  });
});
