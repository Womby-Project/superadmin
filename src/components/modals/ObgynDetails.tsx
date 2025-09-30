import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Doctor } from "@/hooks/useDoctor";

interface ObgynDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="border-t border-gray-200 pt-2 mt-2 first-of-type:mt-3 first-of-type:border-t-0 first-of-type:pt-0">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
      {title}
    </h3>
    {children}
  </div>
);

const StatusBadge: React.FC<{ verified: boolean }> = ({ verified }) => (
  <span
    className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit ${
      verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }`}
  >
    <span
      className={`h-2 w-2 rounded-full ${
        verified ? "bg-green-600" : "bg-gray-500"
      }`}
    ></span>
    {verified ? "Active" : "Inactive"}
  </span>
);

export default function ObgynDetails({
  isOpen,
  onClose,
  doctor,
}: ObgynDetailsProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isRevealed, setIsRevealed] = React.useState(false);

  // 🔒 Disable background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen || !doctor) return null;

  const safeContact = {
    phone: doctor.phoneNumber || "N/A",
    email: doctor.email || "N/A",
  };

  const safeHospitals = doctor.affiliatedHospitalsClinics || [];
  const safeEducation = doctor.education || "N/A";

  const age =
    doctor.birthDate && !isNaN(new Date(doctor.birthDate).getTime())
      ? new Date().getFullYear() - new Date(doctor.birthDate).getFullYear()
      : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ✅ Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ✅ Modal Content */}
      <div className="relative z-50 w-full max-w-2xl h-[670px] bg-white rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Close button (optional) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
        >
          <Icon icon="mdi:close" className="w-6 h-6 text-gray-500" />
        </button>

        {/* 🔒 Blur + Warning Overlay */}
        {!isRevealed && (
          <div className="absolute inset-0 bg-grey/10 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
            <Icon
              icon="mdi:shield-lock-outline"
              className="text-red-500 w-14 h-14 mb-4"
            />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Sensitive Information
            </h2>
            <p className="text-gray-600 text-sm max-w-sm mb-6">
              Doctor’s personal and professional information is confidential.
              Please proceed only if you have proper authorization.
            </p>
            <button
              onClick={() => setIsRevealed(true)}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-lg transition-colors"
            >
              See Doctor’s Information
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between -mt-1">
          <div className="flex items-center gap-4">
            <img
              src={doctor.profilePictureUrl || "/doctor.png"}
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {doctor.name}
              </h2>
              <p className="text-sm text-gray-500">
                {doctor.gender || "N/A"} - {age} years old
              </p>
              <div className="mt-2">
                <StatusBadge verified={doctor.isVerified} />
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
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

        {/* Main Body */}
        <div
          className={
            isRevealed ? "opacity-100" : "opacity-30 pointer-events-none"
          }
        >
          <InfoSection title="Contact Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                <Icon icon="ph:phone" className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-800">{safeContact.phone}</span>
              </div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                <Icon icon="ph:envelope" className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-800">{safeContact.email}</span>
              </div>
            </div>
          </InfoSection>

          <InfoSection title="Affiliated Hospitals">
            <ul className="space-y-1 text-sm text-gray-700">
              {safeHospitals.length > 0 ? (
                safeHospitals.map((h, i) => <li key={i}>{h}</li>)
              ) : (
                <li className="text-gray-400">No affiliated hospitals listed</li>
              )}
            </ul>
          </InfoSection>

          <InfoSection title="Education">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
              <p className="font-semibold text-gray-800">{safeEducation}</p>
            </div>
          </InfoSection>

          <InfoSection title="PRC ID">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2">
              <Icon icon="ph:file-pdf-bold" className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {doctor.prcLicenseNumber || "N/A"}
                </p>
              </div>
            </div>
          </InfoSection>
        </div>
      </div>
    </div>
  );
}
