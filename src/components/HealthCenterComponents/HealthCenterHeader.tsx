import { Icon } from "@iconify/react";
import { useState } from "react";
import AddHealthCenterModal from '../modals/AddHealthCenter'; // Adjust path if needed

export default function HealthCenterHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveHealthCenter = (data: any) => {
    // Here you would typically make an API call to save the data.
    console.log("Saving new health center:", data);
    setIsModalOpen(false); // Close the modal on save
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col gap-4">
          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Health Centers</h1>
            <p className="text-gray-500 mt-1">
              Manage the list of all available health centers.
            </p>
          </div>

          {/* Search + Add Button (stacked under title) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
            {/* Search Bar */}
            <div className="relative flex-grow md:w-64">
              <Icon
                icon="ic:round-search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E9AEA4]"
              />
            </div>

            {/* Add Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#E46B64] text-white rounded-md py-2 px-4 hover:bg-[#E9AEA4] transition"
            >
              <Icon icon="ic:round-add" className="h-5 w-5" />
              <span>Add Health Center</span>
            </button>
          </div>
        </div>
      </div>

      <AddHealthCenterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHealthCenter}
      />
    </>
  );
}
