import type { WallStatus } from "./types";
import { formatHours } from "./format";

export interface Advice {
  status: WallStatus["status"];
  message: string;
}

const STATUS_PRIORITY: Record<WallStatus["status"], number> = { critical: 2, warning: 1, good: 0 };

/** 「123万円の壁（所得税・住民税）」のような注釈付きラベルから、話し言葉で使う短い名前だけを取り出す */
function shortWallName(label: string): string {
  return label.split("（")[0];
}

/**
 * 複数の壁のうち最も注意が必要なものを1つ選び、状況に応じた一言コメントを生成する。
 * ルールベース（API呼び出し不要）。バックエンドを持たない設計を崩さないための選択。
 */
export function generateAdvice(walls: WallStatus[]): Advice | null {
  if (walls.length === 0) return null;

  const target = walls.reduce((a, b) => (STATUS_PRIORITY[b.status] > STATUS_PRIORITY[a.status] ? b : a));
  const wallName = shortWallName(target.wall.label);

  if (target.status === "critical") {
    const timing = target.monthReached ? `${target.monthReached}月ごろ` : "近いうちに";
    if (target.shiftSuggestion) {
      return {
        status: "critical",
        message: `${timing}${wallName}を超える見込みです。${target.shiftSuggestion.jobName}の週の勤務時間を約${formatHours(
          target.shiftSuggestion.weeklyHourReduction,
        )}減らすと、年間見込みが壁以内に収まります。`,
      };
    }
    return {
      status: "critical",
      message: `${timing}${wallName}を超える見込みです。シフトを減らすなどの対策を検討しましょう。`,
    };
  }

  if (target.status === "warning") {
    return {
      status: "warning",
      message: `${wallName}に接近中です。今のペースなら年内は壁以内に収まりそうですが、あと${formatHours(
        target.remainingHours,
      )}ほどで到達する水準なので、シフトを増やす際は注意してください。`,
    };
  }

  return {
    status: "good",
    message: `${wallName}まで余裕があります（あと${formatHours(target.remainingHours)}ほど働けます）。`,
  };
}
