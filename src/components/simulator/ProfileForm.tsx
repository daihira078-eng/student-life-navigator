"use client";

import type { DependencyProfile } from "@/lib/types";
import { isSpecificDependentAge } from "@/lib/wallCalculator";
import { selectOnFocus } from "@/lib/selectOnFocus";

interface ProfileFormProps {
  profile: DependencyProfile;
  onChange: (profile: DependencyProfile) => void;
}

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
const GRADUATION_YEAR_OPTIONS = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const WARNING_RATIO_OPTIONS: { value: number; label: string; description: string }[] = [
  { value: 0.8, label: "堅実派", description: "壁の80%で注意表示" },
  { value: 0.9, label: "標準", description: "壁の90%で注意表示" },
  { value: 0.95, label: "攻める派", description: "壁の95%で注意表示" },
];

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const isSpecificDependent = isSpecificDependentAge(profile.currentAge);
  const warningRatio = profile.warningRatio ?? 0.9;

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 text-sm font-semibold text-primary">扶養プロフィール</div>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex items-center justify-between gap-2">
          <span className="text-secondary">シミュレーション対象年度</span>
          <select
            value={profile.targetYear}
            onChange={(e) => onChange({ ...profile, targetYear: Number(e.target.value) })}
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
            onFocus={selectOnFocus}
            className="w-20 rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
        <div className="border-t border-(--gridline) pt-3">
          <span className="text-secondary">卒業予定(任意)</span>
          <div className="mt-2 flex items-center gap-2">
            <select
              value={profile.graduationYear ?? ""}
              onChange={(e) =>
                onChange({
                  ...profile,
                  graduationYear: e.target.value === "" ? null : Number(e.target.value),
                  graduationMonth: e.target.value === "" ? null : (profile.graduationMonth ?? 3),
                })
              }
              className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="">未定</option>
              {GRADUATION_YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>
            <select
              value={profile.graduationMonth ?? ""}
              disabled={profile.graduationYear == null}
              onChange={(e) => onChange({ ...profile, graduationMonth: Number(e.target.value) })}
              className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}月
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            設定すると、「目標から逆算」タブの期限の選択肢に「卒業まで」が反映されます(シミュレーション対象年度中に卒業する場合のみ)。
          </p>
        </div>
        <div className="border-t border-(--gridline) pt-3">
          <span className="text-secondary">壁への注意表示の出し方</span>
          <div className="mt-2 flex gap-1.5">
            {WARNING_RATIO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                title={opt.description}
                onClick={() => onChange({ ...profile, warningRatio: opt.value })}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  warningRatio === opt.value
                    ? "border-brand bg-(--brand-soft) text-brand"
                    : "border-(--border-hairline) text-secondary hover:border-series-1"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {WARNING_RATIO_OPTIONS.find((o) => o.value === warningRatio)?.description}
            。ひとことアドバイスや通知が出るタイミングもこの設定に連動します。
          </p>
        </div>
      </div>
    </div>
  );
}
