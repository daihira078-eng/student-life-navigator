"use client";

import { useState } from "react";
import type { Job, WallStatus } from "@/lib/types";
import type { ActualIncomeRecord } from "@/lib/actualIncomeData";
import { computeWallProgress, estimateEarnings, planGoal, type Goal } from "@/lib/goalPlanner";
import { formatHours, formatYen } from "@/lib/format";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { selectOnFocus } from "@/lib/selectOnFocus";

interface GoalPlannerProps {
  jobs: Job[];
  walls: WallStatus[];
  actualIncome: ActualIncomeRecord[];
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const GENERIC_NAME_EXAMPLES = ["旅行資金", "貯金", "生活費の足し"];

function newGoal(): Goal {
  return { id: `goal-${crypto.randomUUID()}`, name: "目標", amount: 50000, targetMonth: null };
}

export function GoalPlanner({ jobs, walls, actualIncome }: GoalPlannerProps) {
  const [goals, setGoals] = useLocalStorageState<Goal[]>("simulator:goals", [newGoal()]);

  const progress = walls.map((w) => computeWallProgress(jobs, w.wall, actualIncome));

  // 本人が過去につけた目標名(初期値の"目標"・空文字・重複は除く)。これまでの自分の
  // 傾向から候補を出す方が、誰にでも同じ汎用例を出すよりパーソナルになるため。
  const pastNames = Array.from(
    new Set(goals.map((g) => g.name.trim()).filter((n) => n !== "" && n !== "目標")),
  );

  function updateGoal(id: string, patch: Partial<Goal>) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function addGoal() {
    setGoals((prev) => [...prev, newGoal()]);
  }

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-1 text-sm font-semibold text-primary">目標から逆算</div>
      <p className="mb-3 text-xs text-secondary">
        「実績との答え合わせ」タブに入力済みの月はその実績を、未入力の月は今のシフト設定からの予測を使って、壁までの残り枠を計算します。目標に名前と期限をつけて複数管理でき、それぞれのバイト1つだけで賄うパターンと、全バイトに均等配分するパターンの両方を並べます。
      </p>

      {progress.length > 0 && (
        <div className="mb-4 flex flex-col gap-1.5 bg-(--page-plane) p-3 text-xs text-secondary">
          {progress.map((p) => (
            <div key={p.wallKey} className="flex items-center justify-between gap-2">
              <span>{p.wallLabel.split("（")[0]}（実績＋予測）</span>
              <span className="tabular-nums">
                <span className="font-semibold text-primary">{formatYen(p.blendedTotal)}</span>
                {" / "}
                {formatYen(p.threshold)}
                <span className="ml-1 text-muted">（残り{formatYen(p.remaining)}）</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col">
        <div className="mb-1 flex items-baseline justify-between border-b-2 border-(--text-primary) pb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">目標一覧</h2>
          <span className="text-[11px] text-muted">{goals.length}件</span>
        </div>
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            jobs={jobs}
            walls={walls}
            actualIncome={actualIncome}
            nameSuggestions={pastNames.filter((n) => n !== goal.name.trim())}
            onChange={(patch) => updateGoal(goal.id, patch)}
            onRemove={goals.length > 1 ? () => removeGoal(goal.id) : undefined}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addGoal}
        className="mt-3 rounded-md border border-dashed border-(--border-hairline) px-3 py-2 text-xs font-medium text-secondary outline-none hover:border-series-1 hover:text-primary focus-visible:ring-2 focus-visible:ring-brand"
      >
        ＋ 目標を追加
      </button>

      <ReverseEstimator jobs={jobs} />
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  jobs: Job[];
  walls: WallStatus[];
  actualIncome: ActualIncomeRecord[];
  nameSuggestions: string[];
  onChange: (patch: Partial<Goal>) => void;
  onRemove?: () => void;
}

function GoalCard({ goal, jobs, walls, actualIncome, nameSuggestions, onChange, onRemove }: GoalCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [exiting, setExiting] = useState(false);
  const plan = planGoal(jobs, walls, goal.amount, actualIncome, goal.targetMonth);

  function startRemove() {
    setConfirmingDelete(false);
    setExiting(true);
    setTimeout(() => onRemove?.(), 200);
  }

  return (
    <div
      className={`row-enter border-b border-(--gridline) px-2 py-4 -mx-2 transition-[opacity,transform] duration-200 hover:bg-(--page-plane) ${
        exiting ? "pointer-events-none -translate-x-1 opacity-0" : ""
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={goal.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onFocus={selectOnFocus}
          placeholder="目標の名前"
          className="min-w-0 flex-1 rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm font-medium text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
        />
        {onRemove &&
          (confirmingDelete ? (
            <span className="flex shrink-0 items-center gap-2 text-xs">
              <span className="text-secondary">削除する？</span>
              <button
                type="button"
                onClick={startRemove}
                className="font-semibold text-status-critical hover:opacity-80"
              >
                削除する
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-muted hover:text-primary"
              >
                キャンセル
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label="この目標を削除"
              className="rounded px-2 py-1 text-xs text-muted outline-none hover:text-status-critical focus-visible:ring-2 focus-visible:ring-brand"
            >
              削除
            </button>
          ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(nameSuggestions.length > 0 ? nameSuggestions : GENERIC_NAME_EXAMPLES).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange({ name })}
            className="rounded-full border border-(--border-hairline) px-2.5 py-1 text-xs text-secondary outline-none hover:border-series-1 hover:text-primary focus-visible:ring-2 focus-visible:ring-brand"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-secondary">追加で稼ぎたい金額</span>
          <input
            type="number"
            min={0}
            value={goal.amount}
            onChange={(e) => onChange({ amount: Number(e.target.value) })}
            onFocus={selectOnFocus}
            className="w-28 rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
          />
          <span className="text-xs text-muted">円</span>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-secondary">いつまでに</span>
          <select
            value={goal.targetMonth ?? ""}
            onChange={(e) => onChange({ targetMonth: e.target.value === "" ? null : Number(e.target.value) })}
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="">年内（12月末）</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}月末まで
              </option>
            ))}
          </select>
        </label>
      </div>

      {plan && (
        <div className="mt-3 border-t border-(--gridline) pt-3 text-sm text-secondary">
          {plan.shortfall > 0 && (
            <p className="mb-3">
              <span className="font-semibold text-status-critical">{plan.bindingWallLabel}</span>
              の制約により、目標
              <span className="font-semibold text-primary">{formatYen(goal.amount)}</span>
              のうち
              <span className="font-semibold text-status-critical">{formatYen(plan.shortfall)}分</span>
              は壁を超えないと達成できません。壁以内で達成できる最大額は
              <span className="font-semibold text-primary">{formatYen(plan.achievableAmount)}</span>
              です。
            </p>
          )}

          <p className="mb-2 text-xs text-muted">
            {formatYen(plan.achievableAmount)}を、それぞれ1つのバイトだけで賄う場合に必要な週の増加時間（時給が高い順）
          </p>
          <ul className="flex flex-col gap-1.5">
            {plan.allocations.map((a) => (
              <li
                key={a.jobId}
                className="flex items-center justify-between gap-2 bg-(--page-plane) px-3 py-2"
              >
                <span className="font-medium text-primary">
                  {a.jobName}
                  <span className="ml-1.5 text-xs text-muted">（時給{formatYen(a.hourlyWage)}）</span>
                </span>
                <span className="font-semibold text-brand">
                  {a.weeklyHourIncrease === null ? (
                    <span className="text-status-critical">期限内は稼働不可</span>
                  ) : (
                    `週約${formatHours(a.weeklyHourIncrease)}`
                  )}
                </span>
              </li>
            ))}
          </ul>

          {plan.evenSplit && (
            <>
              <p className="mb-2 mt-3 text-xs text-muted">全バイトに均等配分する場合（1バイトあたり{formatYen(plan.achievableAmount / plan.evenSplit.length)}）</p>
              <ul className="flex flex-col gap-1.5">
                {plan.evenSplit.map((a) => (
                  <li
                    key={a.jobId}
                    className="flex items-center justify-between gap-2 bg-(--page-plane) px-3 py-2"
                  >
                    <span className="font-medium text-primary">
                      {a.jobName}
                      <span className="ml-1.5 text-xs text-muted">（時給{formatYen(a.hourlyWage)}）</span>
                    </span>
                    <span className="font-semibold text-brand">
                      {a.weeklyHourIncrease === null ? (
                        <span className="text-status-critical">期限内は稼働不可</span>
                      ) : (
                        `週約${formatHours(a.weeklyHourIncrease)}`
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReverseEstimator({ jobs }: { jobs: Job[] }) {
  const [jobId, setJobId] = useState<string>(jobs[0]?.id ?? "");
  const [weeklyHours, setWeeklyHours] = useState<number>(2);
  const [targetMonth, setTargetMonth] = useState<number | null>(null);

  const selectedJob = jobs.find((j) => j.id === jobId) ?? jobs[0];
  const earnings = selectedJob ? estimateEarnings(selectedJob, weeklyHours, targetMonth) : null;

  if (jobs.length === 0) return null;

  return (
    <div className="mt-5 border-t border-(--gridline) pt-4">
      <div className="mb-1 text-sm font-semibold text-primary">逆に、時間から金額を計算する</div>
      <p className="mb-3 text-xs text-secondary">
        シフトの空きが週◯時間までしかない、など時間の方が制約になっている場合に。週の勤務時間をどれだけ増やせるかを入れると、期限までにいくら稼げるかを計算します。
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-secondary">バイト</span>
          <select
            value={selectedJob?.id ?? ""}
            onChange={(e) => setJobId(e.target.value)}
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name || "バイト"}（時給{formatYen(j.hourlyWage)}）
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-secondary">週に増やす時間</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            onFocus={selectOnFocus}
            className="w-20 rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
          />
          <span className="text-xs text-muted">時間</span>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-secondary">いつまで</span>
          <select
            value={targetMonth ?? ""}
            onChange={(e) => setTargetMonth(e.target.value === "" ? null : Number(e.target.value))}
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-primary outline-none focus:border-series-1 focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="">年内（12月末）</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}月末まで
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-sm text-secondary">
        {earnings === null ? (
          <span className="text-status-critical">この期間はバイトの稼働期間外のため計算できません</span>
        ) : (
          <>
            稼げる見込み額は <span className="font-semibold text-brand">{formatYen(earnings)}</span>
          </>
        )}
      </p>
    </div>
  );
}
