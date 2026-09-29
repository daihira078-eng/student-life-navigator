import type { Job, WallDefinition } from "./types";

export interface ShiftDay {
  date: string; // "YYYY-MM-DD"
  jobId: string;
  hours: number;
  amount: number; // その日の時給換算額(通勤手当は含まない)
}

/**
 * job.weekdaysに基づき、指定した年の実際のカレンダー日付でシフト日を列挙する。
 * daysPerWeekのような抽象的な週平均ではなく、「何月何日に働くか」まで具体化することで、
 * 壁到達日をピンポイントで計算できるようにする。
 */
export function generateShiftDays(job: Job, year: number): ShiftDay[] {
  if (!job.weekdays || job.weekdays.length === 0) return [];

  const start = new Date(year, job.startMonth - 1, 1);
  const endMonthExclusive = job.endMonth ?? 12;
  const end = new Date(year, endMonthExclusive, 0); // その月の末日
  const days: ShiftDay[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (job.weekdays.includes(d.getDay())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      days.push({
        date: `${y}-${m}-${day}`,
        jobId: job.id,
        hours: job.hoursPerDay,
        amount: job.hoursPerDay * job.hourlyWage,
      });
    }
  }

  return days;
}

/**
 * 実際のシフト日(＋社会保険の壁のみ通勤手当を月初に計上)を日付順に積み上げて、
 * 壁に到達する具体的な日付を求める。weekdaysを指定していないバイトは対象外
 * (月平均ベースの既存計算はwallCalculator.ts側で従来通り扱う)。
 */
export function computeWallCrossingDate(
  jobs: Job[],
  year: number,
  wallKey: WallDefinition["key"],
  threshold: number,
): string | null {
  const events: { date: string; amount: number }[] = [];

  for (const job of jobs) {
    if (!job.weekdays || job.weekdays.length === 0) continue;

    for (const day of generateShiftDays(job, year)) {
      events.push({ date: day.date, amount: day.amount });
    }

    if (wallKey === "socialInsurance" && job.monthlyCommutingAllowance) {
      const endMonth = job.endMonth ?? 12;
      for (let m = job.startMonth; m <= endMonth; m++) {
        events.push({
          date: `${year}-${String(m).padStart(2, "0")}-01`,
          amount: job.monthlyCommutingAllowance,
        });
      }
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));

  let cumulative = 0;
  for (const e of events) {
    cumulative += e.amount;
    if (cumulative >= threshold) return e.date;
  }
  return null;
}
