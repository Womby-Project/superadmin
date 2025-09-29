import React from 'react';
import { Icon } from '@iconify/react';

interface ForumHeaderProps {
  totalPosts: number;
  pendingApproval: number;
  pendingReports: number;
}

const ForumHeader: React.FC<ForumHeaderProps> = ({ totalPosts, pendingApproval, pendingReports }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Forum</h1>
      <p className="text-gray-600">Manage forum posts and comments, handle reports, and maintain forum guidelines.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Forum Posts</p>
            <p className="text-2xl font-bold">{totalPosts}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-md">
            <Icon icon="mdi:approval" className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Pending Post Approval</p>
            <p className="text-2xl font-bold">{pendingApproval}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-md">
            <Icon icon="mingcute:list-search-fill" className="text-orange-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Pending Forum Reports</p>
            <p className="text-2xl font-bold">{pendingReports}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-md">
            <Icon icon="iconamoon:flag-fill" className="text-red-500 text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumHeader;