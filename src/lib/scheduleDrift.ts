import type { Job } from "./types";
import type { ActualShiftRecord } from "./actualShiftData";

const WINDOW_WEEKS = 6;
const MIN_WORKED_DAYS = 8; // この件数未満は実績が薄すぎて提案の根拠にしない
const DRIFT_RATIO_THRESHOLD = 0.2; // 週の合計時間が予定から20%以上ズレたら提案する

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export interface ScheduleDrift {
  jobId: string;
  jobName: string;
  plannedDaysPerWeek: number;
  plannedHoursPerDay: number;
  actualDaysPerWeek: number;
  actualHoursPerDay: number;
}

/**
 * 「予定(Job.daysPerWeek/hoursPerDay)」と「直近の実績(ActualShiftRecord)」がズレていたら検出する。
 * 自動で上書きはしない(予定と実績は別物、という設計原則を守るため) — あくまで気づかせて、
 * 実際に反映するかどうかはユーザーの明示的な操作に委ねる。
 */
export function detectScheduleDrift(
  job: Job,
  records: ActualShiftRecord[],
  now: Date = new Date(),
): ScheduleDrift | null {
  const plannedWeeklyHours = job.daysPerWeek * job.hoursPerDay;
  if (plannedWeeklyHours <= 0) return null;

  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - WINDOW_WEEKS * 7);
  const windowStartStr = windowStart.toISOString().slice(0, 10);
  const nowStr = now.toISOString().slice(0, 10);

  const relevant = records.filter(
    (r) => r.jobId === job.id && r.date >= windowStartStr && r.date <= nowStr && r.hours > 0,
  );
  if (relevant.length < MIN_WORKED_DAYS) return null;

  const totalHours = relevant.reduce((sum, r) => sum + r.hours, 0);
  const actualDaysPerWeek = round1(relevant.length / WINDOW_WEEKS);
  const actualHoursPerDay = round1(totalHours / relevant.length);
  const actualWeeklyHours = actualDaysPerWeek * actualHoursPerDay;

  const ratio = Math.abs(actualWeeklyHours - plannedWeeklyHours) / plannedWeeklyHours;
  if (ratio < DRIFT_RATIO_THRESHOLD) return null;

  return {
    jobId: job.id,
    jobName: job.name || "バイト",
    plannedDaysPerWeek: job.daysPerWeek,
    plannedHoursPerDay: job.hoursPerDay,
    actualDaysPerWeek,
    actualHoursPerDay,
  };
}

export function detectAllScheduleDrifts(
  jobs: Job[],
  records: ActualShiftRecord[],
  now: Date = new Date(),
): ScheduleDrift[] {
  return jobs
    .map((job) => detectScheduleDrift(job, records, now))
    .filter((d): d is ScheduleDrift => d !== null);
}
