import React from "react";
import { Icon } from "@iconify/react";

interface ForumHeaderProps {
  totalPosts: number;
  pendingApproval: number;
  pendingReports: number;
  loading?: boolean;
}

const ForumHeader: React.FC<ForumHeaderProps> = ({
  totalPosts,
  pendingApproval,
  pendingReports,
  loading = false,
}) => {
  const StatCard = ({
    label,
    value,
    icon,
    iconBg,
    iconColor,
  }: {
    label: string;
    value: number;
    icon: string;
    iconBg: string;
    iconColor: string;
  }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between transition hover:shadow-md">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">
          {loading ? "…" : value}
        </p>
      </div>
      <div className={`${iconBg} p-3 rounded-md`}>
        <Icon icon={icon} className={`${iconColor} text-2xl`} />
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Forum</h1>
      <p className="text-gray-600">
        Manage forum posts and comments, handle reports, and maintain forum
        guidelines.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <StatCard
          label="Total Forum Posts"
          value={totalPosts}
          icon="mdi:approval"
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Pending Post Approval"
          value={pendingApproval}
          icon="mingcute:list-search-fill"
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
        />
        <StatCard
          label="Pending Forum Reports"
          value={pendingReports}
          icon="iconamoon:flag-fill"
          iconBg="bg-red-100"
          iconColor="text-red-500"
        />
      </div>
    </div>
  );
};

export default ForumHeader;
