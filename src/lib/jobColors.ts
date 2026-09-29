import type { Job } from "./types";

/** バイトの登場順で固定するセグメント色。複数のUI(リング・ヒートマップ等)をまたいでも同じバイトは同じ色になる */
export const JOB_SEGMENT_COLORS = [
  "var(--series-2)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-3)",
  "var(--series-8)",
];

export function buildJobColorMapFromJobs(jobs: Job[]): Map<string, string> {
  const map = new Map<string, string>();
  jobs.forEach((job, i) => map.set(job.id, JOB_SEGMENT_COLORS[i % JOB_SEGMENT_COLORS.length]));
  return map;
}
