import type { WallStatus } from "./types";
import { generateAdvice } from "./adviceGenerator";

export interface WallNotificationContent {
  title: string;
  body: string;
}

/** 壁が良好な状態なら通知しない。接近中/超過のときだけ通知内容を組み立てる */
export function buildWallNotification(walls: WallStatus[]): WallNotificationContent | null {
  const advice = generateAdvice(walls);
  if (!advice || advice.status === "good") return null;
  return {
    title: advice.status === "critical" ? "壁を超える見込みです" : "壁に接近中です",
    body: advice.message,
  };
}

/** 同じ日に何度も通知しないための判定。日付が変わったら再度通知できるようにする */
export function shouldSkipToday(lastNotifiedDate: string | null, todayDate: string): boolean {
  return lastNotifiedDate === todayDate;
}
