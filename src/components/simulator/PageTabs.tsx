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
  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const nextIndex =
      e.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    onChange(tabs[nextIndex].id);
    (document.getElementById(`tab-${tabs[nextIndex].id}`) as HTMLButtonElement | null)?.focus();
  }

  return (
    <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-(--gridline)">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`whitespace-nowrap border-b-2 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 ${
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
