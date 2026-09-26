import type {
  BankOption,
  CardOption,
  DataUsageTier,
  DiagnosisResult,
  EconomicZoneInput,
  FixedCost,
  NisaBrokerOption,
  ShoppingPriority,
  SubscriptionTip,
  TelecomOption,
  UsageFrequency,
} from "./types";

/**
 * ここにある数値は「調べて裏取りできたもの」だけ。調べていない組み合わせ(十六銀行デビット等)は
 * rate: null にして、DiagnosisResultでも annualDiff を出さず「比較データなし」と表示する。
 * 出典はdocs/REQUIREMENTS.mdの参考資料を参照。2026年9月時点のスナップショット。
 */
const CARD_RATE: Record<CardOption, { label: string; rate: number | null }> = {
  yucho: { label: "ゆうちょ JP BANKカード", rate: 0.005 },
  juroku_debit: { label: "十六銀行デビットカード", rate: null },
  rakuten: { label: "楽天カード", rate: 0.01 },
  paypay: { label: "PayPayカード", rate: 0.01 },
  dcard: { label: "dカード", rate: 0.01 },
  mitsui_sumitomo_nl: { label: "三井住友カード(NL)", rate: 0.005 },
  other: { label: "その他のカード", rate: null },
};

// よく使う決済/経済圏ごとの「基本還元率より有利になりうる」ベストフィットカード
const CARD_BEST_FIT: Record<
  Exclude<ShoppingPriority, "none">,
  { cardOption: CardOption; note: string }
> = {
  rakuten_market: {
    cardOption: "rakuten",
    note: "楽天市場では基本1%+SPU(条件で3〜7%)=合計4〜8%が目安。基本還元率だけの比較より効果が大きい",
  },
  yahoo_paypay: {
    cardOption: "paypay",
    note: "Yahoo!ショッピングでは基本1%+ストアポイント2%=3%程度。PayPay残高へチャージできる唯一のクレジットカード",
  },
  d_payment: {
    cardOption: "dcard",
    note: "d払いとの連携で上乗せがあるとされるが、具体的な還元率は未確認（基本還元率1.0%のみで試算）",
  },
  convenience_touch: {
    cardOption: "mitsui_sumitomo_nl",
    note: "対象コンビニ・飲食店でのタッチ決済で7%還元（要エントリー等の条件あり）。日常の少額決済が多いほど効く",
  },
};

const NISA_FEE: Record<NisaBrokerOption, { label: string; rate: number | null }> = {
  yucho: { label: "ゆうちょ銀行", rate: 0.003 },
  rakuten: { label: "楽天証券", rate: 0.00081 },
  sbi: { label: "SBI証券（eMAXIS Slim全世界株式）", rate: 0.0005775 },
  other: { label: "その他", rate: null },
};

const TELECOM_LABEL: Record<TelecomOption, string> = {
  docomo: "docomo",
  au: "au",
  softbank: "ソフトバンク",
  rakuten_mobile: "楽天モバイル",
  other: "その他",
};

const BANK_LABEL: Record<BankOption, string> = {
  yucho_juroku: "ゆうちょ銀行・十六銀行",
  rakuten: "楽天銀行",
  other: "その他",
};

const DATA_TIER_LABEL: Record<DataUsageTier, string> = {
  light: "〜3GB程度",
  medium: "3〜20GB程度",
  heavy: "20GB以上・無制限に使いたい",
};

/** ギガ数帯ごとの代表的な候補プラン。楽天モバイルとLINEMOのみ検証済み */
const TELECOM_TIER_PLANS: Record<DataUsageTier, { carrier: string; fee: number; note: string }[]> = {
  light: [
    { carrier: "LINEMO（ベストプラン3GB）", fee: 990, note: "" },
    { carrier: "楽天モバイル（3GB以下）", fee: 1078, note: "" },
  ],
  medium: [
    { carrier: "LINEMO（ベストプラン10GB）", fee: 2090, note: "10GBまで。20GB近く使うなら超過に注意" },
    { carrier: "楽天モバイル（3〜20GB）", fee: 2178, note: "" },
  ],
  heavy: [
    { carrier: "楽天モバイル（20GB超）", fee: 3278, note: "完全無制限" },
    { carrier: "LINEMO（ベストプランV 30GB）", fee: 2970, note: "30GB超は速度制限、5分通話無料つき" },
  ],
};

