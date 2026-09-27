"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 数値がスライダー操作などで変わるたびに、指定時間かけて滑らかに前の値から
 * 新しい値へ補間する。setValueはrequestAnimationFrameの非同期コールバック内で
 * 呼ぶため、エフェクト内での同期的なsetState呼び出しにはならない。
 */
export function useAnimatedNumber(target: number, duration = 400): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const displayedRef = useRef(target);

  useEffect(() => {
    fromRef.current = displayedRef.current;
    let start: number | null = null;
    let rafId: number;

    function tick(now: number) {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (target - fromRef.current) * eased;
      displayedRef.current = next;
      setValue(next);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}
