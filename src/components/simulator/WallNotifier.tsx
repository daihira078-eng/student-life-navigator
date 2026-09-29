"use client";

import { useEffect } from "react";
import type { WallStatus } from "@/lib/types";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { buildWallNotification, shouldSkipToday } from "@/lib/wallNotification";

/**
 * UIを持たない常駐コンポーネント。通知が有効なら、サイトを開いたときに壁の状況を
 * チェックしてブラウザ通知を出す。1日1回までに絞るのは、開くたびに通知されると
 * うるさくなるため。
 */
export function WallNotifier({ walls, enabled }: { walls: WallStatus[]; enabled: boolean }) {
  const [lastNotifiedDate, setLastNotifiedDate] = useLocalStorageState<string | null>(
    "simulator:lastNotifiedDate",
    null,
  );

  useEffect(() => {
    if (!enabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    const today = new Date().toISOString().slice(0, 10);
    if (shouldSkipToday(lastNotifiedDate, today)) return;

    const content = buildWallNotification(walls);
    if (!content) return;

    new Notification(content.title, { body: content.body });
    setLastNotifiedDate(today);
  }, [walls, enabled, lastNotifiedDate, setLastNotifiedDate]);

  return null;
}
