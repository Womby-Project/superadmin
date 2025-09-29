import { Icon } from '@iconify/react';
import { useState } from 'react';
import EditHealthCenterModal, { type HealthCenter } from '../modals/EditHealthCenter'; 

interface HealthCenterCardProps {
  center: HealthCenter;
}

export default function HealthCenterCard({ center: initialCenter }: HealthCenterCardProps) {
  const [center, setCenter] = useState(initialCenter);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (updatedCenter: HealthCenter) => {
    // In a real application, you would make an API call here to persist the changes.
    console.log("Saving changes for:", updatedCenter);
    setCenter(updatedCenter);
    setIsModalOpen(false); // Close the modal after saving
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-gray-400 hover:text-[#E9AEA4] transition"
          >
              <Icon icon="lucide:edit" className="h-5 w-5 text-[#E46B64]" />
          </button>
        </div>
        
        <div className="flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{center.name}</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-800 uppercase mb-1">Address</p>
              <div className="flex items-center gap-2">
              <Icon icon="tdesign:location" className="h-4 w-4 text-[#E46B64]" />
              <span className="text-gray-600">{center.address}</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-gray-800 uppercase mb-1">Operating Hours</p>
              <div className="flex justify-between items-center text-gray-600">
                <span>Weekdays</span>
                <span>{center.operatingHours.weekdays}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Weekends</span>
                <span>{center.operatingHours.weekends}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-800 uppercase mb-1">Contact Information</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Icon icon="lineicons:phone" className="h-4 w-4 text-[#E46B64]" />
                <span>{center.contactInfo.mobile}</span>
              </div>
                <div className="flex items-center gap-2 text-gray-600">
                <Icon icon="solar:phone-outline" className="h-4 w-4 text-[#E46B64]" />
                <span>{center.contactInfo.telephone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditHealthCenterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        healthCenter={center}
      />
    </>
  );
}
