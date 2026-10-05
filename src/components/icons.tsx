import type { ReactNode } from "react";

/**
 * アプリ内で使い回す小さいピクトグラム集。バイトの業種アイコン・通知ベル等。
 * ストロークベースの統一スタイル(strokeWidth 1.8, round cap)で揃えている。
 */
type IconProps = { className?: string };

function base(children: ReactNode, className?: string) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function CupIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M4 9h13a3 3 0 0 1 0 6h-1.5" />
      <path d="M4 9v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
      <path d="M8 4c-.6 1-.1 1.5-.6 2.5M12.5 4c-.6 1-.1 1.5-.6 2.5" />
    </>,
    className,
  );
}

export function BriefcaseIcon({ className }: IconProps) {
  return base(
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </>,
    className,
  );
}

export function BookIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </>,
    className,
  );
}

export function StoreIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M4 10v9h16v-9" />
      <path d="M3 5h18l1.5 5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0L3 5Z" />
      <path d="M9 19v-5h6v5" />
    </>,
    className,
  );
}

export function LaptopIcon({ className }: IconProps) {
  return base(
    <>
      <rect x="4" y="4" width="16" height="10" rx="1.5" />
      <path d="M2 18h20l-1.5-3h-17L2 18Z" />
    </>,
    className,
  );
}

export function BellIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M6 10a6 6 0 0 1 12 0c0 3.2 1 4.8 1.8 5.6a.8.8 0 0 1-.6 1.4H4.8a.8.8 0 0 1-.6-1.4C5 14.8 6 13.2 6 10Z" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </>,
    className,
  );
}

export function HomeIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h3.5v-5.5h3V20.5H17a1 1 0 0 0 1-1V10" />
    </>,
    className,
  );
}

export function GaugeIcon({ className }: IconProps) {
  return base(
    <>
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 15l3.5-4.2" />
      <path d="M12 15a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z" />
    </>,
    className,
  );
}

export function CalendarIcon({ className }: IconProps) {
  return base(
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4M16 3v4" />
    </>,
    className,
  );
}

export function SettingsIcon({ className }: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </>,
    className,
  );
}

export function InfoIcon({ className }: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </>,
    className,
  );
}

export const JOB_ICON_OPTIONS = [
  { key: "cup", label: "カフェ・飲食", Icon: CupIcon },
  { key: "briefcase", label: "オフィス・インターン", Icon: BriefcaseIcon },
  { key: "book", label: "塾・教育", Icon: BookIcon },
  { key: "store", label: "小売・販売", Icon: StoreIcon },
  { key: "laptop", label: "在宅・PC作業", Icon: LaptopIcon },
] as const;

export type JobIconKey = (typeof JOB_ICON_OPTIONS)[number]["key"];

const JOB_ICON_MAP: Record<string, typeof CupIcon> = Object.fromEntries(
  JOB_ICON_OPTIONS.map((o) => [o.key, o.Icon]),
);

export function getJobIcon(key: string | undefined): typeof CupIcon {
  return (key && JOB_ICON_MAP[key]) || BriefcaseIcon;
}
