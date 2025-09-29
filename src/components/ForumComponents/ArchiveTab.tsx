import React from 'react';
import { Icon } from '@iconify/react';
import ForumPostCard from './ForumPostCard';
import { type ForumPost } from '../../lib/ForumPost';

interface ArchiveTabProps {
  posts: ForumPost[];
  onViewPost: (post: ForumPost) => void;
}

const ArchiveTab: React.FC<ArchiveTabProps> = ({ posts }) => {
  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg shadow mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon icon="feather:search" className="text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-140 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: '400px' }}
            />
          </div>
          <div className="relative">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span>Tags</span>
              <Icon icon="feather:chevron-down" className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
        <div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span>Sort</span>
            <Icon icon="heroicons-outline:switch-vertical" className="ml-2 h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>


      {/* Archived Post List */}
      {posts.map(post => (
        <ForumPostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default ArchiveTab;