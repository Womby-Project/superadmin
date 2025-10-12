// components/HealthCenterComponents/modals/AddHealthCenterModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { useState } from "react";

export interface HealthCenterData {
  name: string;
  address?: string;
  contactNumbers: string[];
  telephoneNumbers: string[];
  latitude?: number | null;
  longitude?: number | null;
  operatingHours?: { weekdays?: string; weekends?: string };
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaveSingle: (data: HealthCenterData) => Promise<void> | void;
  onImportCSV: (rows: HealthCenterData[]) => Promise<void> | void;
};

const ContactField = ({
  value,
  onChange,
  onRemove,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  placeholder?: string;
}) => (
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
    />
    <button onClick={onRemove} className="p-2 text-gray-400 hover:text-red-500">
      <Icon icon="mdi:close" className="h-5 w-5" />
    </button>
  </div>
);

export default function AddHealthCenterModal({
  isOpen,
  onClose,
  onSaveSingle,
  onImportCSV,
}: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumbers, setContactNumbers] = useState<string[]>([""]);
  const [telephoneNumbers, setTelephoneNumbers] = useState<string[]>([""]);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [weekdays, setWeekdays] = useState("");
  const [weekends, setWeekends] = useState("");
  const [csvBusy, setCsvBusy] = useState(false);

  const handleAdd = async () => {
    const payload: HealthCenterData = {
      name: name.trim(),
      address: address.trim() || undefined,
      contactNumbers: contactNumbers.map(s => s.trim()).filter(Boolean),
      telephoneNumbers: telephoneNumbers.map(s => s.trim()).filter(Boolean),
      latitude: latitude.trim() ? Number(latitude) : null,
      longitude: longitude.trim() ? Number(longitude) : null,
      operatingHours: {
        weekdays: weekdays.trim() || undefined,
        weekends: weekends.trim() || undefined,
      },
    };
    await onSaveSingle(payload);
    reset();
  };

  const reset = () => {
    setName("");
    setAddress("");
    setContactNumbers([""]);
    setTelephoneNumbers([""]);
    setLatitude("");
    setLongitude("");
    setWeekdays("");
    setWeekends("");
  };

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(prev => [...prev, ""]);
  const removeField = (
    index: number,
    state: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (state.length > 1) setter(state.filter((_, i) => i !== index));
  };

  // CSV IMPORT
  const onPickCSV = async (file: File) => {
    setCsvBusy(true);
    try {
      // Prefer PapaParse if installed, else do a minimal parse
      const parseWithPapa = async () => {
        const Papa = (await import("papaparse")).default;
        return await new Promise<any>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: results => resolve(results),
            error: err => reject(err),
          });
        });
      };

      let rows: any[] = [];
      try {
        const { data } = await parseWithPapa();
        rows = data;
      } catch {
        // Fallback naive parser (expects no quoted commas)
        const text = await file.text();
        const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
        const headers = headerLine.split(",").map(h => h.trim());
        rows = lines.map(line => {
          const cols = line.split(",").map(c => c.trim());
          return headers.reduce((acc, h, i) => {
            acc[h] = cols[i] ?? "";
            return acc;
          }, {} as Record<string, string>);
        });
      }

      // Map CSV → HealthCenterData
      const mapped: HealthCenterData[] = rows.map(r => {
        const contacts = (r.contact_numbers || r.contactNumbers || "")
          .split("|")
          .map((s: string) => s.trim())
          .filter(Boolean);
        const tels = (r.telephone_numbers || r.telephoneNumbers || "")
          .split("|")
          .map((s: string) => s.trim())
          .filter(Boolean);
        const lat = (r.latitude ?? "").toString().trim();
        const lng = (r.longitude ?? "").toString().trim();

        return {
          name: (r.name ?? "").toString().trim(),
          address: (r.address ?? "").toString().trim() || undefined,
          contactNumbers: contacts,
          telephoneNumbers: tels,
          latitude: lat ? Number(lat) : null,
          longitude: lng ? Number(lng) : null,
          operatingHours: {
            weekdays: (r.weekdays ?? "").toString().trim() || undefined,
            weekends: (r.weekends ?? "").toString().trim() || undefined,
          },
        };
      }).filter(r => r.name);

      if (mapped.length) {
        await onImportCSV(mapped);
        reset();
      }
    } finally {
      setCsvBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-2xl bg-white rounded-xl shadow-lg p-8 border-none space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Add Health Center</h2>

          {/* CSV uploader */}
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer hover:bg-gray-50">
            <Icon icon="mdi:file-delimited" className="h-5 w-5 text-[#E46B64]" />
            <span>{csvBusy ? "Importing..." : "Import CSV"}</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickCSV(f);
                e.currentTarget.value = "";
              }}
              disabled={csvBusy}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of Barangay Health Center
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </div>

          {/* Contact Numbers */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500">Mobile Numbers</p>
              <button
                onClick={() => addField(setContactNumbers)}
                className="flex items-center gap-1 text-xs text-[#E46B64] font-medium"
              >
                <Icon icon="ic:round-add" className="h-4 w-4" /> Add field
              </button>
            </div>
            <div className="space-y-2">
              {contactNumbers.map((v, i) => (
                <ContactField
                  key={i}
                  value={v}
                  placeholder="+63 9XX XXX XXXX"
                  onChange={(e) =>
                    setContactNumbers(prev => prev.map((p, idx) => (idx === i ? e.target.value : p)))
                  }
                  onRemove={() => removeField(i, contactNumbers, setContactNumbers)}
                />
              ))}
            </div>
          </div>

          {/* Telephone Numbers */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500">Telephone Numbers</p>
              <button
                onClick={() => addField(setTelephoneNumbers)}
                className="flex items-center gap-1 text-xs text-[#E46B64] font-medium"
              >
                <Icon icon="ic:round-add" className="h-4 w-4" /> Add field
              </button>
            </div>
            <div className="space-y-2">
              {telephoneNumbers.map((v, i) => (
                <ContactField
                  key={i}
                  value={v}
                  placeholder="(082) XXX XXXX"
                  onChange={(e) =>
                    setTelephoneNumbers(prev => prev.map((p, idx) => (idx === i ? e.target.value : p)))
                  }
                  onRemove={() => removeField(i, telephoneNumbers, setTelephoneNumbers)}
                />
              ))}
            </div>
          </div>

          {/* Coordinates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </div>

          {/* Operating hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weekdays</label>
            <input
              type="text"
              placeholder="8:00 AM - 5:00 PM"
              value={weekdays}
              onChange={(e) => setWeekdays(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weekends</label>
            <input
              type="text"
              placeholder="Closed"
              value={weekends}
              onChange={(e) => setWeekends(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-6 py-2 rounded-lg text-white font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
