"use client";

import { useEffect } from "react";
import type { DependencyProfile } from "@/lib/types";
import { ProfileForm } from "./ProfileForm";

interface ProfileSettingsModalProps {
  open: boolean;
  profile: DependencyProfile;
  onChange: (profile: DependencyProfile) => void;
  onClose: () => void;
}

/**
 * ヘッダーの⚙から呼び出す扶養プロフィール設定。AppDrawer.tsxと同じ
 * オーバーレイ+Escape+背景クリックで閉じるパターンを踏襲している。
 */
export function ProfileSettingsModal({ open, profile, onChange, onClose }: ProfileSettingsModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-10">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-brand">プロフィール設定</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="設定を閉じる"
            className="rounded px-2 py-1 text-lg leading-none text-muted outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-brand"
          >
            ×
          </button>
        </div>
        <ProfileForm profile={profile} onChange={onChange} />
      </div>
    </div>
  );
}
