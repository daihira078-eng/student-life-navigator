export interface Job {
  id: string;
  name: string;
  hourlyWage: number;
  daysPerWeek: number;
  hoursPerDay: number;
  startMonth: number; // 1-12, このバイトを始めた月
}

export interface DependencyProfile {
  isSpecificDependent: boolean; // 19-23歳 特定扶養控除の対象か
  socialInsuranceDependent: boolean; // 社会保険上の扶養に入っているか
  targetYear: number; // シミュレーション対象年度（表示用ラベル。税制・社保の閾値は現行法のまま固定）
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

export interface FixedCost {
  id: string;
  name: string;
  monthlyAmount: number;
}

export interface EconomicZoneInput {
  usesRakutenCard: boolean;
  monthlyCardSpend: number;
  usesRakutenNisa: boolean;
  nisaBalance: number;
  usesRakutenMobile: boolean;
  currentTelecomMonthlyFee: number | null; // 不明なら null
  usesRakutenBank: boolean;
  fixedCosts: FixedCost[];
}

export interface DiagnosisResult {
  category: "card" | "nisa" | "telecom" | "bank";
  label: string;
  currentLabel: string;
  recommendedLabel: string;
  annualDiff: number | null; // nullは試算不可(定性コメントのみ)
  note: string;
  sourceNote: string;
}

export interface SubscriptionTip {
  costId: string;
  costName: string;
  message: string;
  annualSaving: number;
}
