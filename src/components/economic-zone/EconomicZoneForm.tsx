"use client";

import type { EconomicZoneInput } from "@/lib/types";

interface EconomicZoneFormProps {
  input: EconomicZoneInput;
  onChange: (input: EconomicZoneInput) => void;
}

const selectClass =
  "rounded border border-(--border-hairline) bg-transparent px-2 py-1.5 text-sm text-primary outline-none focus:border-series-1";
const numberInputClass = selectClass;

export function EconomicZoneForm({ input, onChange }: EconomicZoneFormProps) {
  function set<K extends keyof EconomicZoneInput>(key: K, value: EconomicZoneInput[K]) {
    onChange({ ...input, [key]: value });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="mb-3 text-sm font-semibold text-primary">クレジットカード</div>
        <label className="mb-3 flex flex-col gap-1 text-xs text-secondary">
          現在使っているカード
          <select
            value={input.currentCard}
            onChange={(e) => set("currentCard", e.target.value as EconomicZoneInput["currentCard"])}
            className={selectClass}
          >
            <option value="yucho">ゆうちょ JP BANKカード</option>
            <option value="juroku_debit">十六銀行デビットカード</option>
            <option value="rakuten">楽天カード</option>
            <option value="paypay">PayPayカード</option>
            <option value="dcard">dカード</option>
            <option value="mitsui_sumitomo_nl">三井住友カード(NL)</option>
            <option value="other">その他</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-secondary">
          月のカード利用額（円）
          <input
            type="number"
            min={0}
            value={input.monthlyCardSpend}
            onChange={(e) => set("monthlyCardSpend", Number(e.target.value))}
            className={numberInputClass}
          />
        </label>
      </div>

      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="mb-3 text-sm font-semibold text-primary">NISA運用先</div>
        <label className="mb-3 flex flex-col gap-1 text-xs text-secondary">
          現在の運用先
          <select
            value={input.currentNisaBroker}
            onChange={(e) =>
              set("currentNisaBroker", e.target.value as EconomicZoneInput["currentNisaBroker"])
            }
            className={selectClass}
          >
            <option value="yucho">ゆうちょ銀行</option>
            <option value="rakuten">楽天証券</option>
            <option value="sbi">SBI証券</option>
            <option value="other">その他</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-secondary">
          NISA運用残高（円）
          <input
            type="number"
            min={0}
            value={input.nisaBalance}
            onChange={(e) => set("nisaBalance", Number(e.target.value))}
            className={numberInputClass}
          />
        </label>
      </div>

      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="mb-3 text-sm font-semibold text-primary">通信キャリア</div>
        <label className="mb-3 flex flex-col gap-1 text-xs text-secondary">
          現在のキャリア
          <select
            value={input.currentTelecom}
            onChange={(e) =>
              set("currentTelecom", e.target.value as EconomicZoneInput["currentTelecom"])
            }
            className={selectClass}
          >
            <option value="docomo">docomo</option>
            <option value="au">au</option>
            <option value="softbank">ソフトバンク</option>
            <option value="rakuten_mobile">楽天モバイル</option>
            <option value="other">その他</option>
          </select>
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
            className={numberInputClass}
          />
        </label>
      </div>

      <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
        <div className="mb-3 text-sm font-semibold text-primary">銀行</div>
        <label className="flex flex-col gap-1 text-xs text-secondary">
          現在使っている銀行
          <select
            value={input.currentBank}
            onChange={(e) => set("currentBank", e.target.value as EconomicZoneInput["currentBank"])}
            className={selectClass}
          >
            <option value="yucho_juroku">ゆうちょ銀行・十六銀行</option>
            <option value="rakuten">楽天銀行</option>
            <option value="other">その他</option>
          </select>
        </label>
      </div>
    </div>
  );
}
