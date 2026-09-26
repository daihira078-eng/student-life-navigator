"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { JobForm } from "@/components/simulator/JobForm";
import { ProfileForm } from "@/components/simulator/ProfileForm";
import { WallGauge } from "@/components/simulator/WallGauge";
import { IncomeChart, type IncomeSeries } from "@/components/simulator/IncomeChart";
import { ScenarioForm } from "@/components/simulator/ScenarioForm";
import { ScenarioComparisonTable } from "@/components/simulator/ScenarioComparisonTable";
import { MultiYearTable } from "@/components/simulator/MultiYearTable";
import { MultiYearChart } from "@/components/simulator/MultiYearChart";
import { ActualComparisonChart } from "@/components/simulator/ActualComparisonChart";
import { ActualIncomeForm } from "@/components/simulator/ActualIncomeForm";
import { cumulativeByMonth, evaluateMultiYear, evaluateWalls, getWalls } from "@/lib/wallCalculator";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { ACTUAL_INCOME_2026, type ActualIncomeRecord } from "@/lib/actualIncomeData";
import type { DependencyProfile, Job, Scenario } from "@/lib/types";

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
  currentAge: 19,
  socialInsuranceDependent: true,
  targetYear: new Date().getFullYear(),
};

const MULTI_YEAR_SPAN = 7;

const SERIES_LABEL: Record<string, string> = {
  incomeTax: "所得税ベースの収入（通勤手当を除く）",
  socialInsurance: "社会保険ベースの収入（通勤手当を含む）",
};

const SERIES_COLOR: Record<string, string> = {
  incomeTax: "var(--series-1)",
  socialInsurance: "var(--series-6)",
};

const SCENARIO_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];

let scenarioCounter = 1;

