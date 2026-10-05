import { describe, expect, it } from "vitest";
import { suggestWarningRatio } from "./riskToleranceSuggestion";
import type { ActualIncomeRecord } from "./actualIncomeData";

const THRESHOLD = 1_230_000; // 123万円の壁。月割りすると102,500円/月

describe("suggestWarningRatio", () => {
  it("実績が3ヶ月未満ならnull(根拠が薄すぎる)", () => {
    const records: ActualIncomeRecord[] = [
      { month: 4, amount: 70_000 },
      { month: 5, amount: 70_000 },
    ];
    expect(suggestWarningRatio(records, THRESHOLD)).toBeNull();
  });

  it("金額0の月はデータ件数に数えない", () => {
    const records: ActualIncomeRecord[] = [
      { month: 4, amount: 70_000 },
      { month: 5, amount: 0 },
      { month: 6, amount: 70_000 },
    ];
    expect(suggestWarningRatio(records, THRESHOLD)).toBeNull();
  });

  it("月割りペースに対して実績が低め(75%未満)なら堅実派を提案する", () => {
    // 月割りペース102,500円に対して常に70%前後
    const records: ActualIncomeRecord[] = [
      { month: 4, amount: 70_000 },
      { month: 5, amount: 72_000 },
      { month: 6, amount: 71_000 },
    ];
    const result = suggestWarningRatio(records, THRESHOLD);
    expect(result?.label).toBe("堅実派");
    expect(result?.suggestedRatio).toBe(0.8);
  });

  it("月割りペースに近い(75%〜95%)なら標準を提案する", () => {
    const records: ActualIncomeRecord[] = [
      { month: 4, amount: 88_000 },
      { month: 5, amount: 90_000 },
      { month: 6, amount: 89_000 },
    ];
    const result = suggestWarningRatio(records, THRESHOLD);
    expect(result?.label).toBe("標準");
    expect(result?.suggestedRatio).toBe(0.9);
  });

  it("月割りペースの95%以上なら攻める派を提案する", () => {
    const records: ActualIncomeRecord[] = [
      { month: 4, amount: 100_000 },
      { month: 5, amount: 102_000 },
      { month: 6, amount: 101_000 },
    ];
    const result = suggestWarningRatio(records, THRESHOLD);
    expect(result?.label).toBe("攻める派");
    expect(result?.suggestedRatio).toBe(0.95);
  });

  it("バイト開始が年の途中でも、月平均ペースで判定するため不当に堅実派へ偏らない", () => {
    // 4月開始のバイトで、各月はしっかり壁ペース通り稼いでいるケース
    const records: ActualIncomeRecord[] = [
      { month: 4, amount: 100_000 },
      { month: 5, amount: 100_000 },
      { month: 6, amount: 100_000 },
    ];
    const result = suggestWarningRatio(records, THRESHOLD);
    expect(result?.label).not.toBe("堅実派");
  });
});
