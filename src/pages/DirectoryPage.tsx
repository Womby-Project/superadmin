import { Icon } from "@iconify/react";
import React, { useState } from "react";
import SidebarComponents from "../components/SidebarComponents.tsx";
import Header from "../components/HeaderComponent.tsx";
import DirectoryHeader from "../components/DirectoryComponents/DirectoryHeader.tsx";
import DoctorCard from "../components/DirectoryComponents/DoctorCard.tsx";
import ObgynDetails from "../components/modals/ObgynDetails.tsx"; // ✅ keep component only
import { useDoctors, type Doctor } from "@/hooks/useDoctor.ts"; // ✅ import type from schema

export default function DirectoryPage() {
  const { doctors, loading } = useDoctors();
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

          {/* Loading/Error states */}
          {loading && <p className="text-center text-gray-500">Loading doctors...</p>}

          {/* Doctors Grid */}
          {!loading && doctors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              {doctors.map((doctor, index) => (
                <DoctorCard
                  key={index}
                  doctor={doctor}
                  onViewDetails={() => handleViewDetails(doctor)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && doctors.length === 0 && (
            <p className="text-center text-gray-500">No OB-GYNs found.</p>
          )}

          {/* Pagination Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 text-sm text-gray-600 gap-4">
            <div>
              <p>
                Showing <span className="font-semibold">{doctors.length}</span> out of{" "}
                <span className="font-semibold">{doctors.length}</span> OB-GYNs
              </p>
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

      {/* Doctor Details Modal */}
      <ObgynDetails
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        doctor={selectedDoctor}
      />
    </div>
  );
}
