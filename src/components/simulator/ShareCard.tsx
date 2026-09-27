"use client";

import { useRef, useState } from "react";
import type { WallStatus } from "@/lib/types";
import { drawShareCard } from "@/lib/shareCard";

interface ShareCardProps {
  walls: WallStatus[];
  targetYear: number;
}

export function ShareCard({ walls, targetYear }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  function generate() {
    const canvas = canvasRef.current;
    if (!canvas || walls.length === 0) return;
    drawShareCard(canvas, walls, targetYear);
    setImageUrl(canvas.toDataURL("image/png"));
  }

  return (
    <div className="rounded-lg border border-(--border-hairline) bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">結果をシェア</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generate}
            className="rounded border border-series-1 px-3 py-1.5 text-sm font-medium text-series-1 hover:opacity-80"
          >
            画像を作る
          </button>
          {imageUrl && (
            <a
              href={imageUrl}
              download={`fuyou-simulation-${targetYear}.png`}
              className="rounded bg-series-1 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              保存する
            </a>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} width={1200} height={630} className="hidden" />

      {imageUrl ? (
        // next/imageはCanvasで生成したdata URIのような動的画像に対応していないため素のimgを使う
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="診断結果のシェア画像"
          className="w-full rounded-md border border-(--border-hairline)"
        />
      ) : (
        <p className="text-sm text-secondary">
          「画像を作る」を押すと、今の診断結果をカード画像にできます。SNSでシェアしたり保存しておけます。
        </p>
      )}
    </div>
  );
}
