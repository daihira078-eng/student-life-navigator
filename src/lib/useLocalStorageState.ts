"use client";

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function emitChange(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: Listener) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => {
    listeners.get(key)?.delete(listener);
  };
}

function getServerSnapshot() {
  return null;
}

/**
 * localStorageに永続化するuseState相当のフック。useSyncExternalStoreを使うことで、
 * エフェクト内でのsetState呼び出し(cascading renderの原因)を避けつつSSRとの
 * ハイドレーション不一致も起きないようにしている。
 */
export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const raw = useSyncExternalStore(
    (listener) => subscribe(key, listener),
    getSnapshot,
    getServerSnapshot,
  );

  const value: T = raw !== null ? (JSON.parse(raw) as T) : defaultValue;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      try {
        const stored = window.localStorage.getItem(key);
        const prevValue: T = stored !== null ? (JSON.parse(stored) as T) : defaultValue;
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(prevValue) : next;
        window.localStorage.setItem(key, JSON.stringify(resolved));
        emitChange(key);
      } catch {
        // storage無効/容量超過等は無視(致命的ではない)
      }
    },
    [key, defaultValue],
  );

  return [value, setValue] as const;
}
