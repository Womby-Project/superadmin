import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { useState } from "react";

// This interface defines the structure for the health center data
export interface HealthCenterData {
  name: string;
  mobileNumbers: string[];
  telephoneNumbers: string[];
}

// Reusable component for the dynamic contact input fields
const ContactField = ({ value, onChange, onRemove }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemove: () => void }) => (
    <div className="flex items-center gap-2">
        <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
        />
        <button onClick={onRemove} className="p-2 text-gray-400 hover:text-red-500">
            <Icon icon="mdi:close" className="h-5 w-5" />
        </button>
    </div>
);


interface AddHealthCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HealthCenterData) => void;
}

export default function AddHealthCenterModal({ isOpen, onClose, onSave }: AddHealthCenterModalProps) {
  const [name, setName] = useState('');
  const [mobileNumbers, setMobileNumbers] = useState(['']); // Start with one empty field
  const [telephoneNumbers, setTelephoneNumbers] = useState(['']); // Start with one empty field

  // Handlers for mobile numbers
  const handleMobileChange = (index: number, value: string) => {
    const updatedNumbers = [...mobileNumbers];
    updatedNumbers[index] = value;
    setMobileNumbers(updatedNumbers);
  };
  const addMobileField = () => setMobileNumbers([...mobileNumbers, '']);
  const removeMobileField = (index: number) => {
    if (mobileNumbers.length > 1) {
      setMobileNumbers(mobileNumbers.filter((_, i) => i !== index));
    }
  };

  // Handlers for telephone numbers
  const handleTelephoneChange = (index: number, value: string) => {
    const updatedNumbers = [...telephoneNumbers];
    updatedNumbers[index] = value;
    setTelephoneNumbers(updatedNumbers);
  };
  const addTelephoneField = () => setTelephoneNumbers([...telephoneNumbers, '']);
  const removeTelephoneField = (index: number) => {
    if (telephoneNumbers.length > 1) {
      setTelephoneNumbers(telephoneNumbers.filter((_, i) => i !== index));
    }
  };

  const handleSaveChanges = () => {
    // Filter out empty strings before saving
    const data: HealthCenterData = {
      name,
      mobileNumbers: mobileNumbers.filter(n => n.trim() !== ''),
      telephoneNumbers: telephoneNumbers.filter(n => n.trim() !== '')
    };
    onSave(data);
    // Reset form for next time
    setName('');
    setMobileNumbers(['']);
    setTelephoneNumbers(['']);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-lg bg-white rounded-xl shadow-lg p-8 border-none space-y-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Add Health Center</h2>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Barangay Health Center</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                <div className="space-y-3">
                    {/* Mobile Numbers */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-500">Mobile Number</p>
                            <button onClick={addMobileField} className="flex items-center gap-1 text-xs text-[#E46B64] font-medium">
                                <Icon icon="ic:round-add" className="h-4 w-4" /> Add field
                            </button>
                        </div>
                        {mobileNumbers.map((number, index) => (
                            <ContactField key={index} value={number} onChange={(e) => handleMobileChange(index, e.target.value)} onRemove={() => removeMobileField(index)} />
                        ))}
                    </div>
                    {/* Telephone Numbers */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-500">Telephone Number</p>
                            <button onClick={addTelephoneField} className="flex items-center gap-1 text-xs text-[#E46B64] font-medium">
                                <Icon icon="ic:round-add" className="h-4 w-4" /> Add field
                            </button>
                        </div>
                         {telephoneNumbers.map((number, index) => (
                            <ContactField key={index} value={number} onChange={(e) => handleTelephoneChange(index, e.target.value)} onRemove={() => removeTelephoneField(index)} />
                        ))}
                    </div>
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

