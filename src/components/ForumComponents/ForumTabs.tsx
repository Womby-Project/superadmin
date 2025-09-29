
import React from "react";

interface ForumTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ForumTabs: React.FC<ForumTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = ["All Posts", "Reported Posts & Comments", "Approval Queue", "Archive"];

  return (
    <div className="bg-gray-100 rounded-md p-1 flex">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors ${
            activeTab === tab
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default ForumTabs;

