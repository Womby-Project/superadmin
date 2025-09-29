import React from 'react';
import ForumPostCard from './ForumPostCard';
import { type ForumPost } from '../../lib/ForumPost';

interface ReportedPostsTabProps {
  posts: ForumPost[];
  onRemovePost: (postId: number) => void;
  onViewPost: (post: ForumPost) => void; 
}

const ReportedPostsTab: React.FC<ReportedPostsTabProps> = ({ posts, onRemovePost, onViewPost }) => {
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
          onRemove={onRemovePost}
          onViewPost={onViewPost}
        />
      ))}
    </div>
  );
};

export default ReportedPostsTab;