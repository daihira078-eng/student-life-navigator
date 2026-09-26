"use client";

import type { EconomicZoneInput } from "@/lib/types";

interface EconomicZoneFormProps {
  input: EconomicZoneInput;
  onChange: (input: EconomicZoneInput) => void;
}

export function EconomicZoneForm({ input, onChange }: EconomicZoneFormProps) {
  function set<K extends keyof EconomicZoneInput>(key: K, value: EconomicZoneInput[K]) {
    onChange({ ...input, [key]: value });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="mb-3 text-sm font-semibold text-primary">クレジットカード</div>
        <label className="mb-3 flex items-center justify-between gap-2 text-sm">
          <span className="text-secondary">楽天カードを使っている</span>
          <input
            type="checkbox"
            checked={input.usesRakutenCard}
            onChange={(e) => set("usesRakutenCard", e.target.checked)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-secondary">
          月のカード利用額（円）
          <input
            type="number"
            min={0}
            value={input.monthlyCardSpend}
            onChange={(e) => set("monthlyCardSpend", Number(e.target.value))}
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
          />
        </label>
      </div>

      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="mb-3 text-sm font-semibold text-primary">NISA運用先</div>
        <label className="mb-3 flex items-center justify-between gap-2 text-sm">
          <span className="text-secondary">楽天証券で運用している</span>
          <input
            type="checkbox"
            checked={input.usesRakutenNisa}
            onChange={(e) => set("usesRakutenNisa", e.target.checked)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-secondary">
          NISA運用残高（円）
          <input
            type="number"
            min={0}
            value={input.nisaBalance}
            onChange={(e) => set("nisaBalance", Number(e.target.value))}
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
          />
        </label>
      </div>

      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="mb-3 text-sm font-semibold text-primary">通信キャリア</div>
        <label className="mb-3 flex items-center justify-between gap-2 text-sm">
          <span className="text-secondary">楽天モバイルを使っている</span>
          <input
            type="checkbox"
            checked={input.usesRakutenMobile}
            onChange={(e) => set("usesRakutenMobile", e.target.checked)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-secondary">
          現在の月額料金（円、わからなければ空欄）
          <input
            type="number"
            min={0}
            value={input.currentTelecomMonthlyFee ?? ""}
            onChange={(e) =>
              set(
                "currentTelecomMonthlyFee",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            className="rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1"
          />
        </label>
      </div>

      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="mb-3 text-sm font-semibold text-primary">銀行</div>
        <label className="flex items-center justify-between gap-2 text-sm">
          <span className="text-secondary">楽天銀行を使っている</span>
          <input
            type="checkbox"
            checked={input.usesRakutenBank}
            onChange={(e) => set("usesRakutenBank", e.target.checked)}
          />
        </label>
      </div>
    </div>
  );
}
