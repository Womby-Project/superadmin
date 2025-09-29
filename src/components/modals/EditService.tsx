import { Dialog, DialogContent } from "@/components/ui/dialog";
import { type Service } from "../ServiceFeeComponents/ServiceCard";
import { useState, useEffect } from "react";

// Reusable component for form inputs
const FormField: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedService: Service) => void;
  service: Service | null;
}

export default function EditServiceModal({ isOpen, onClose, onSave, service }: EditServiceModalProps) {
  // formData will hold price and duration
  const [formData, setFormData] = useState<{ price: string; duration: string } | null>(null);
  // featuresText will hold the bullet points as a single string
  const [featuresText, setFeaturesText] = useState('');

  // When the service prop changes, update the local state
  useEffect(() => {
    if (service) {
      setFormData({ price: service.price, duration: service.duration });
      // Convert the features array into a newline-separated string for the textarea
      setFeaturesText(service.features.join('\n'));
    }
  }, [service]);

  if (!isOpen || !formData || !service) {
    return null;
  }

  // Handles changes for price and duration inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveChanges = () => {
    // Create the final service object to save
    const finalData: Service = {
      ...service,
      price: `₱${formData.price.replace('₱','')}`,
      duration: formData.duration,
      // Convert the textarea string back into an array of features
      features: featuresText.split('\n').filter(feature => feature.trim() !== ''),
    };
    onSave(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-lg bg-white rounded-xl shadow-lg p-8 border-none space-y-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Edit {service?.title}</h2>
            <p className="text-sm text-gray-600 mt-1">Update the pricing and details for this service.</p>
        </div>

        <div className="space-y-4">
            <FormField label="Price (₱)">
                <input
                    type="text"
                    name="price"
                    value={formData.price.replace('₱','')}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
                />
            </FormField>
            <FormField label="Duration">
                <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
                />
            </FormField>
            <FormField label="Features (one per line)">
                <textarea
                    name="features"
                    value={featuresText}
                    // Update the featuresText state directly
                    onChange={(e) => setFeaturesText(e.target.value)}
                    rows={5}
                    placeholder="Enter each feature on a new line..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
                />
            </FormField>
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

