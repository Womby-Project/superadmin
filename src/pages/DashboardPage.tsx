import SidebarComponents from "../components/SidebarComponents";
import { Icon } from "@iconify/react";
import Header from "../components/HeaderComponent";

export default function MainDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <SidebarComponents />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
      
          <Header />

        {/* Dashboard Content */}
        <main className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Verified OBGYN */}
            <div className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-semibold text-sm">
                  Verifies OBGYNs
                </h3>
                <div className="bg-[#F2ECFE] border border-[#E5E7EB] p-2 rounded-md">
                  <Icon
                    icon="fa7-solid:user-doctor"
                    style={{ color: "#7C3AED", fontSize: 30 }}
                  />
                </div>
              </div>
              <p className="text-gray-800 text-xl font-bold">12</p>
            </div>

            {/* Pending OBGYNs */}
            <div className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-semibold text-sm">
                  Pending OBGYNs
                </h3>
                <div className="bg-[#E7F8FB] border border-[#E5E7EB] p-2 rounded-md">
                  <Icon
                    icon="mdi:approval"
                    style={{ color: "#06B6D4", fontSize: 30 }}
                  />
                </div>
              </div>
              <p className="text-gray-800 text-xl font-bold">0</p>
            </div>

            {/* Pending Post Approvals */}
            <div className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-semibold text-sm">
                  Pending Posts Approval 
                </h3>
                <div className="bg-[#FEE2E2] border border-[#E5E7EB] p-2 rounded-md">
                  <Icon
                    icon="mingcute:list-search-fill"
                    style={{ color: "#DC2626", fontSize: 30 }}
                  />
                </div>
              </div>
              <p className="text-gray-800 text-xl font-bold">0</p>
            </div>

            {/* Pending Forum Post Reports */}
            <div className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-semibold text-sm">
                  Pending Forum Post Reports
                </h3>
                <div className="bg-[#FEE2E2]  border border-[#E5E7EB] p-2 rounded-md">
                  <Icon
                    icon="iconamoon:flag-fill"
                    style={{ color: "#DC2626", fontSize: 30 }}
                  />
                </div>
              </div>
              <p className="text-gray-800 text-xl font-bold">0</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
