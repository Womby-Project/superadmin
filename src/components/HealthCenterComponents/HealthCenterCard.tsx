// components/HealthCenterComponents/HealthCenterCard.tsx
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import EditHealthCenterModal from "@/components/modals/EditHealthCenter";
import type { HealthCenterData } from "@/components/modals/AddHealthCenter";
import type { HealthCenter as ModalHealthCenter } from "@/components/modals/EditHealthCenter";

export type HealthCenter = (HealthCenterData & { id?: string }) | any; // allow legacy shape with contactInfo

export default function HealthCenterCard({
  center,
  canEdit = false,
  onSave,
}: {
  center: HealthCenter;
  canEdit?: boolean;
  onSave?: (updated: HealthCenter) => Promise<void> | void;
}) {
  const [data, setData] = useState(center);
  const [open, setOpen] = useState(false);

  // --- Normalize numbers from EITHER new arrays OR legacy contactInfo { phone1, phone2, mobile, telephone } ---
  const mobileList = useMemo<string[]>(() => {
    if (Array.isArray(data?.contactNumbers) && data.contactNumbers.length) return data.contactNumbers;
    const ci = data?.contactInfo ?? {};
    const m = [ci.mobile, ci.phone1].filter(Boolean);
    return m.length ? m : [];
  }, [data]);

  const telList = useMemo<string[]>(() => {
    if (Array.isArray(data?.telephoneNumbers) && data.telephoneNumbers.length) return data.telephoneNumbers;
    const ci = data?.contactInfo ?? {};
    const t = [ci.telephone, ci.phone2].filter(Boolean);
    return t.length ? t : [];
  }, [data]);

  // Card (array) -> Modal (single strings)
  const toModal = (h: HealthCenter): ModalHealthCenter => ({
    name: h.name,
    address: h.address ?? "",
    operatingHours: {
      weekdays: h.operatingHours?.weekdays ?? "",
      weekends: h.operatingHours?.weekends ?? "",
    },
    contactInfo: {
      mobile: mobileList[0] ?? "",
      telephone: telList[0] ?? "",
    },
    latitude: h.latitude ?? null,
    longitude: h.longitude ?? null,
  });

  // Modal (single strings) -> Card (array)
  const fromModal = (m: ModalHealthCenter, base: HealthCenter): HealthCenter => ({
    ...base,
    name: m.name,
    address: m.address,
    operatingHours: {
      weekdays: m.operatingHours?.weekdays ?? "",
      weekends: m.operatingHours?.weekends ?? "",
    },
    contactNumbers: m.contactInfo?.mobile ? [m.contactInfo.mobile] : [],
    telephoneNumbers: m.contactInfo?.telephone ? [m.contactInfo.telephone] : [],
    latitude: m.latitude ?? null,
    longitude: m.longitude ?? null,
  });

  const handleSave = async (updatedFromModal: ModalHealthCenter) => {
    const merged: HealthCenter = fromModal(updatedFromModal, data);
    await onSave?.(merged);
    setData(merged);
    setOpen(false);
  };

  const gmapsHref = (() => {
    const { latitude, longitude, name, address } = data;
    if (latitude != null && longitude != null) return `https://www.google.com/maps?q=${latitude},${longitude}`;
    const q = encodeURIComponent([name, address].filter(Boolean).join(" "));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  })();

  const displayWeekdays = data.operatingHours?.weekdays?.trim() || "—";
  const displayWeekends = data.operatingHours?.weekends?.trim() || "Closed"; // default to Closed

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        {canEdit && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setOpen(true)}
              className="text-[#E46B64] hover:opacity-80 transition"
              aria-label="Edit"
              title="Edit"
            >
              <Icon icon="lucide:edit" className="h-5 w-5" />
            </button>
          </div>
        )}

        <h2 className="text-lg font-bold text-gray-800 mb-4">{data.name}</h2>

        <div className="space-y-5 text-sm">
          {/* Address */}
          {data.address && (
            <div>
              <p className="text-xs font-semibold text-gray-800 uppercase mb-1">Address</p>
              <div className="flex items-center gap-2">
                <Icon icon="tdesign:location" className="h-4 w-4 text-[#E46B64]" />
                <span className="text-gray-600">{data.address}</span>
              </div>
              <div className="mt-2">
                <a
                  className="inline-flex items-center gap-2 text-[#E46B64] hover:underline"
                  href={gmapsHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon icon="mdi:map-marker" className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          )}

          {/* Operating Hours */}
          <div>
            <p className="text-xs font-semibold text-gray-800 uppercase mb-1">Operating Hours</p>
            <div className="flex justify-between items-center text-gray-600">
              <span>Weekdays</span>
              <span>{displayWeekdays}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Weekends</span>
              <span>{displayWeekends}</span>
            </div>
          </div>

          {/* Contact Information — always render */}
          <div>
            <p className="text-xs font-semibold text-gray-800 uppercase mb-1">Contact Information</p>
            {mobileList.length ? (
              mobileList.map((n, i) => (
                <div className="flex items-center gap-2 text-gray-600" key={`m-${i}`}>
                  <Icon icon="lineicons:phone" className="h-4 w-4 text-[#E46B64]" />
                  <span>{n}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <Icon icon="lineicons:phone" className="h-4 w-4" />
                <span>No phone number</span>
              </div>
            )}
            {telList.length ? (
              telList.map((n, i) => (
                <div className="flex items-center gap-2 text-gray-600" key={`t-${i}`}>
                  <Icon icon="solar:phone-outline" className="h-4 w-4 text-[#E46B64]" />
                  <span>{n}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <Icon icon="solar:phone-outline" className="h-4 w-4" />
                <span>No Telephone Number</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {canEdit && (
        <EditHealthCenterModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onSave={handleSave}
          healthCenter={toModal(data)}
        />
      )}
    </>
  );
}
