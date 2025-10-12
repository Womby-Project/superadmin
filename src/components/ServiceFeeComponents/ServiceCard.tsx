// components/ServiceFeeComponents/ServiceCard.tsx
// A card bound to one booking_type row with live editing via Supabase

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import EditServiceModal from "../modals/EditService";

export interface Service {
  id: string;                 // booking_types.id
  title: string;              // booking_name
  description: string;        // booking_type_description
  price: number;              // booking_type_price (numeric)
  durationMinutes: number;    // booking_type_duration_minutes
  features: string[];         // booking_type_features
  bookings: number;           // computed from appointments
  revenueThisMonth: number;   // computed from payments (this month)
}

export default function ServiceCard({
  service: initialService,
  onSaved,
}: {
  service: Service;
  onSaved?: () => void;
}) {
  const [service, setService] = useState<Service>(initialService);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const peso = (n: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(isNaN(n) ? 0 : n);

  const durationLabel = useMemo(() => {
    const m = Math.round(service.durationMinutes || 0);
    if (m <= 0) return "—";
    if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h}h ${rem}m` : `${h} hour${h === 1 ? "" : "s"}`;
  }, [service.durationMinutes]);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
            <p className="text-sm text-gray-500">{service.description}</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-400 hover:text-[#E9AEA4]"
            title="Edit service"
          >
            <Icon icon="ph:pencil-simple-bold" className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-800">{peso(service.price)}</p>
          <p className="text-sm text-gray-500">{durationLabel}</p>
        </div>

        <ul className="space-y-2 mb-6 text-sm text-gray-600 flex-grow">
          {service.features.length === 0 && (
            <li className="text-gray-400 italic">No features listed</li>
          )}
          {service.features.map((feature, index) => (
            <li key={`${service.id}-feat-${index}`} className="flex items-start">
              <Icon
                icon="ph:check-circle-bold"
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-200 pt-4 flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Total Bookings</p>
            <p className="font-bold text-gray-800">{service.bookings}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Revenue (This Month)</p>
            <p className="font-bold text-gray-800">{peso(service.revenueThisMonth)}</p>
          </div>
        </div>
      </div>

      <EditServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={service}
        onSave={(updated) => {
          setService(updated); // local immediate update
          setIsModalOpen(false);
          onSaved?.(); // parent refetch (ensures consistency)
        }}
      />
    </>
  );
}
