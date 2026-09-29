"use client";

import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function NotificationToggle() {
  const [enabled, setEnabled] = useLocalStorageState<boolean>("simulator:notificationsEnabled", false);

  async function handleToggle() {
    if (enabled) {
      setEnabled(false);
      return;
    }
    if (typeof Notification === "undefined") {
      window.alert("お使いのブラウザは通知に対応していません");
      return;
    }
    if (Notification.permission === "denied") {
      window.alert("通知がブロックされています。ブラウザの設定から許可を変更してください。");
      return;
    }
    const permission =
      Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission !== "granted") return;
    setEnabled(true);
  }

  return (
    <button type="button" onClick={handleToggle} className="text-xs text-muted hover:text-series-1">
      {enabled ? "通知オン" : "通知を受け取る"}
    </button>
  );
}
