// app/(pages)/HealthCenterPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SidebarComponents from "../components/SidebarComponents";
import Header from "../components/HeaderComponent";
import HealthCenterHeader from "../components/HealthCenterComponents/HealthCenterHeader";
import HealthCenterCard, { type HealthCenter } from "../components/HealthCenterComponents/HealthCenterCard";

export default function HealthCenterPage() {
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState(""); // NEW

  // Check admin
  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return setIsAdmin(false);

      const { data } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      setIsAdmin(Boolean(data));
    })();
  }, []);

  // Fetch centers
  const fetchCenters = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("barangay_health_centers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching centers:", error);
    } else if (data) {
      const mapped: HealthCenter[] = data.map((h) => ({
        id: h.id,
        name: h.name,
        address: h.address,
        operatingHours: h.operating_hours ?? { weekdays: "N/A", weekends: "N/A" },
        contactNumbers: h.contact_numbers ?? [],
        telephoneNumbers: h.telephone_numbers ?? [],
        latitude: h.latitude ?? null,
        longitude: h.longitude ?? null,
      }));
      setHealthCenters(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  // Client-side filter (Option A)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return healthCenters;
    return healthCenters.filter((h) => {
      const hay = [
        h.name,
        h.address,
        h.operatingHours?.weekdays,
        h.operatingHours?.weekends,
        ...(h.contactNumbers ?? []),
        ...(h.telephoneNumbers ?? []),
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());

      return hay.some((s) => s.includes(q));
    });
  }, [healthCenters, search]);

  // Save edit (from card modal)
  const handleSaveEdit = async (updated: HealthCenter) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!updated.id) return;

    const { error } = await supabase
      .from("barangay_health_centers")
      .update({
        name: updated.name,
        address: updated.address ?? null,
        contact_numbers: updated.contactNumbers ?? [],
        telephone_numbers: updated.telephoneNumbers ?? [],
        latitude: updated.latitude ?? null,
        longitude: updated.longitude ?? null,
        operating_hours: updated.operatingHours ?? {},
        updated_by: userId,
      })
      .eq("id", updated.id);

    if (error) console.error("Update error:", error);
    else await fetchCenters();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <SidebarComponents />
      </aside>

      {/* Main layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-6">
            {/* Header with search + add */}
            <HealthCenterHeader
              onAdded={fetchCenters}
              onSearchChange={setSearch}   // ← hook up the search
            />

            {/* Cards grid */}
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-500">No health centers found.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtered.map((center) => (
                  <HealthCenterCard
                    key={center.id ?? center.name}
                    center={center}
                    canEdit={isAdmin}
                    onSave={handleSaveEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