export default function SimulatorPage() {
  const [jobs, setJobs] = useLocalStorageState<Job[]>("simulator:jobs", DEFAULT_JOBS);
  const [profile, setProfile] = useLocalStorageState<DependencyProfile>(
    "simulator:profile",
    DEFAULT_PROFILE,
  );
  const [extraScenarios, setExtraScenarios] = useLocalStorageState<Scenario[]>(
    "simulator:extraScenarios",
    [],
  );
  const [actualIncome, setActualIncome] = useLocalStorageState<ActualIncomeRecord[]>(
    "simulator:actualIncome",
    ACTUAL_INCOME_2026,
  );

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

  const wallOptions = useMemo(() => getWalls(profile), [profile]);
  const [comparisonWallKey, setComparisonWallKey] = useState(wallOptions[0]?.key);
  const activeComparisonWallKey = wallOptions.some((w) => w.key === comparisonWallKey)
    ? comparisonWallKey
    : wallOptions[0]?.key;

  const allScenarios: Scenario[] = useMemo(
    () => [{ id: "current", name: "現状", jobs }, ...extraScenarios],
    [jobs, extraScenarios],
  );

  const comparisonSeries: IncomeSeries[] = useMemo(() => {
    if (!activeComparisonWallKey) return [];
    return allScenarios.map((s, i) => ({
      key: s.id,
      label: s.name,
      cumulative: cumulativeByMonth(s.jobs, activeComparisonWallKey),
      color: SCENARIO_COLORS[i % SCENARIO_COLORS.length],
    }));
  }, [allScenarios, activeComparisonWallKey]);

  const comparisonWalls = useMemo(
    () => (activeComparisonWallKey ? walls.filter((w) => w.wall.key === activeComparisonWallKey) : []),
    [walls, activeComparisonWallKey],
  );

  const multiYearPoints = useMemo(
    () => evaluateMultiYear(jobs, profile, MULTI_YEAR_SPAN),
    [jobs, profile],
  );
  const [multiYearWallKey, setMultiYearWallKey] = useState(wallOptions[0]?.key);
  const activeMultiYearWallKey = wallOptions.some((w) => w.key === multiYearWallKey)
    ? multiYearWallKey
    : wallOptions[0]?.key;

  function addScenario() {
    setExtraScenarios([
      ...extraScenarios,
      {
        id: `scenario-${scenarioCounter++}`,
        name: `シナリオ${extraScenarios.length + 2}`,
        jobs: jobs.map((j) => ({ ...j, id: `${j.id}-copy-${scenarioCounter}` })),
      },
    ]);
  }

  function updateScenario(id: string, next: Scenario) {
    setExtraScenarios(extraScenarios.map((s) => (s.id === id ? next : s)));
  }

  function removeScenario(id: string) {
    setExtraScenarios(extraScenarios.filter((s) => s.id !== id));
  }

  function resetToDefaults() {
    if (!window.confirm("入力内容を初期値に戻します。よろしいですか？")) return;
    setJobs(DEFAULT_JOBS);
    setProfile(DEFAULT_PROFILE);
    setExtraScenarios([]);
    setActualIncome(ACTUAL_INCOME_2026);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="text-sm text-muted hover:text-series-1">
            ← トップに戻る
          </Link>
          <button
            type="button"
            onClick={resetToDefaults}
            className="text-xs text-muted hover:text-status-critical"
          >
            入力を初期値に戻す
          </button>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-primary">
          マルチジョブ扶養最適化シミュレーター
        </h1>
        <p className="mt-1 text-sm text-secondary">
          複数バイトの時給・シフト・開始月を入力すると、123万円の壁・社会保険の壁までの残り稼働可能時間と、超えた場合の負担額の目安を横断で確認できます。通勤手当は所得税の壁では非課税(除外)、社会保険の壁では収入に含めて計算します。入力内容はブラウザのlocalStorageに保存され、次回も引き継がれます（サーバーには送信されません）。
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

      <div className="border-t border-(--border-hairline) pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">シナリオ比較</h2>
          <button
            type="button"
            onClick={addScenario}
            className="rounded border border-dashed border-series-2 px-3 py-1.5 text-sm text-series-2 hover:opacity-80"
          >
            + 比較シナリオを追加（例: バイト追加/バイトを辞める）
          </button>
        </div>

        {extraScenarios.length === 0 ? (
          <p className="text-sm text-secondary">
            「バイトを1つ増やしたら」「今のバイトを辞めたら」を現状と並べて比較できます。上のボタンから追加してください。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {extraScenarios.map((scenario) => (
              <ScenarioForm
                key={scenario.id}
                scenario={scenario}
                onChange={(next) => updateScenario(scenario.id, next)}
                onRemove={() => removeScenario(scenario.id)}
              />
            ))}

            {wallOptions.length > 1 && (
              <label className="flex items-center gap-2 text-sm text-secondary">
                比較する壁
                <select
                  value={activeComparisonWallKey}
                  onChange={(e) =>
                    setComparisonWallKey(e.target.value as "incomeTax" | "socialInsurance")
                  }
                  className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary"
                >
                  {wallOptions.map((w) => (
                    <option key={w.key} value={w.key}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <ScenarioComparisonTable scenarios={allScenarios} profile={profile} />
            <IncomeChart
              series={comparisonSeries}
              walls={comparisonWalls}
              targetYear={profile.targetYear}
            />
          </div>
        )}
      </div>

      <div className="border-t border-(--border-hairline) pt-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">複数年シミュレーション</h2>
          {wallOptions.length > 1 && activeMultiYearWallKey && (
            <label className="flex items-center gap-2 text-sm text-secondary">
              見る壁
              <select
                value={activeMultiYearWallKey}
                onChange={(e) =>
                  setMultiYearWallKey(e.target.value as "incomeTax" | "socialInsurance")
                }
                className="rounded border border-(--border-hairline) bg-transparent px-2 py-1 text-primary"
              >
                {wallOptions.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.key === "incomeTax" ? "所得税の壁" : "社会保険の壁"}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <p className="mb-3 text-sm text-secondary">
          今と同じバイトの組み合わせを続けた場合、年齢が上がるにつれて壁がどう変わるかを{MULTI_YEAR_SPAN}
          年分先まで見せます。19〜23歳の間は社会保険の壁が150万円ですが、24歳になると130万円に戻ります。
        </p>
        <div className="flex flex-col gap-4">
          <MultiYearTable points={multiYearPoints} />
          {activeMultiYearWallKey && (
            <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
              <MultiYearChart points={multiYearPoints} wallKey={activeMultiYearWallKey} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-(--border-hairline) pt-6">
        <h2 className="mb-3 text-lg font-semibold text-primary">実績との答え合わせ</h2>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ActualIncomeForm records={actualIncome} onChange={setActualIncome} />
          <ActualComparisonChart jobs={jobs} actualIncome={actualIncome} />
        </div>
      </div>
    </main>
  );
}
