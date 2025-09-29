import { Icon } from "@iconify/react";
import React, { useState } from "react";
import SidebarComponents from '../components/SidebarComponents.tsx';
import Header from '../components/HeaderComponent.tsx';
import DirectoryHeader from '../components/DirectoryComponents/DirectoryHeader.tsx';
import DoctorCard from '../components/DirectoryComponents/DoctorCard.tsx';
import ObgynDetails, { type Doctor } from '../components/modals/ObgynDetails.tsx';

const doctors: Doctor[] = [
  {
    name: 'Dr. Samantha Cruz',
    gender: 'Female',
    age: 34,
    status: 'Active',
    avatarUrl: 'https://placehold.co/128x128/E9AEA4/4F4F4F?text=SC',
    contact: { phone: '917-123-4567', email: 'samantha.cruz@example.com' },
    availability: { '8:00 AM - 2:00 PM': ['Monday', 'Tuesday', 'Wednesday'], '10:00 AM - 4:00 PM': ['Thursday', 'Friday', 'Saturday'] },
    affiliatedHospitals: [
      'United Davao Specialists Hospital and Medical Center',
      'Broken shire Medical Center',
      'Davao Doctors Hospital'
    ],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    organizations: ['Philippine Obstetrical and Gynecological Society (POGS)'],
    education: { degree: 'Doctor of Medicine', school: 'Davao Medical School Foundation, Inc.', graduated: 2012 },
    prcId: { name: 'PRC-ID.png', size: '3.57MB' },
  },
  {
    name: 'Dr. Maria Santos',
    gender: 'Female',
    age: 42,
    status: 'Active',
    avatarUrl: 'https://placehold.co/128x128/E9AEA4/4F4F4F?text=MS',
    contact: { phone: '928-234-5678', email: 'maria.santos@example.com' },
    availability: { '10:00 AM - 1:00 PM': ['Monday', 'Wednesday'], '3:00 PM - 6:00 PM': ['Friday', 'Saturday'] },
    affiliatedHospitals: [
      'Davao Doctors Hospital',
      'San Pedro Hospital of Davao City'
    ],
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    organizations: ['Davao Medical Society'],
    education: { degree: 'Doctor of Medicine', school: 'Ateneo de Davao University', graduated: 2005 },
    prcId: { name: 'PRC-ID_Santos.png', size: '2.1MB' },
  },
  // ... add complete mock data for other doctors as needed
];

export default function DirectoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const handleViewDetails = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDoctor(null);
    };
  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans">
      <SidebarComponents />
      <div className="flex-1 flex flex-col ml-[260px] overflow-hidden">
        <Header />
        <main className="flex-1 p-5 overflow-y-auto">
          <DirectoryHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {doctors.map((doctor, index) => (
              <DoctorCard key={index} doctor={doctor} onViewDetails={() => handleViewDetails(doctor)} />
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 text-sm text-gray-600 gap-4">
                <div>
                  <p>Showing <span className="font-semibold">2</span> out of <span className="font-semibold">27</span> OB-GYNs</p>
                </div>  
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" aria-label="Previous Page">
                    <Icon icon="mdi:chevron-left" className="h-5 w-5" />
                  </button>
                  <button className="px-3.5 py-1.5 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">1</button>
                  <button className="px-3.5 py-1.5 rounded-md bg-[#E9AEA4] text-white">2</button>
                  <button className="px-3.5 py-1.5 rounded-md text-gray-600 hover:bg-gray-200">3</button>
                  <button className="p-2 rounded-md hover:bg-gray-100" aria-label="Next Page">
                    <Icon icon="mdi:chevron-right" className="h-5 w-5" />
                  </button>
                </div>
              </div>
        </main>
      </div>
      <ObgynDetails 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                doctor={selectedDoctor} 
            />
    </div>
  );
}

