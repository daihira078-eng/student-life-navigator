export interface Job {
  id: string;
  name: string;
  hourlyWage: number;
  daysPerWeek: number;
  hoursPerDay: number;
}

export interface DependencyProfile {
  isSpecificDependent: boolean; // 19-23歳 特定扶養控除
  socialInsuranceDependent: boolean;
  startMonth: number; // 1-12, シミュレーション開始月
}

export interface WallDefinition {
  key: "incomeTax" | "socialInsurance";
  label: string;
  threshold: number; // 円
  appliesTo: (profile: DependencyProfile) => boolean;
}

export interface WallStatus {
  wall: WallDefinition;
  annualProjection: number;
  remainingAmount: number;
  remainingHours: number;
  monthReached: number | null; // 1-12、その年度中に到達する場合
  status: "good" | "warning" | "critical";
}
