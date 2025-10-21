// app/(admin)/approval/page.tsx

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import SidebarComponents from "../components/SidebarComponents";
import Header from "../components/HeaderComponent";
import ApprovalsHeader from "../components/ApprovalsComponents/ApprovalsHeader";
import ApprovalsTable, { type Approval } from "../components/ApprovalsComponents/ApprovalsTable";

export default function ApprovalPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      // Include NULLs (legacy rows) + explicit false
      const { data, error } = await supabase
        .from("obgyn_users")
        .select(
          "id, first_name, last_name, email, prc_license_number, affiliated_hospitals_clinics, prc_id_document_url, is_verified, organization, status, created_at"
        )
        .eq("status", "Pending")
        .order("created_at", { ascending: false });


      if (error) throw error;

      const mapped: Approval[] =
        (data ?? []).map((r: any) => ({
          obgynId: r.id, // <-- required by ApprovalsTable
          name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
          email: r.email ?? "",
          prcIdUrl: r.prc_id_document_url ?? null, // <-- FIXED: map PRC image URL
          licenseNumber: r.prc_license_number ?? "",
          affiliations: Array.isArray(r.affiliated_hospitals_clinics)
            ? (r.affiliated_hospitals_clinics as string[])
            : [],
          // With only is_verified in schema, treat all false/NULL as "Pending"
          status: "Pending",
        })) ?? [];

      setApprovals(mapped);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load pending OBGYNs.");
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white shadow-md">
        <SidebarComponents />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-6">
            <ApprovalsHeader />

            {loading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-500">Loading pending OBGYNs…</p>
              </div>
            ) : approvals.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-500">No pending OBGYNs found.</p>
              </div>
            ) : (
              <ApprovalsTable approvals={approvals} onRefresh={fetchPending} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
