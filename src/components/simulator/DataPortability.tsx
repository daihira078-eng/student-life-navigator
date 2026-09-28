"use client";

import { useRef } from "react";
import type { DependencyProfile, Job, Scenario } from "@/lib/types";
import type { ActualIncomeRecord } from "@/lib/actualIncomeData";
import { buildExportPayload, downloadJson, parseImportedData } from "@/lib/dataPortability";

interface DataPortabilityProps {
  jobs: Job[];
  profile: DependencyProfile;
  extraScenarios: Scenario[];
  actualIncome: ActualIncomeRecord[];
  onImport: (data: {
    jobs: Job[];
    profile: DependencyProfile;
    extraScenarios: Scenario[];
    actualIncome: ActualIncomeRecord[];
  }) => void;
}

/**
 * サーバーを持たずlocalStorageだけで完結する設計の裏返しとして、
 * 端末を変えたりブラウザのデータを消したりすると全て失われる。
 * その弱点を補うための書き出し/読み込み機能。
 */
export function DataPortability({ jobs, profile, extraScenarios, actualIncome, onImport }: DataPortabilityProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const payload = buildExportPayload({ jobs, profile, extraScenarios, actualIncome });
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadJson(payload, `simulator-data-${dateStr}.json`);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 同じファイルを連続で選んでもonChangeが発火するようにリセット
    if (!file) return;

    try {
      const text = await file.text();
      const data = parseImportedData(text);
      if (!window.confirm("今の入力内容を、読み込んだデータで上書きします。よろしいですか？")) return;
      onImport(data);
    } catch {
      window.alert("読み込みに失敗しました。このアプリで書き出したJSONファイルを選んでください。");
    }
  }

  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <button type="button" onClick={handleExport} className="hover:text-series-1">
        データを書き出す
      </button>
      <span aria-hidden>/</span>
      <button type="button" onClick={handleImportClick} className="hover:text-series-1">
        データを読み込む
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileSelected}
        className="hidden"
      />
    </div>
  );
}
