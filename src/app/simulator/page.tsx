"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { JobForm } from "@/components/simulator/JobForm";
import { ProfileForm } from "@/components/simulator/ProfileForm";
import { WallGauge } from "@/components/simulator/WallGauge";
import { IncomeChart, type IncomeSeries } from "@/components/simulator/IncomeChart";
import { cumulativeByMonth, evaluateWalls } from "@/lib/wallCalculator";
import type { DependencyProfile, Job } from "@/lib/types";

const DEFAULT_JOBS: Job[] = [
  {
    id: "job-cazan",
    name: "CAZAN珈琲店",
    hourlyWage: 1190,
    daysPerWeek: 2.5,
    hoursPerDay: 4,
    startMonth: 4,
    monthlyCommutingAllowance: 0,
  },
  {
    id: "job-vexum",
    name: "VEXUM",
    hourlyWage: 1300,
    daysPerWeek: 1,
    hoursPerDay: 3.5,
    startMonth: 8,
    monthlyCommutingAllowance: 0,
  },
];

const DEFAULT_PROFILE: DependencyProfile = {
  isSpecificDependent: true,
  socialInsuranceDependent: true,
  targetYear: new Date().getFullYear(),
};

const SERIES_LABEL: Record<string, string> = {
  incomeTax: "所得税ベースの収入（通勤手当を除く）",
  socialInsurance: "社会保険ベースの収入（通勤手当を含む）",
};

const SERIES_COLOR: Record<string, string> = {
  incomeTax: "var(--series-1)",
  socialInsurance: "var(--series-6)",
};

export default function SimulatorPage() {
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS);
  const [profile, setProfile] = useState<DependencyProfile>(DEFAULT_PROFILE);

  const walls = useMemo(() => evaluateWalls(jobs, profile), [jobs, profile]);
  const series: IncomeSeries[] = useMemo(
    () =>
      walls.map((w) => ({
        key: w.wall.key,
        label: SERIES_LABEL[w.wall.key],
        cumulative: cumulativeByMonth(jobs, w.wall.key),
        color: SERIES_COLOR[w.wall.key],
      })),
    [jobs, walls],
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-series-1">
          ← トップに戻る
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-primary">
          マルチジョブ扶養最適化シミュレーター
        </h1>
        <p className="mt-1 text-sm text-secondary">
          複数バイトの時給・シフト・開始月を入力すると、123万円の壁・社会保険の壁までの残り稼働可能時間と、超えた場合の負担額の目安を横断で確認できます。通勤手当は所得税の壁では非課税(除外)、社会保険の壁では収入に含めて計算します。入力内容はブラウザ内だけで計算され、サーバーには送信されません。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <ProfileForm profile={profile} onChange={setProfile} />
          <JobForm jobs={jobs} onChange={setJobs} />
        </div>

        <div className="flex flex-col gap-4">
          {walls.length === 0 && (
            <div className="rounded-lg border border-(--border-hairline) bg-surface p-4 text-sm text-secondary">
              社会保険上の扶養に入っていない場合、社会保険の壁は表示されません。
            </div>
          )}
          {walls.map((status) => (
            <WallGauge key={status.wall.key} status={status} />
          ))}
          <IncomeChart series={series} walls={walls} targetYear={profile.targetYear} />
        </div>
      </div>
    </main>
  );
}
