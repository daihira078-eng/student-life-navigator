import type { DiagnosisResult, EconomicZoneInput, FixedCost, SubscriptionTip } from "./types";

// 出典はREADME/docs/REQUIREMENTS.mdの参考資料を参照。数値は概算であることをnoteで明示する。
const RAKUTEN_CARD_RATE = 0.01; // 楽天カード 基本還元率1.0%
const BANK_CARD_RATE = 0.005; // JP BANKカード等、銀行系カードの一般的な基本還元率0.5%

const RAKUTEN_NISA_FEE_RATE = 0.00081; // 楽天証券 全世界株式インデックスの信託報酬 年0.081%
const YUCHO_NISA_FEE_RATE = 0.003; // ゆうちょ銀行経由の同種ファンドの信託報酬 概算年0.3%(0.198〜0.450%のレンジの中間目安)

const RAKUTEN_MOBILE_TYPICAL_FEE = 1078; // Rakuten最強プラン 3GB以下の月額目安
const RAKUTEN_MOBILE_YOUTH_DISCOUNT = 110; // 最強青春割 22歳以下、月額割引

function diagnoseCard(input: EconomicZoneInput): DiagnosisResult {
  const annualSpend = input.monthlyCardSpend * 12;
  const annualDiff = input.usesRakutenCard
    ? 0
    : annualSpend * (RAKUTEN_CARD_RATE - BANK_CARD_RATE);

  return {
    category: "card",
    label: "クレジットカード",
    currentLabel: input.usesRakutenCard ? "楽天カード" : "銀行系カード（還元率0.5%想定）",
    recommendedLabel: "楽天カード（還元率1.0%）",
    annualDiff: input.usesRakutenCard ? null : annualDiff,
    note: input.usesRakutenCard
      ? "すでに楽天カードを利用中です"
      : `月${input.monthlyCardSpend.toLocaleString()}円のカード利用で試算`,
    sourceNote: "楽天カード基本還元率1.0%、銀行系カードは一般的な0.5%を仮定した概算",
  };
}

function diagnoseNisa(input: EconomicZoneInput): DiagnosisResult {
  const annualDiff = input.usesRakutenNisa
    ? 0
    : input.nisaBalance * (YUCHO_NISA_FEE_RATE - RAKUTEN_NISA_FEE_RATE);

  return {
    category: "nisa",
    label: "NISA運用先",
    currentLabel: input.usesRakutenNisa ? "楽天証券" : "ゆうちょ銀行",
    recommendedLabel: "楽天証券（信託報酬0.081%）",
    annualDiff: input.usesRakutenNisa ? null : annualDiff,
    note: input.usesRakutenNisa
      ? "すでに楽天証券で運用中です"
      : `運用残高${input.nisaBalance.toLocaleString()}円で試算（信託報酬の差が毎年かかり続ける点に注意）`,
    sourceNote:
      "全世界株式インデックスの信託報酬を楽天証券0.081% vs ゆうちょ銀行0.198〜0.450%(中間0.3%で概算)として試算",
  };
}

function diagnoseTelecom(input: EconomicZoneInput): DiagnosisResult {
  if (input.currentTelecomMonthlyFee === null) {
    return {
      category: "telecom",
      label: "通信キャリア",
      currentLabel: "現在の料金が未入力",
      recommendedLabel: "楽天モバイル（22歳以下は最強青春割で月110円引き）",
      annualDiff: null,
      note: "現在の月額料金を入力すると差額を試算できます",
      sourceNote: "Rakuten最強プラン(3GB以下)月額1,078円 − 最強青春割110円で試算",
    };
  }

  const rakutenMonthlyFee = RAKUTEN_MOBILE_TYPICAL_FEE - RAKUTEN_MOBILE_YOUTH_DISCOUNT;
  const annualDiff = input.usesRakutenMobile
    ? 0
    : (input.currentTelecomMonthlyFee - rakutenMonthlyFee) * 12;

  return {
    category: "telecom",
    label: "通信キャリア",
    currentLabel: input.usesRakutenMobile
      ? "楽天モバイル"
      : `現在のキャリア（月${input.currentTelecomMonthlyFee.toLocaleString()}円）`,
    recommendedLabel: `楽天モバイル（最強青春割適用で月${rakutenMonthlyFee.toLocaleString()}円〜）`,
    annualDiff: input.usesRakutenMobile ? null : annualDiff,
    note: input.usesRakutenMobile
      ? "すでに楽天モバイルを利用中です"
      : "データ利用量が3GBを超える場合は差額が変わります",
    sourceNote: "Rakuten最強プラン(3GB以下)月額1,078円、22歳以下は最強青春割で月110円引き",
  };
}

function diagnoseBank(input: EconomicZoneInput): DiagnosisResult {
  return {
    category: "bank",
    label: "銀行",
    currentLabel: input.usesRakutenBank ? "楽天銀行" : "現在の銀行",
    recommendedLabel: "楽天銀行（ハッピープログラム）",
    annualDiff: null,
    note: input.usesRakutenBank
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
