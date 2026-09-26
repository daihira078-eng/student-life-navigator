"use client";

import type { DependencyProfile } from "@/lib/types";

interface ProfileFormProps {
  profile: DependencyProfile;
  onChange: (profile: DependencyProfile) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">扶養プロフィール</div>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex items-center justify-between gap-2">
          <span className="text-secondary">特定扶養控除の対象（19〜23歳）</span>
          <input
            type="checkbox"
            checked={profile.isSpecificDependent}
            onChange={(e) =>
              onChange({ ...profile, isSpecificDependent: e.target.checked })
            }
          />
        </label>
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
        <label className="flex items-center justify-between gap-2">
          <span className="text-secondary">シミュレーション開始月</span>
          <select
            value={profile.startMonth}
            onChange={(e) =>
              onChange({ ...profile, startMonth: Number(e.target.value) })
            }
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
