"use client";

import type { DependencyProfile } from "@/lib/types";
import { isSpecificDependentAge } from "@/lib/wallCalculator";

interface ProfileFormProps {
  profile: DependencyProfile;
  onChange: (profile: DependencyProfile) => void;
}

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const isSpecificDependent = isSpecificDependentAge(profile.currentAge);

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">扶養プロフィール</div>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex items-center justify-between gap-2">
          <span className="text-secondary">シミュレーション対象年度</span>
          <select
            value={profile.targetYear}
            onChange={(e) => onChange({ ...profile, targetYear: Number(e.target.value) })}
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between gap-2">
          <span className="text-secondary">現在の年齢</span>
          <input
            type="number"
            min={15}
            max={30}
            value={profile.currentAge}
            onChange={(e) => onChange({ ...profile, currentAge: Number(e.target.value) })}
            className="w-20 rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary"
          />
        </label>
        <p className="text-xs text-muted">
          {isSpecificDependent
            ? "19〜23歳のため特定扶養控除の対象と判定しています（社会保険の壁150万円）"
            : "19〜23歳の範囲外のため特定扶養控除の対象外と判定しています（社会保険の壁130万円）"}
        </p>
        <label className="flex items-center justify-between gap-2">
          <span className="text-secondary">社会保険上の扶養に入っている</span>
          <input
            type="checkbox"
            checked={profile.socialInsuranceDependent}
            onChange={(e) =>
              onChange({ ...profile, socialInsuranceDependent: e.target.checked })
            }
          />
        </label>
      </div>
    </div>
  );
}
