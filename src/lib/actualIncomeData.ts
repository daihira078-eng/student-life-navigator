export interface ActualIncomeRecord {
  month: number;
  amount: number;
  note?: string; // 予定と差が出た理由などの一言メモ（任意）
}

/**
 * 開発者本人の家計簿実績（2026年4〜8月、給料のみ・おこづかいは除く）。
 * 9月分は給料とおこづかいの内訳が未確定のため含めていない。
 */
export const ACTUAL_INCOME_2026: ActualIncomeRecord[] = [
  { month: 4, amount: 70_350 },
  { month: 5, amount: 73_070 },
  { month: 6, amount: 70_384 },
  { month: 7, amount: 68_400 },
  { month: 8, amount: 84_825 },
];
