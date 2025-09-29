import React from 'react';
import ForumPostCard from './ForumPostCard';
import { type ForumPost } from '../../lib/ForumPost';

interface ApprovalQueueTabProps {
  posts: ForumPost[];
  onApprovePost: (postId: number) => void;
  onDismissPost: (postId: number) => void;
  onViewPost: (post: ForumPost) => void; // <-- CRITICAL FIX: Add this prop
}

const ApprovalQueueTab: React.FC<ApprovalQueueTabProps> = ({ posts, onApprovePost, onDismissPost, onViewPost }) => {
  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg shadow mb-6 flex items-center justify-between">
        {/* ... filter bar JSX ... */}
      </div>

      {/* Post List */}
      {posts.map(post => (
        <ForumPostCard 
          key={post.id} 
          post={post} 
          isApprovalQueue={true}
          onApprove={onApprovePost} 
          onDismiss={onDismissPost}
          onViewPost={onViewPost}
        />
      ))}
    </div>
  );
};

export default ApprovalQueueTab;