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

export interface WallStatus {
  wall: WallDefinition;
  annualProjection: number;
  remainingAmount: number;
  remainingHours: number;
  monthReached: number | null; // 1-12、その年度中に到達する場合
  status: "good" | "warning" | "critical";
  excessImpact: ExcessImpact | null;
}
