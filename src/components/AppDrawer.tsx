"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/simulator", label: "扶養最適化シミュレーター" },
];

export function AppDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-(--border-hairline) bg-surface/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="メニューを開く"
          className="flex h-8 w-8 flex-col items-center justify-center gap-1 rounded hover:bg-(--brand-soft)"
        >
          <span className="h-0.5 w-4 rounded bg-primary" />
          <span className="h-0.5 w-4 rounded bg-primary" />
          <span className="h-0.5 w-4 rounded bg-primary" />
        </button>
        <span className="text-sm font-semibold text-brand">一人暮らし新生活 総合最適化ナビ</span>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <nav
          className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-(--border-hairline) bg-surface shadow-xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="サイトナビゲーション"
        >
          <div className="flex items-center justify-between border-b border-(--border-hairline) p-4">
            <span className="text-sm font-semibold text-brand">メニュー</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="メニューを閉じる"
              className="rounded px-2 py-1 text-lg leading-none text-muted hover:text-primary"
            >
              ×
            </button>
          </div>
          <ul className="flex flex-col gap-1 p-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm text-primary hover:bg-(--brand-soft)"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-(--border-hairline) p-4">
            <a
              href="https://github.com/daihira078-eng/student-life-navigator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-series-1"
            >
              GitHubでソースを見る ↗
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
