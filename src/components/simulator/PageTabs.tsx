"use client";

interface PageTab {
  id: string;
  label: string;
}

interface PageTabsProps {
  tabs: PageTab[];
  active: string;
  onChange: (id: string) => void;
}

export function PageTabs({ tabs, active, onChange }: PageTabsProps) {
  return (
    <div className="flex gap-6 overflow-x-auto border-b border-(--gridline)">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`whitespace-nowrap border-b-2 py-3 text-sm ${
            active === tab.id
              ? "border-brand font-semibold text-brand"
              : "border-transparent text-muted hover:text-secondary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
