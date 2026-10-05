"use client";

import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { BellIcon } from "@/components/icons";

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
    <button
      type="button"
      onClick={handleToggle}
      title={enabled ? "通知オン" : "通知を受け取る"}
      aria-label={enabled ? "通知オン" : "通知を受け取る"}
      className={`flex h-7 w-7 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        enabled ? "bg-(--brand-soft) text-brand" : "text-muted hover:text-series-1"
      }`}
    >
      <BellIcon className="h-4 w-4" />
    </button>
  );
}
