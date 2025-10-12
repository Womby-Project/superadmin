// components/ServiceFeeComponents/modals/EditService.tsx
// Persists edits to Supabase: updates booking_types row

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Service } from "../ServiceFeeComponents/ServiceCard";

// Reusable component for form inputs
const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {children}
  </div>
);

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedService: Service) => void;
  service: Service | null;
}

export default function EditServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
}: EditServiceModalProps) {
  const [price, setPrice] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [featuresText, setFeaturesText] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setTitle(service.title || "");
      setDesc(service.description || "");
      setPrice(String(service.price ?? ""));
      setDuration(String(service.durationMinutes ?? ""));
      setFeaturesText((service.features || []).join("\n"));
      setErr(null);
    }
  }, [service]);

  const parsedPrice = useMemo(() => Number(price || 0), [price]);
  const parsedDuration = useMemo(() => Math.max(0, Math.round(Number(duration || 0))), [duration]);

  if (!isOpen || !service) return null;

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      // Prepare update payload
      const payload = {
        booking_name: title.trim(),
        booking_type_description: desc.trim() || null,
        booking_type_price: parsedPrice,
        booking_type_duration_minutes: parsedDuration,
        booking_type_features: featuresText
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      };

      // Persist to Supabase
      const { error: upErr } = await supabase
        .from("booking_types")
        .update(payload)
        .eq("id", service.id);

      if (upErr) throw upErr;

      // Return updated shape back to card
      onSave({
        ...service,
        title: payload.booking_name,
        description: payload.booking_type_description || "",
        price: payload.booking_type_price,
        durationMinutes: payload.booking_type_duration_minutes,
        features: payload.booking_type_features,
      });
    } catch (e: any) {
      console.error(e);
      setErr(e.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-lg bg-white rounded-xl shadow-lg p-8 border-none space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Edit {service?.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Update the pricing and details for this service.
          </p>
        </div>

        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="space-y-4">
          <FormField label="Service Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </FormField>

          <FormField label="Description">
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Price (PHP)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
              />
            </FormField>

            <FormField label="Duration (minutes)">
              <input
                type="number"
                min={0}
                step="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
              />
            </FormField>
          </div>

          <FormField label="Features (one per line)">
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={5}
              placeholder="Enter each feature on a new line…"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg text-white font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
