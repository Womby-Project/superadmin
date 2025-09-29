

const tabs = ['All', 'Posted', 'Draft', 'Archived'];

interface ContentFilterProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  counts: { [key: string]: number };
}

export default function ContentFilter({ activeFilter, setActiveFilter, counts }: ContentFilterProps) {
  return (
    <div className="bg-white p-2 rounded-lg shadow-sm">
      <nav className="flex space-x-2" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`flex-1 whitespace-nowrap py-2 px-4 text-center font-medium text-sm rounded-md transition-colors
              ${
                activeFilter === tab
                  ? 'bg-[#FCEEED] text-red-400'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {tab} ({counts[tab] || 0})
          </button>
        ))}
      </nav>
    </div>
  );
}

