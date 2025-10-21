import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import AvatarWithFallback from "../ui/AvatarFallBack";

// -------------------
// Type Definition
// -------------------
export interface ObgynUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  prc_license_number: string | null;
  profile_picture_url: string | null;
  is_verified: boolean;
  status?: string | null;
  created_at: string;
}

// -------------------
// Utility
// -------------------
function resolveAvatarUrl(url?: string | null): string {
  return url || "/doctor.png";
}

// -------------------
// Main Component
// -------------------
export default function PendingOBGYNs() {
  const [items, setItems] = useState<ObgynUser[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Fetch pending OB-GYNs
  const fetchPendingObgyns = async (limit = 5, offset = 0) => {
    const { data, error, count } = await supabase
      .from("obgyn_users")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        prc_license_number,
        profile_picture_url,
        is_verified,
        status,
        created_at
      `,
        { count: "exact" }
      )
      .eq("is_verified", false)
      .eq("status", "Pending")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { items: data ?? [], total: count ?? 0 };
  };


  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { items, total } = await fetchPendingObgyns(5, 0);
      setItems(items);
      setTotal(total);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load pending OB-GYNs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Approve OB-GYN (set is_verified = true, status = 'Approved')
  const approveObgyn = async (id: string) => {
    const { error } = await supabase
      .from("obgyn_users")
      .update({ is_verified: true, status: "Approved" })
      .eq("id", id);

    if (error) throw error;
  };

  const handleApprove = async (id: string) => {
    try {
      setBusyId(id);
      await approveObgyn(id);
      // Optimistic update
      setItems((cur) => cur.filter((x) => x.id !== id));
      setTotal((n) => Math.max(0, n - 1));
    } catch (e) {
      console.error(e);
      alert("Failed to approve OB-GYN.");
    } finally {
      setBusyId(null);
    }
  };

  // -------------------
  // Render
  // -------------------
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Pending OB-GYNs</h3>
          <p className="text-sm text-gray-500">For Verification & Approval</p>
        </div>

        <Link
          to="/approvals-list"
          className="text-sm font-medium text-red-500 hover:text-pink-600"
        >
          View All ({total})
        </Link>
      </div>

      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No pending OB-GYNs </p>
      ) : (
        <div className="space-y-4">
          {items.map((doctor) => {
            const avatar = resolveAvatarUrl(doctor.profile_picture_url);
            const submitted = doctor.created_at
              ? new Date(doctor.created_at).toLocaleDateString()
              : "—";
            const name =
              `${doctor.first_name ?? ""} ${doctor.last_name ?? ""}`.trim() ||
              "Unknown";

            return (
              <div key={doctor.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AvatarWithFallback
                    src={avatar}
                    name={name}
                    size={40}
                    fallbackBg="bg-pink-500"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{doctor.email}</p>
                    {doctor.prc_license_number && (
                      <p className="text-xs text-gray-500 mt-1">
                        PRC: {doctor.prc_license_number}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted: {submitted}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <Link
                    to={`/approvals/${doctor.id}`}
                    className="flex-1 inline-flex justify-center bg-white border border-gray-300 text-gray-700 text-xs font-semibold py-2 px-3 rounded-md hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleApprove(doctor.id)}
                    disabled={busyId === doctor.id}
                    className="flex-1 bg-red-500 text-white text-xs font-semibold py-2 px-3 rounded-md hover:bg-red-600 disabled:opacity-50"
                  >
                    {busyId === doctor.id ? "Approving…" : "Approve"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
