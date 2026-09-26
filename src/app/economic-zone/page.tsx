"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EconomicZoneForm } from "@/components/economic-zone/EconomicZoneForm";
import { FixedCostForm } from "@/components/economic-zone/FixedCostForm";
import { DiagnosisCard } from "@/components/economic-zone/DiagnosisCard";
import {
  diagnoseEconomicZone,
  suggestSubscriptionTips,
  totalAnnualSavingPotential,
  totalMonthlyFixedCost,
} from "@/lib/economicZone";
import { formatYen } from "@/lib/format";
import type { EconomicZoneInput } from "@/lib/types";

const DEFAULT_INPUT: EconomicZoneInput = {
  currentCard: "yucho",
  monthlyCardSpend: 50000,
  shoppingPriority: "none",
  currentNisaBroker: "yucho",
  nisaBalance: 48000,
  currentTelecom: "docomo",
  currentTelecomMonthlyFee: null,
  dataUsageTier: "medium",
  currentBank: "rakuten",
  fixedCosts: [
    { id: "cost-netflix", name: "Netflix（スタンダード）", monthlyAmount: 1590, frequency: "weekly" },
    { id: "cost-prime", name: "Amazon Prime（通常）", monthlyAmount: 500, frequency: "weekly" },
    { id: "cost-claude", name: "Claude Pro（個人）", monthlyAmount: 3000, frequency: "daily" },
  ],
};

export default function EconomicZonePage() {
  const [input, setInput] = useState<EconomicZoneInput>(DEFAULT_INPUT);

  const results = useMemo(() => diagnoseEconomicZone(input), [input]);
  const totalSaving = useMemo(() => totalAnnualSavingPotential(results), [results]);
  const subscriptionTips = useMemo(
    () => suggestSubscriptionTips(input.fixedCosts),
    [input.fixedCosts],
  );
  const monthlyFixedCost = totalMonthlyFixedCost(input.fixedCosts);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-series-1">
          ← トップに戻る
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-primary">
          経済圏・固定費最適化診断
        </h1>
        <p className="mt-1 text-sm text-secondary">
          現在契約中の銀行・カード・通信・NISAを入力すると、開発者が実際に乗り換えた楽天経済圏との年間差額を試算します。他の選択肢（PayPayカード等）は含まれておらず、万人への「推奨」ではなく個人的な比較の記録です。入力内容はブラウザ内だけで計算され、サーバーには送信されません。
        </p>
      </div>

      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="text-xs text-muted">年間の差額（合計、データがある項目のみ）</div>
        <div className="mt-1 text-3xl font-semibold text-status-good">
          {formatYen(totalSaving)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <EconomicZoneForm input={input} onChange={setInput} />
          <FixedCostForm
            fixedCosts={input.fixedCosts}
            onChange={(fixedCosts) => setInput({ ...input, fixedCosts })}
          />
        </div>

        <div className="flex flex-col gap-4">
          {results.map((result) => (
            <DiagnosisCard key={result.category} result={result} />
          ))}

          <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-primary">固定費・サブスク合計</span>
              <span className="text-sm font-medium text-primary">
                {formatYen(monthlyFixedCost)}/月
              </span>
            </div>
            {subscriptionTips.map((tip) => (
              <div
                key={tip.costId}
                className="mt-2 rounded-md border border-dashed border-series-1 p-3 text-sm"
              >
                <span className="font-medium text-primary">{tip.costName}: </span>
                <span className="text-secondary">{tip.message}</span>
                <span className="ml-1 font-medium text-status-good">
                  （年間 {formatYen(tip.annualSaving)}）
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