function diagnoseCard(input: EconomicZoneInput): DiagnosisResult {
  const current = CARD_RATE[input.currentCard];
  const rakuten = CARD_RATE.rakuten;
  const annualSpend = input.monthlyCardSpend * 12;

  // ①現状評価: よく使う決済/経済圏に対して、今のカードがベストフィットか
  let fitNote: string | null = null;
  if (input.shoppingPriority !== "none") {
    const bestFit = CARD_BEST_FIT[input.shoppingPriority];
    fitNote =
      input.currentCard === bestFit.cardOption
        ? "現状のカードは、よく使う決済/経済圏に合っています"
        : `よく使う決済/経済圏を踏まえると、${CARD_RATE[bestFit.cardOption].label}の方が有利な可能性があります（${bestFit.note}）`;
  }

  if (current.rate === null) {
    return {
      category: "card",
      label: "クレジットカード",
      currentLabel: current.label,
      compareLabel: rakuten.label,
      annualDiff: null,
      note: `${current.label}の還元率は未確認のため、比較データなし`,
      sourceNote: "調べて裏取りできた組み合わせのみ試算しています",
      fitNote,
    };
  }

  const diff = annualSpend * (rakuten.rate! - current.rate);

  return {
    category: "card",
    label: "クレジットカード",
    currentLabel: current.label,
    compareLabel: rakuten.label,
    annualDiff: input.currentCard === "rakuten" ? null : diff,
    note:
      input.currentCard === "rakuten"
        ? "すでに楽天カードを利用中です（基本還元率での比較）"
        : diff > 0
          ? `月${input.monthlyCardSpend.toLocaleString()}円のカード利用で試算（基本還元率どうしの比較）`
          : `${current.label}はすでに楽天カードと同水準の基本還元率です`,
    sourceNote: `${current.label}基本還元率${(current.rate * 100).toFixed(1)}% vs 楽天カード基本還元率1.0%`,
    fitNote,
  };
}

function diagnoseNisa(input: EconomicZoneInput): DiagnosisResult {
  const current = NISA_FEE[input.currentNisaBroker];
  const rakuten = NISA_FEE.rakuten;

  if (input.currentNisaBroker === "rakuten") {
    return {
      category: "nisa",
      label: "NISA運用先",
      currentLabel: current.label,
      compareLabel: rakuten.label,
      annualDiff: null,
      note: "すでに楽天証券で運用中です",
      sourceNote: "楽天証券 全世界株式インデックスの信託報酬0.081%",
      fitNote: null,
    };
  }

  if (current.rate === null) {
    return {
      category: "nisa",
      label: "NISA運用先",
      currentLabel: current.label,
      compareLabel: rakuten.label,
      annualDiff: null,
      note: `${current.label}の信託報酬は未確認のため、比較データなし`,
      sourceNote: "調べて裏取りできた組み合わせのみ試算しています",
      fitNote: null,
    };
  }

  const diff = input.nisaBalance * (current.rate - rakuten.rate!);
  const isRealCase = input.currentNisaBroker === "yucho";

  return {
    category: "nisa",
    label: "NISA運用先",
    currentLabel: current.label,
    compareLabel: rakuten.label,
    annualDiff: diff,
    note:
      diff > 0
        ? `運用残高${input.nisaBalance.toLocaleString()}円で試算${isRealCase ? "（開発者が実際にゆうちょ→楽天証券へ乗り換えた効果との比較。信託報酬の差は毎年かかり続ける）" : "（信託報酬の差は毎年かかり続ける）"}`
        : `${current.label}はすでに楽天証券と同水準以下の信託報酬です`,
    sourceNote:
      input.currentNisaBroker === "yucho"
        ? "ゆうちょ銀行経由の投信信託報酬は概算0.3%(0.198〜0.450%のレンジの中間目安) vs 楽天証券0.081%"
        : `${current.label}の信託報酬${(current.rate * 100).toFixed(3)}% vs 楽天証券0.081%。信託報酬はファンド側の設定でありSBI/楽天どちらも低コスト投信を購入できるため、差が出るのは主にゆうちょとの比較`,
    fitNote: null,
  };
}

