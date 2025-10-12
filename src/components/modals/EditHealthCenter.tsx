import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

// Keep your original shape and extend with optional coords
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
  latitude?: number | null;
  longitude?: number | null;
}

// Reusable labeled input
const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string | number | undefined | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
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

export default function EditHealthCenterModal({
  isOpen,
  onClose,
  onSave,
  healthCenter,
}: EditHealthCenterModalProps) {
  const [formData, setFormData] = useState<HealthCenter | null>(healthCenter);

  useEffect(() => {
    setFormData(healthCenter);
  }, [healthCenter]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value,  } = e.target;

    // Numeric coercion for coords
    if (name === "latitude" || name === "longitude") {
      const numeric = value === "" ? null : Number(value);
      setFormData(prev =>
        prev
          ? {
              ...prev,
              [name]: Number.isFinite(numeric) ? (numeric as number) : null,
            }
          : null
      );
      return;
    }

    // Nested updates
    if (name === "weekdays" || name === "weekends") {
      setFormData(prev =>
        prev
          ? { ...prev, operatingHours: { ...prev.operatingHours, [name]: value } }
          : null
      );
    } else if (name === "mobile" || name === "telephone") {
      setFormData(prev =>
        prev
          ? { ...prev, contactInfo: { ...prev.contactInfo, [name]: value } }
          : null
      );
    } else {
      // name, address, etc.
      setFormData(prev => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleSaveChanges = () => {
    if (!formData) return;

    // Basic trim/cleanup (non-destructive)
    const cleaned: HealthCenter = {
      ...formData,
      name: formData.name.trim(),
      address: formData.address.trim(),
      operatingHours: {
        weekdays: formData.operatingHours.weekdays.trim(),
        weekends: formData.operatingHours.weekends.trim(),
      },
      contactInfo: {
        mobile: formData.contactInfo.mobile.trim(),
        telephone: formData.contactInfo.telephone.trim(),
      },
      latitude:
        formData.latitude === null || formData.latitude === undefined
          ? null
          : Number(formData.latitude),
      longitude:
        formData.longitude === null || formData.longitude === undefined
          ? null
          : Number(formData.longitude),
    };

    onSave(cleaned);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-2xl bg-white rounded-xl shadow-lg p-8 border-none space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Edit Health Center</h2>
          <p className="text-sm text-gray-500 mt-1">{healthCenter?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <FormField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          <FormField
            label="Latitude"
            name="latitude"
            type="number"
            value={formData.latitude ?? ""}
            onChange={handleChange}
            placeholder="e.g., 7.0731"
          />

          <FormField
            label="Longitude"
            name="longitude"
            type="number"
            value={formData.longitude ?? ""}
            onChange={handleChange}
            placeholder="e.g., 125.6128"
          />

          <FormField
            label="Weekdays (Operating Hours)"
            name="weekdays"
            value={formData.operatingHours.weekdays}
            onChange={handleChange}
            placeholder="8:00 AM - 5:00 PM"
          />

          <FormField
            label="Weekends (Operating Hours)"
            name="weekends"
            value={formData.operatingHours.weekends}
            onChange={handleChange}
            placeholder="Closed"
          />

          <FormField
            label="Mobile Number"
            name="mobile"
            value={formData.contactInfo.mobile}
            onChange={handleChange}
            placeholder="+63 9XX XXX XXXX"
          />

          <FormField
            label="Telephone Number"
            name="telephone"
            value={formData.contactInfo.telephone}
            onChange={handleChange}
            placeholder="(082) XXX XXXX"
          />
        </div>

        <div className="flex justify-end gap-4">
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
