import type { Doctor } from '../modals/ObgynDetails';
import { Icon } from "@iconify/react";
import defaultAvatar from "@/assets/doctor.png"; // 👈 replace with your actual asset path

interface DoctorCardProps {
  doctor: Doctor;
  onViewDetails: () => void;
}

const DayTag = ({ day }: { day: string }) => (
  <div className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md">
    {day}
  </div>
);

export default function DoctorCard({ doctor, onViewDetails }: DoctorCardProps) {
  const { name, status, affiliatedHospitals, availableDays } = doctor;

  const MAX_AFFILIATIONS_VISIBLE = 2;
  const visibleAffiliations = affiliatedHospitals.slice(0, MAX_AFFILIATIONS_VISIBLE);
  const remainingAffiliationsCount = affiliatedHospitals.length - MAX_AFFILIATIONS_VISIBLE;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
      {/* Card Header */}
      <div className="flex items-center gap-4">
        <img 
          src={defaultAvatar} 
          alt={name} 
          className="w-16 h-16 rounded-full object-cover" 
        />
        <div>
          <h3 className="font-bold text-lg text-gray-800">{name}</h3>
          <div className="flex items-center mt-1">
            <span className="bg-[#E6FCDC] border-[#BCFFAC] text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="h-2 w-2 bg-[#166534] rounded-full"></span>
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-grow pt-4">
        {/* Affiliated Hospitals */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
            Affiliated Hospitals
          </h4>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
            {visibleAffiliations.map((hospital, index) => (
              <li key={index} className="flex items-start gap-2">
                <Icon icon="ic:outline-place" className="h-4 w-4 text-[#E46B64] mt-0.5 flex-shrink-0" />
                <span>{hospital}</span>
              </li>
            ))}
            {remainingAffiliationsCount > 0 && (
              <li className="pl-6 text-red-500 text-xs">
                +{remainingAffiliationsCount} More
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Available Days */}
      <div>
        <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
          Available Days
        </h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {availableDays.map((day) => (
            <DayTag key={day} day={day} />
          ))}
        </div>
      </div>

      {/* View Details Link */}
      <div className="mt-auto border-gray-200 pt-4">
        <button 
          onClick={onViewDetails} 
          className="text-sm font-semibold text-[#E46B64] hover:underline flex items-center gap-1"
        >
          View Details
          <Icon icon="lsicon:open-new-filled" className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