function diagnoseTelecom(input: EconomicZoneInput): DiagnosisResult {
  const currentLabel = TELECOM_LABEL[input.currentTelecom];
  const candidates = TELECOM_TIER_PLANS[input.dataUsageTier];
  const cheapest = candidates.reduce((a, b) => (b.fee < a.fee ? b : a));
  const compareLabel = `${cheapest.carrier}（${DATA_TIER_LABEL[input.dataUsageTier]}向け）`;

  const isCandidateCarrier =
    (input.currentTelecom === "rakuten_mobile" && cheapest.carrier.includes("楽天")) ||
    (input.currentTelecom === "other" && cheapest.carrier.includes("LINEMO"));

  const fitNote = `使いたいギガ数（${DATA_TIER_LABEL[input.dataUsageTier]}）に対しては、${candidates
    .map((c) => `${c.carrier}: 月${c.fee.toLocaleString()}円`)
    .join(" / ")}が候補です`;

  if (input.currentTelecomMonthlyFee === null) {
    return {
      category: "telecom",
      label: "通信キャリア",
      currentLabel,
      compareLabel,
      annualDiff: null,
      note: "現在の月額料金を入力すると差額を試算できます",
      sourceNote: "楽天モバイル・LINEMOの2社のみ料金を検証済み（docomo/au/softbankの現行プランは未検証）",
      fitNote,
    };
  }

  if (isCandidateCarrier) {
    return {
      category: "telecom",
      label: "通信キャリア",
      currentLabel: `${currentLabel}（月${input.currentTelecomMonthlyFee.toLocaleString()}円）`,
      compareLabel,
      annualDiff: null,
      note: "現在のギガ数帯に対して、比較的有利なキャリアをすでに利用しています",
      sourceNote: "楽天モバイル・LINEMOの2社のみ料金を検証済み",
      fitNote,
    };
  }

  const annualDiff = (input.currentTelecomMonthlyFee - cheapest.fee) * 12;
  return {
    category: "telecom",
    label: "通信キャリア",
    currentLabel: `${currentLabel}（月${input.currentTelecomMonthlyFee.toLocaleString()}円）`,
    compareLabel,
    annualDiff,
    note: cheapest.note || "ギガ数の使い方が変われば有利なキャリアも変わります",
    sourceNote: "楽天モバイル・LINEMOの2社のみ料金を検証済み（docomo/au/softbankの現行プランは未検証）",
    fitNote,
  };
}

function diagnoseBank(input: EconomicZoneInput): DiagnosisResult {
  const currentLabel = BANK_LABEL[input.currentBank];

  return {
    category: "bank",
    label: "銀行",
    currentLabel,
    compareLabel: "楽天銀行（ハッピープログラム）",
    annualDiff: null,
    note:
      input.currentBank === "rakuten"
        ? "すでに楽天銀行を利用中です"
        : "ATM・振込手数料の無料回数は残高や給与受取設定などの条件で変わるため、具体的な金額の試算はしていません（参考: VIPランクで月5回のATM無料+振込3回無料など）",
    sourceNote: "楽天銀行ハッピープログラムの会員ステージ制度に基づく一般的な優遇内容",
    fitNote: null,
  };
}

export function diagnoseEconomicZone(input: EconomicZoneInput): DiagnosisResult[] {
  return [diagnoseCard(input), diagnoseNisa(input), diagnoseTelecom(input), diagnoseBank(input)];
}

export function totalAnnualSavingPotential(results: DiagnosisResult[]): number {
  return results.reduce((sum, r) => sum + Math.max(0, r.annualDiff ?? 0), 0);
}

export function totalMonthlyFixedCost(fixedCosts: FixedCost[]): number {
  return fixedCosts.reduce((sum, c) => sum + c.monthlyAmount, 0);
}

const FREQUENCY_TIP: Record<UsageFrequency, string | null> = {
  daily: null, // よく使っているので特にコメントなし
  weekly: null,
  monthly: "使用頻度が低めです。下位プランや都度課金に切り替えられないか確認してみましょう",
  rarely: "ほとんど使っていないようです。解約を検討してもいいかもしれません",
};

/** 利用頻度に基づく一般的な見直し提案 + Prime Studentのような具体的な切り替え提案 */
export function suggestSubscriptionTips(fixedCosts: FixedCost[]): SubscriptionTip[] {
  const tips: SubscriptionTip[] = [];
  for (const cost of fixedCosts) {
    const frequencyMessage = FREQUENCY_TIP[cost.frequency];
    if (frequencyMessage) {
      tips.push({
        costId: cost.id,
        costName: cost.name,
        message: frequencyMessage,
        annualSaving: cost.frequency === "rarely" ? cost.monthlyAmount * 12 : 0,
      });
    }
    if (/prime/i.test(cost.name) && cost.monthlyAmount > 300) {
      tips.push({
        costId: cost.id,
        costName: cost.name,
        message: "学生ならPrime Student（月300円）への切り替えで安くなる可能性があります",
        annualSaving: (cost.monthlyAmount - 300) * 12,
      });
    }
  }
  return tips;
}
