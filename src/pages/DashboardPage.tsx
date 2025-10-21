import { useEffect, useState } from "react";
import SidebarComponents from "../components/SidebarComponents";
import Header from "../components/HeaderComponent";
import { Icon } from "@iconify/react";
import ForumPostsReview from "../components/DashboardComponents/ForumPostsReview";
import PendingOBGYNs from "../components/DashboardComponents/PendingOBGYNs";
import InformativeContent from "../components/DashboardComponents/InformativeContent";

// services
import { supabase } from "@/lib/supabaseClient";
import { fetchPendingObgyns } from "@/components/services/obgynService";
import { fetchApprovalQueue, fetchReportedPosts } from "@/components/services/forumService";
import { useNavigate } from "react-router-dom";

/** Lightweight counters **/
async function countVerifiedObgyns() {
  const { count, error } = await supabase
    .from("obgyn_users")
    .select("id", { count: "exact", head: true })
    .eq("is_verified", true);
  if (error) throw error;
  return count ?? 0;
}

export default function MainDashboard() {
  const nav = useNavigate();

  const [verifiedObgyns, setVerifiedObgyns] = useState<number>(0);
  const [pendingObgyns, setPendingObgyns] = useState<number>(0);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [pendingReports, setPendingReports] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const loadCounts = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [vCount, pendingObgynResp, approvalQueue, reported] = await Promise.all([
        countVerifiedObgyns(),
        fetchPendingObgyns(1, 0), // we only need total; items ignored
        fetchApprovalQueue(1, 0),
        fetchReportedPosts(1, 0),
      ]);

      setVerifiedObgyns(vCount);
      setPendingObgyns(pendingObgynResp.total ?? 0);
      setPendingApprovals(approvalQueue.length);
      setPendingReports(reported.length);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to load dashboard counts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const Card = ({
    title,
    value,
    icon,
    iconBg,
    iconColor,
    onClick,
  }: {
    title: string;
    value: number | string;
    icon: string;
    iconBg: string; // tailwind bg hex, you used custom colors
    iconColor: string; // hex color
    onClick?: () => void;
  }) => (
    <div
      className={`bg-white rounded-xl shadow-sm p-6 ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      } transition duration-200`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => onClick && (e.key === "Enter" || e.key === " ") && onClick()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-semibold text-sm">{title}</h3>
        <div className={`${iconBg} border border-[#E5E7EB] p-2 rounded-md`}>
          <Icon icon={icon} style={{ color: iconColor, fontSize: 30 }} />
        </div>
      </div>
      <p className="text-gray-800 text-xl font-bold">
        {loading ? <span className="inline-block h-5 w-16 bg-gray-100 animate-pulse rounded" /> : value}
      </p>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <SidebarComponents />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="p-6 overflow-y-auto flex-1">
          {/* Optional error banner */}
          {err && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            <Card
              title="Verified OBGYNs"
              value={verifiedObgyns}
              icon="fa7-solid:user-doctor"
              iconBg="bg-[#F2ECFE]"
              iconColor="#7C3AED"
              onClick={() => nav("/obgyndirectory")}
            />

            <Card
              title="Pending OBGYNs"
              value={pendingObgyns}
              icon="mdi:approval"
              iconBg="bg-[#E7F8FB]"
              iconColor="#06B6D4"
              onClick={() => nav("/approvals-list")}
            />

            <Card
              title="Pending Posts Approval"
              value={pendingApprovals}
              icon="mingcute:list-search-fill"
              iconBg="bg-[#FEE2E2]"
              iconColor="#DC2626"
              onClick={() => nav("/forum-management?tab=approval-queue")}
            />

            <Card
              title="Pending Forum Post Reports"
              value={pendingReports}
              icon="iconamoon:flag-fill"
              iconBg="bg-[#FEE2E2]"
              iconColor="#DC2626"
              onClick={() => nav("/forum-management?tab=reported")}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2">
              <ForumPostsReview />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <PendingOBGYNs />
              <InformativeContent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
