"use client";

import { useState } from "react";
import type { DependencyProfile } from "@/lib/types";
import { WallIconMark } from "@/lib/pwaIcon";
import { ProfileForm } from "./ProfileForm";

interface ProfileOnboardingProps {
  initialProfile: DependencyProfile;
  onComplete: (profile: DependencyProfile) => void;
}

/**
 * 初回アクセス時だけ表示する、扶養プロフィールの確認画面。以後は「今の状況」タブには
 * 出さず、ヘッダーの⚙から呼び出すProfileSettingsModalに一本化する(普段触る頻度が
 * 低い設定を、毎回スクロールするバイト入力欄の上から追い出すのが狙い)。
 */
export function ProfileOnboarding({ initialProfile, onComplete }: ProfileOnboardingProps) {
  const [draft, setDraft] = useState<DependencyProfile>(initialProfile);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 py-6">
      <div className="flex flex-col gap-3">
        <div
          className="h-12 w-12 overflow-hidden rounded-xl"
          style={{ boxShadow: "0 1px 0 var(--border-hairline)" }}
        >
          <WallIconMark size={48} />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="h-px w-6 bg-brand" />
          <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">はじめに</p>
        </div>
        <h2 className="text-xl font-semibold text-primary">あなたについて教えてください</h2>
        <p className="text-sm text-secondary">
          壁の金額や注意表示の基準の計算に使います。あとからいつでもヘッダーの設定アイコンから変更できます。
        </p>
      </div>
      <ProfileForm profile={draft} onChange={setDraft} />
      <button
        type="button"
        onClick={() => onComplete(draft)}
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        はじめる →
      </button>
    </div>
  );
}
