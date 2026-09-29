import type { Job } from "./types";

/**
 * 日別のシフト実績。シミュレーション側のJob.weekdaysとは完全に独立したデータで、
 * 「予定」と「実績」を混ぜないためにあえて別の配列として持つ。
 * hoursが0のレコードは「予定はあったが休んだ」ことを明示的に表す。
 */
export interface ActualShiftRecord {
  date: string; // "YYYY-MM-DD"
  jobId: string;
  hours: number;
}

/** そのバイトの曜日パターン上、指定日は働く予定だったか。予定の時間(hoursPerDay)を返す。予定が無ければ0 */
export function getPatternHours(job: Job, date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const dateObj = new Date(y, m - 1, d);
  const endMonth = job.endMonth ?? 12;
  const inRange = m >= job.startMonth && m <= endMonth;
  const isPatternDay = inRange && (job.weekdays?.includes(dateObj.getDay()) ?? false);
  return isPatternDay ? job.hoursPerDay : 0;
}

export function findRecord(
  records: ActualShiftRecord[],
  jobId: string,
  date: string,
): ActualShiftRecord | undefined {
  return records.find((r) => r.jobId === jobId && r.date === date);
}

export function upsertRecord(
  records: ActualShiftRecord[],
  jobId: string,
  date: string,
  hours: number,
): ActualShiftRecord[] {
  const exists = records.some((r) => r.jobId === jobId && r.date === date);
  if (exists) {
    return records.map((r) => (r.jobId === jobId && r.date === date ? { ...r, hours } : r));
  }
  return [...records, { jobId, date, hours }];
}

export function clearRecord(records: ActualShiftRecord[], jobId: string, date: string): ActualShiftRecord[] {
  return records.filter((r) => !(r.jobId === jobId && r.date === date));
}
