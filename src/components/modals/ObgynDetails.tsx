import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Doctor interface remains the same
export interface Doctor {
  name: string;
  gender: string;
  age: number;
  status: 'Active' | 'Inactive';
  avatarUrl: string;
  contact: {
    phone: string;
    email: string;
  };
  availability: {
    [key: string]: string[];
  };
  affiliatedHospitals: string[];
  availableDays: string[];
  organizations: string[];
  education: {
    degree: string;
    school: string;
    graduated: number;
  };
  prcId: {
    name: string;
    size: string;
  };
}

interface ObgynDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

// FIX: Further reduced vertical padding and margin for a tighter layout
const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-t border-gray-200 pt-2 mt-2 first-of-type:mt-3 first-of-type:border-t-0 first-of-type:pt-0">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{title}</h3>
    {children}
  </div>
);

const StatusBadge: React.FC<{ status: 'Active' | 'Inactive' }> = ({ status }) => (
  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit ${
    status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }`}>
    <span className={`h-2 w-2 rounded-full ${status === 'Active' ? 'bg-green-600' : 'bg-gray-500'}`}></span>
    {status}
  </span>
);


export default function ObgynDetails({ isOpen, onClose, doctor }: ObgynDetailsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!doctor) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-2xl h-[670px] bg-white border-none rounded-xl shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between -mt-1">
            <div className="flex items-center gap-4">
                <img src={doctor.avatarUrl} alt={doctor.name} className="w-20 h-20 rounded-full" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
                    <p className="text-sm text-gray-500">{doctor.gender} - {doctor.age} years old</p>
                    <div className="mt-2">
                        <StatusBadge status={doctor.status} />
                    </div>
                </div>
            </div>
            {/* Action Menu */}
            <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <Icon icon="mdi:dots-horizontal" className="w-6 h-6" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Disable Account
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div>
            {/* Contact Details */}
            <InfoSection title="Contact Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                    <Icon icon="ph:phone" className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-800">{doctor.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                    <Icon icon="ph:envelope" className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-800">{doctor.contact.email}</span>
                </div>
              </div>
            </InfoSection>

            {/* Availability */}
            <InfoSection title="Availability">
                {/* FIX: Reduced space between items to minimum */}
                <div className="space-y-1">
                    {Object.entries(doctor.availability).map(([time, days]) =>(
                        <div key={time} className="flex items-center gap-6">
                            <p className="text-sm font-medium text-gray-800 w-32">{time}</p>
                            <div className="flex flex-wrap gap-2">
                                {days.map(day => (
                                    <p key={day} className="text-sm text-gray-600">{day}</p>

                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </InfoSection>

            {/* Other Sections */}
            <InfoSection title="Affiliated Hospitals">
              <ul className="space-y-1 text-sm text-gray-700">{doctor.affiliatedHospitals.map(h => <li key={h}>{h}</li>)}</ul>
            </InfoSection>

            <InfoSection title="Organizations">
              <ul className="space-y-1 text-sm text-gray-700">{doctor.organizations.map(o => <li key={o}>{o}</li>)}</ul>
            </InfoSection>

            <InfoSection title="Education">
              {/* FIX: Reduced padding and internal margin */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                <p className="font-semibold text-gray-800">{doctor.education.degree}</p>
                <p className="text-sm text-gray-600">{doctor.education.school}</p>
                <p className="text-xs text-gray-400 mt-0.5">Graduated {doctor.education.graduated}</p>
              </div>
            </InfoSection>
            
            <InfoSection title="PRC ID">
                {/* FIX: Reduced padding */}
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2">
                    <Icon icon="ph:file-pdf-bold" className="w-8 h-8 text-red-500" />
                    <div>
                        <p className="text-sm font-medium text-gray-800">{doctor.prcId.name}</p>
                        <p className="text-xs text-gray-500">{doctor.prcId.size}</p>
                    </div>
                </div>
            </InfoSection>
        </div>
      </DialogContent>
    </Dialog>
  );
}