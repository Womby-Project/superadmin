import React, { useCallback } from "react";

export type TabKey = "All Posts" | "Reported Posts & Comments" | "Approval Queue" | "Archive";

interface ForumTabsProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  counts?: {
    all?: number;
    reported?: number;
    approval?: number;
    archive?: number;
  };
  disabled?: boolean;
}

const ForumTabs: React.FC<ForumTabsProps> = ({ activeTab, setActiveTab, counts, disabled = false }) => {
  const tabs: Array<{ key: TabKey; label: string; count?: number }> = [
    { key: "All Posts", label: "All Posts", count: counts?.all },
    { key: "Reported Posts & Comments", label: "Reported Posts & Comments", count: counts?.reported },
    { key: "Approval Queue", label: "Approval Queue", count: counts?.approval },
    { key: "Archive", label: "Archive", count: counts?.archive },
  ];

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const idx = tabs.findIndex(t => t.key === activeTab);
      if (idx === -1) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = tabs[(idx + 1) % tabs.length].key;
        setActiveTab(next);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = tabs[(idx - 1 + tabs.length) % tabs.length].key;
        setActiveTab(prev);
      }
    },
    [activeTab, setActiveTab, tabs, disabled]
  );

  return (
    <div
      className="bg-gray-100 rounded-md p-1 flex"
      role="tablist"
      aria-label="Forum sections"
      onKeyDown={onKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.key}`}
            disabled={disabled}
            onClick={() => !disabled && setActiveTab(tab.key)}
            className={`flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-md transition-colors outline-none
              ${isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-800"}
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? "bg-gray-100 text-gray-800" : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ForumTabs;
