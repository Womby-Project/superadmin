
interface SettingsHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = ['Security', 'Activity', 'Management'];

export default function SettingsHeader({ activeTab, setActiveTab }: SettingsHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      <p className="text-gray-500 mt-1">Manage your account and application settings.</p>
      <div className="mt-6 border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-[#E46B64] text-[#E46B64]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
