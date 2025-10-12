// components/HealthCenterComponents/HealthCenterHeader.tsx
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AddHealthCenterModal, { type HealthCenterData } from "@/components/modals/AddHealthCenter";
import { supabase } from "@/lib/supabaseClient";

export default function HealthCenterHeader({
  onAdded,                 // parent refresh after add/import
  onSearchChange,          // NEW: bubble search up
}: {
  onAdded?: () => Promise<void> | void;
  onSearchChange?: (q: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");

  // check admin
  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return setIsAdmin(false);

      const { data } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", uid)
        .maybeSingle();

      setIsAdmin(Boolean(data));
    })();
  }, []);

  // single save -> insert one row
  const handleSaveSingle = async (data: HealthCenterData) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;

    const { error } = await supabase.from("barangay_health_centers").insert({
      name: data.name,
      address: data.address ?? null,
      contact_numbers: data.contactNumbers ?? [],
      telephone_numbers: data.telephoneNumbers ?? [],
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      operating_hours: data.operatingHours ?? {},
      created_by: uid,
      updated_by: uid,
    });

    if (error) {
      console.error(error);
      alert("Failed to add health center.");
      return;
    }
    setIsModalOpen(false);
    await onAdded?.();
  };

  // CSV import -> upsert many
  const handleImportCSV = async (rows: HealthCenterData[]) => {
    const payload = rows.map(r => ({
      name: r.name,
      address: r.address ?? null,
      contact_numbers: r.contactNumbers ?? [],
      telephone_numbers: r.telephoneNumbers ?? [],
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      operating_hours: r.operatingHours ?? {},
    }));

    const { error } = await supabase
      .from("barangay_health_centers")
      .upsert(payload, { onConflict: "name" });

    if (error) {
      console.error(error);
      alert("CSV import failed.");
      return;
    }
    setIsModalOpen(false);
    await onAdded?.();
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Health Centers</h1>
            <p className="text-gray-500 mt-1">Manage the list of all available health centers.</p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
            <div className="relative flex-grow md:w-64">
              <Icon
                icon="ic:round-search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"
              />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  const q = e.target.value;
                  setSearch(q);
                  onSearchChange?.(q);   // ← bubble to page
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E9AEA4]"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#E46B64] text-white rounded-md py-2 px-4 hover:bg-[#E9AEA4] transition"
              >
                <Icon icon="ic:round-add" className="h-5 w-5" />
                <span>Add Health Center</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <AddHealthCenterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaveSingle={handleSaveSingle}
          onImportCSV={handleImportCSV}
        />
      )}
    </>
  );
}
