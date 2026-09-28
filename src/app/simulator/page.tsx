"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { JobForm } from "@/components/simulator/JobForm";
import { ProfileForm } from "@/components/simulator/ProfileForm";
import { WallStatusPanel } from "@/components/simulator/WallStatusPanel";
import { IncomeChart, type IncomeSeries } from "@/components/simulator/IncomeChart";
import { ScenarioForm } from "@/components/simulator/ScenarioForm";
import { ScenarioComparisonTable } from "@/components/simulator/ScenarioComparisonTable";
import { ActualComparisonChart } from "@/components/simulator/ActualComparisonChart";
import { ActualIncomeForm } from "@/components/simulator/ActualIncomeForm";
import { PageTabs } from "@/components/simulator/PageTabs";
import { DataPortability } from "@/components/simulator/DataPortability";
import { cumulativeByMonth, evaluateWalls, getWalls } from "@/lib/wallCalculator";
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
    endMonth: null,
    monthlyCommutingAllowance: 0,
  },
  {
    id: "job-vexum",
    name: "VEXUM",
    hourlyWage: 1300,
    daysPerWeek: 1,
    hoursPerDay: 3.5,
    startMonth: 8,
    endMonth: null,
    monthlyCommutingAllowance: 0,
  },
];

const DEFAULT_PROFILE: DependencyProfile = {
  currentAge: 19,
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

const SCENARIO_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];

const PAGE_TABS = [
  { id: "status", label: "今の状況" },
  { id: "trend", label: "月別推移" },
  { id: "scenario", label: "シナリオ比較" },
  { id: "actual", label: "実績との答え合わせ" },
];

export default function SimulatorPage() {
  const [pageTab, setPageTab] = useState("status");
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

  function addScenario() {
    // crypto.randomUUID()を使うのは、モジュール内カウンターだとページ再読み込みで
    // 1から採番し直され、localStorage保存済みのシナリオ/バイトIDと衝突するバグがあったため
    setExtraScenarios([
      ...extraScenarios,
      {
        id: `scenario-${crypto.randomUUID()}`,
        name: `シナリオ${extraScenarios.length + 2}`,
        jobs: jobs.map((j) => ({ ...j, id: `job-${crypto.randomUUID()}` })),
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

  function handleImport(data: {
    jobs: Job[];
    profile: DependencyProfile;
    extraScenarios: Scenario[];
    actualIncome: ActualIncomeRecord[];
  }) {
    setJobs(data.jobs);
    setProfile(data.profile);
    setExtraScenarios(data.extraScenarios);
    setActualIncome(data.actualIncome);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="text-sm text-muted hover:text-series-1">
            ← トップに戻る
          </Link>
          <div className="flex items-center gap-3">
            <DataPortability
              jobs={jobs}
              profile={profile}
              extraScenarios={extraScenarios}
              actualIncome={actualIncome}
              onImport={handleImport}
            />
            <span aria-hidden className="text-xs text-muted">
              /
            </span>
            <button
              type="button"
              onClick={resetToDefaults}
              className="text-xs text-muted hover:text-status-critical"
            >
              入力を初期値に戻す
            </button>
          </div>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-primary">
          マルチジョブ扶養最適化シミュレーター
        </h1>
        <p className="mt-1 text-sm text-secondary">
          複数バイトの時給・シフト・開始月を入力すると、123万円の壁・社会保険の壁までの残り稼働可能時間と、超えた場合の負担額の目安を横断で確認できます。入力内容はブラウザのlocalStorageに保存され、次回も引き継がれます（サーバーには送信されません）。
        </p>
      </div>

      <PageTabs tabs={PAGE_TABS} active={pageTab} onChange={setPageTab} />

      {pageTab === "status" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="flex flex-col gap-4">
            <ProfileForm profile={profile} onChange={setProfile} />
            <JobForm jobs={jobs} onChange={setJobs} />
          </div>
          <div className="flex flex-col gap-4">
            <WallStatusPanel walls={walls} />
          </div>
        </div>
      )}

      {pageTab === "trend" && (
        <IncomeChart series={series} walls={walls} targetYear={profile.targetYear} />
      )}

      {pageTab === "scenario" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-secondary">
              「バイトを1つ増やしたら」「今のバイトを辞めたら」を現状と並べて比較できます。
            </p>
            <button
              type="button"
              onClick={addScenario}
              className="shrink-0 rounded border border-dashed border-series-2 px-3 py-1.5 text-sm text-series-2 hover:opacity-80"
            >
              + 比較シナリオを追加
            </button>
          </div>

          {extraScenarios.length === 0 ? (
            <p className="text-sm text-secondary">上のボタンから追加してください。</p>
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
      )}

      {pageTab === "actual" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ActualIncomeForm records={actualIncome} onChange={setActualIncome} />
          <ActualComparisonChart jobs={jobs} actualIncome={actualIncome} />
        </div>
      )}
    </main>
  );
}
