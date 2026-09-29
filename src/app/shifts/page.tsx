"use client";

import Link from "next/link";
import { ActualShiftCalendar } from "@/components/shifts/ActualShiftCalendar";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { DEFAULT_JOBS, DEFAULT_PROFILE } from "@/lib/defaultData";
import type { ActualShiftRecord } from "@/lib/actualShiftData";
import type { DependencyProfile, Job } from "@/lib/types";

export default function ShiftsPage() {
  // シミュレーター側の予定(jobs)は読み取り専用で参照するだけで、ここからは書き換えない
  const [jobs] = useLocalStorageState<Job[]>("simulator:jobs", DEFAULT_JOBS);
  const [profile] = useLocalStorageState<DependencyProfile>("simulator:profile", DEFAULT_PROFILE);
  const [records, setRecords] = useLocalStorageState<ActualShiftRecord[]>("shifts:actualShifts", []);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-series-1">
          ← トップに戻る
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-primary">シフト実績</h1>
        <p className="mt-1 text-sm text-secondary">
          実際に働いた日を記録します。シミュレーターの「稼働カレンダー」はあくまで予定（今の設定を続けたらどうなるか）で、ここでの記録には影響しません。予定と実績を分けて見比べられるようにしています。入力内容はブラウザのlocalStorageに保存されます（サーバーには送信されません）。
        </p>
        <Link href="/simulator" className="mt-2 inline-block text-sm text-brand hover:opacity-80">
          シミュレーターの予定を編集する →
        </Link>
      </div>

      <ActualShiftCalendar jobs={jobs} records={records} onChange={setRecords} year={profile.targetYear} />
    </main>
  );
}
