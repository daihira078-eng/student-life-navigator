export interface Job {
  id: string;
  name: string;
  hourlyWage: number;
  daysPerWeek: number;
  hoursPerDay: number;
  startMonth: number; // 1-12, このバイトを始めた月
  monthlyCommutingAllowance: number; // 通勤手当(円/月)。所得税の壁では非課税(除外)、社会保険の壁では収入に含む
}

export interface Scenario {
  id: string;
  name: string;
  jobs: Job[];
}

export interface DependencyProfile {
  currentAge: number; // 現在の年齢。19〜23歳なら特定扶養控除の対象と自動判定
  socialInsuranceDependent: boolean; // 社会保険上の扶養に入っているか
  targetYear: number; // シミュレーション対象年度（表示用ラベル。税制・社保の閾値は現行法のまま固定）
}

export interface MultiYearPoint {
  age: number;
  year: number;
  walls: WallStatus[];
}

export interface WallDefinition {
  key: "incomeTax" | "socialInsurance";
  label: string;
  threshold: number; // 円
}

export interface ExcessImpact {
  label: string;
  amount: number;
  note: string;
}

export interface ShiftSuggestion {
  jobId: string;
  jobName: string;
  weeklyHourReduction: number;
}

export interface WallStatus {
  wall: WallDefinition;
  annualProjection: number;
  remainingAmount: number;
  remainingHours: number;
  monthReached: number | null; // 1-12、その年度中に到達する場合
  status: "good" | "warning" | "critical";
  excessImpact: ExcessImpact | null;
  shiftSuggestion: ShiftSuggestion | null;
}

export type UsageFrequency = "daily" | "weekly" | "monthly" | "rarely";

export interface FixedCost {
  id: string;
  name: string;
  monthlyAmount: number;
  frequency: UsageFrequency;
}

export type CardOption =
  | "yucho"
  | "juroku_debit"
  | "rakuten"
  | "paypay"
  | "dcard"
  | "mitsui_sumitomo_nl"
  | "other";
export type BankOption = "yucho_juroku" | "rakuten" | "other";
export type TelecomOption = "docomo" | "au" | "softbank" | "rakuten_mobile" | "other";
export type NisaBrokerOption = "yucho" | "rakuten" | "sbi" | "other";
export type ShoppingPriority =
  | "rakuten_market"
  | "yahoo_paypay"
  | "d_payment"
  | "convenience_touch"
  | "none";
export type DataUsageTier = "light" | "medium" | "heavy";

export interface EconomicZoneInput {
  currentCard: CardOption;
  monthlyCardSpend: number;
  shoppingPriority: ShoppingPriority; // よく使う決済/経済圏
  currentNisaBroker: NisaBrokerOption;
  nisaBalance: number;
  currentTelecom: TelecomOption;
  currentTelecomMonthlyFee: number | null; // 不明なら null
  dataUsageTier: DataUsageTier; // 使いたいギガ数の目安
  currentBank: BankOption;
  fixedCosts: FixedCost[];
}

export interface DiagnosisResult {
  category: "card" | "nisa" | "telecom" | "bank";
  label: string;
  currentLabel: string;
  compareLabel: string; // 「開発者が実際に乗り換えた先」との比較。万人への推奨ではない
  annualDiff: number | null; // nullは試算不可(データなし、または定性コメントのみ)
  note: string;
  sourceNote: string;
  fitNote: string | null; // ①現状はあなたの使い方に合っているか、の評価
}

export interface SubscriptionTip {
  costId: string;
  costName: string;
  message: string;
  annualSaving: number;
}
