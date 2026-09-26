import type {
  BankOption,
  CardOption,
  DiagnosisResult,
  EconomicZoneInput,
  FixedCost,
  NisaBrokerOption,
  SubscriptionTip,
  TelecomOption,
} from "./types";

/**
 * ここにある数値は「調べて裏取りできたもの」だけ。調べていない組み合わせ(十六銀行デビット等)は
 * rate: null にして、DiagnosisResultでも annualDiff を出さず「比較データなし」と表示する。
 * 出典はdocs/REQUIREMENTS.mdの参考資料を参照。
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

const RAKUTEN_MOBILE_TYPICAL_FEE = 1078; // Rakuten最強プラン 3GB以下の月額目安
const RAKUTEN_MOBILE_YOUTH_DISCOUNT = 110; // 最強青春割 22歳以下、月額割引

function diagnoseCard(input: EconomicZoneInput): DiagnosisResult {
  const current = CARD_RATE[input.currentCard];
  const rakuten = CARD_RATE.rakuten;
  const annualSpend = input.monthlyCardSpend * 12;

  if (input.currentCard === "rakuten") {
    return {
      category: "card",
      label: "クレジットカード",
      currentLabel: current.label,
      compareLabel: rakuten.label,
      annualDiff: null,
      note: "すでに楽天カードを利用中です",
      sourceNote: "楽天カード基本還元率1.0%",
    };
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
    };
  }

  const diff = annualSpend * (rakuten.rate! - current.rate);
  const isRealCase = input.currentCard === "yucho"; // 開発者が実際に乗り換えた組み合わせ

  return {
    category: "card",
    label: "クレジットカード",
    currentLabel: current.label,
    compareLabel: rakuten.label,
    annualDiff: diff,
    note:
      diff > 0
        ? `月${input.monthlyCardSpend.toLocaleString()}円のカード利用で試算${isRealCase ? "（開発者が実際に楽天カードへ乗り換えた効果との比較）" : ""}`
        : `${current.label}はすでに楽天カードと同水準の還元率です`,
    sourceNote: `${current.label}還元率${(current.rate * 100).toFixed(1)}% vs 楽天カード還元率1.0%`,
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
    };
  }

  const diff = input.nisaBalance * (current.rate - rakuten.rate!);
  const isRealCase = input.currentNisaBroker === "yucho"; // 開発者が実際に乗り換えた組み合わせ

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
  };
}

function diagnoseTelecom(input: EconomicZoneInput): DiagnosisResult {
  const currentLabel = TELECOM_LABEL[input.currentTelecom];
  const compareLabel = "楽天モバイル（22歳以下は最強青春割で月110円引き）";

  if (input.currentTelecom === "rakuten_mobile") {
    return {
      category: "telecom",
      label: "通信キャリア",
      currentLabel,
      compareLabel,
      annualDiff: null,
      note: "すでに楽天モバイルを利用中です",
      sourceNote: "Rakuten最強プラン(3GB以下)月額1,078円",
    };
  }

  if (input.currentTelecomMonthlyFee === null) {
    return {
      category: "telecom",
      label: "通信キャリア",
      currentLabel,
      compareLabel,
      annualDiff: null,
      note: "現在の月額料金を入力すると差額を試算できます",
      sourceNote: "Rakuten最強プラン(3GB以下)月額1,078円 − 最強青春割110円で試算",
    };
  }

  const rakutenMonthlyFee = RAKUTEN_MOBILE_TYPICAL_FEE - RAKUTEN_MOBILE_YOUTH_DISCOUNT;
  return {
    category: "telecom",
    label: "通信キャリア",
    currentLabel: `${currentLabel}（月${input.currentTelecomMonthlyFee.toLocaleString()}円）`,
    compareLabel: `楽天モバイル（最強青春割適用で月${rakutenMonthlyFee.toLocaleString()}円〜）`,
    annualDiff: (input.currentTelecomMonthlyFee - rakutenMonthlyFee) * 12,
    note: "データ利用量が3GBを超える場合は差額が変わります",
    sourceNote: "Rakuten最強プラン(3GB以下)月額1,078円、22歳以下は最強青春割で月110円引き",
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

/** 「Prime」を含む固定費があれば、Prime Studentへの切り替え(500円→300円)を提案する */
export function suggestSubscriptionTips(fixedCosts: FixedCost[]): SubscriptionTip[] {
  const tips: SubscriptionTip[] = [];
  for (const cost of fixedCosts) {
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
