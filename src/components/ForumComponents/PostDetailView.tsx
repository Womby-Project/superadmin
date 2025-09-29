import React from 'react';
import { Icon } from '@iconify/react';
import { type ForumPost } from '../../lib/ForumPost';
import ForumPostCard from './ForumPostCard'; 
import CommentCard from './CommentCard';

interface PostDetailViewProps {
  post: ForumPost;
  onBack: () => void;
  // In a real app, you'd pass handlers for Keep/Remove actions here
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ post, onBack }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
        <Icon icon="feather:arrow-left" className="mr-2" />
        Back to Forum
      </button>

      {/* Main Post */}
      {/* We pass a special prop to prevent the main post from being clickable again */}
      <ForumPostCard post={post} isDetailView={true} />
      
      {/* Comments Section */}
      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-800">Comments</h2>
        <div className="mt-2">
          {post.commentsList && post.commentsList.length > 0 ? (
            post.commentsList.map(comment => <CommentCard key={comment.id} comment={comment} />)
          ) : (
            <p className="text-gray-500 text-sm mt-4">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailView;