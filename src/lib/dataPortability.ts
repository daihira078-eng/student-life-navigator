import type { DependencyProfile, Job, Scenario } from "./types";
import type { ActualIncomeRecord } from "./actualIncomeData";

export interface ExportedData {
  version: 1;
  exportedAt: string;
  jobs: Job[];
  profile: DependencyProfile;
  extraScenarios: Scenario[];
  actualIncome: ActualIncomeRecord[];
}

export function buildExportPayload(data: {
  jobs: Job[];
  profile: DependencyProfile;
  extraScenarios: Scenario[];
  actualIncome: ActualIncomeRecord[];
}): ExportedData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  id?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
}

interface FileSystemWritableStreamLike {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandleLike {
  createWritable(): Promise<FileSystemWritableStreamLike>;
}

type ShowSaveFilePicker = (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandleLike>;

export type ExportResult = "saved" | "cancelled" | "fallback";

/**
 * File System Access API(showSaveFilePicker)経由で保存する。対応ブラウザでは
 * 「名前を付けて保存」ダイアログが出て、好きなフォルダを選べる。同じidを指定すると
 * ブラウザが前回選んだフォルダを次回の初期位置として覚えてくれる(ブラウザ標準の挙動)。
 * 非対応ブラウザ、または想定外のエラー時は呼び出し側でdownloadJsonにフォールバックする。
 */
export async function exportWithPicker(data: unknown, filename: string): Promise<ExportResult> {
  const showSaveFilePicker = (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker })
    .showSaveFilePicker;
  if (!showSaveFilePicker) return "fallback";

  try {
    const handle = await showSaveFilePicker({
      id: "student-life-navigator-export",
      suggestedName: filename,
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return "saved";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    return "fallback";
  }
}

/**
 * サーバーを持たない設計上、このアプリのデータはブラウザのlocalStorageにしか存在しない。
 * 書き出したJSONの形が壊れていた場合に状態を巻き込まないよう、最低限の形チェックだけ行う。
 */
export function parseImportedData(text: string): ExportedData {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("JSONの形式が正しくありません");
  }
  const data = parsed as Partial<ExportedData>;
  if (!Array.isArray(data.jobs) || typeof data.profile !== "object" || data.profile === null) {
    throw new Error("このアプリで書き出したファイルではないようです");
  }
  return {
    version: 1,
    exportedAt: data.exportedAt ?? new Date().toISOString(),
    jobs: data.jobs,
    profile: data.profile as DependencyProfile,
    extraScenarios: Array.isArray(data.extraScenarios) ? data.extraScenarios : [],
    actualIncome: Array.isArray(data.actualIncome) ? data.actualIncome : [],
  };
}
