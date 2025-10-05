import React from "react";
import { Icon } from "@iconify/react";
import ForumPostCard from "./ForumPostCard";
import CommentCard from "./CommentCard";
import type { UiForumPost } from "@/components/types/forum";

interface PostDetailViewProps {
  post: UiForumPost;
  onBack: () => void;
  loading?: boolean;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({
  post,
  onBack,
  loading = false,
}) => {
  const hasComments = post.commentsList && post.commentsList.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-all">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 focus:outline-none"
      >
        <Icon icon="feather:arrow-left" className="mr-2 h-4 w-4" />
        Back to Forum
      </button>

      {/* Main Post (non-clickable in detail view) */}
      <ForumPostCard post={post} isDetailView />

      {/* Comments Section */}
      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <Icon icon="mdi:comment-text-outline" className="mr-2 text-blue-500" />
          Comments
        </h2>

        {loading ? (
          <p className="text-gray-500 text-sm mt-4 animate-pulse">
            Loading comments…
          </p>
        ) : hasComments ? (
          <div className="mt-2 space-y-3">
            {post.commentsList!.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-4">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default PostDetailView;
