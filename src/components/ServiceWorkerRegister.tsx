"use client";

import { useEffect } from "react";

/**
 * 開発中は無効化する。next devのホットリロードとservice workerのキャッシュが
 * 競合すると「コードを直したのに古い画面のまま」という混乱を招くため。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
