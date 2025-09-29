import React, { useState } from 'react';
import SidebarComponents from '../components/SidebarComponents';
import Header from '../components/HeaderComponent';
import SettingsHeader from '../components/SettingsComponents/SettingsHeader';
import SecurityTab from '../components/SettingsComponents/SecurityTab';
import ActivityTab from '../components/SettingsComponents/ActivityTab';
import ManagementTab from '../components/SettingsComponents/ManagementTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Security');

  const renderContent = () => {
    switch (activeTab) {
      case 'Security':
        return <SecurityTab />;
      case 'Activity':
        return <ActivityTab />;
      case 'Management':
        return <ManagementTab />;
      default:
        return <SecurityTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <SidebarComponents />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 space-y-6">
          <SettingsHeader activeTab={activeTab} setActiveTab={setActiveTab} />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}


