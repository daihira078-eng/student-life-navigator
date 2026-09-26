export function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

export function formatHours(value: number): string {
  return `${Math.round(value * 10) / 10}時間`;
}
