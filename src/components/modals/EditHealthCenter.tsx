import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

// This interface defines the structure for the health center data
export interface HealthCenter {
    name: string;
    address: string;
    operatingHours: {
        weekdays: string;
        weekends: string;
    };
    contactInfo: {
        mobile: string;
        telephone: string;
    };
}

// Reusable component for form inputs with labels
const FormField = ({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
        />
    </div>
);

interface EditHealthCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HealthCenter) => void;
  healthCenter: HealthCenter | null;
}

export default function EditHealthCenterModal({ isOpen, onClose, onSave, healthCenter }: EditHealthCenterModalProps) {
  const [formData, setFormData] = useState<HealthCenter | null>(healthCenter);

  useEffect(() => {
    setFormData(healthCenter);
  }, [healthCenter]);

  if (!isOpen || !formData) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested state updates
    if (name === 'weekdays' || name === 'weekends') {
        setFormData(prev => prev ? { ...prev, operatingHours: { ...prev.operatingHours, [name]: value } } : null);
    } else if (name === 'mobile' || name === 'telephone') {
        setFormData(prev => prev ? { ...prev, contactInfo: { ...prev.contactInfo, [name]: value } } : null);
    } else {
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSaveChanges = () => {
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-lg bg-white rounded-xl shadow-lg p-8 border-none space-y-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800">{healthCenter?.name}</h2>
        </div>

        <div className="space-y-4">
            <FormField label="Address" name="address" value={formData.address} onChange={handleChange} />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="weekdays" value={formData.operatingHours.weekdays} onChange={handleChange} placeholder="Weekdays" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"/>
                    <input type="text" name="weekends" value={formData.operatingHours.weekends} onChange={handleChange} placeholder="Weekends" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"/>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="mobile" value={formData.contactInfo.mobile} onChange={handleChange} placeholder="Mobile Number" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"/>
                    <input type="text" name="telephone" value={formData.contactInfo.telephone} onChange={handleChange} placeholder="Telephone Number" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"/>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end gap-4 border-gray-200">
            <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSaveChanges}
                className="px-6 py-2 rounded-lg text-white font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors"
            >
                Save Changes
            </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
