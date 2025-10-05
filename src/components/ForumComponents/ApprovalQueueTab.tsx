import React from "react";
import ForumPostCard from "./ForumPostCard";
import type { UiForumPost } from "@/components/types/forum";

interface ApprovalQueueTabProps {
  posts: UiForumPost[];
  onApprovePost: (postId: string) => void;
  onDismissPost: (postId: string, reasons: string[]) => void; // ✅ updated to match ForumPostCard
  onViewPost: (post: UiForumPost) => void;
}

const ApprovalQueueTab: React.FC<ApprovalQueueTabProps> = ({
  posts,
  onApprovePost,
  onDismissPost,
  onViewPost,
}) => {
  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg shadow mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {posts.length} item{posts.length === 1 ? "" : "s"} in queue
        </div>
        <div />
      </div>

      {/* Post List */}
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No items in the approval queue.
        </div>
      ) : (
        posts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            isApprovalQueue
            onApprove={(id) => onApprovePost(String(id))}
            onDismiss={(id, reasons) => onDismissPost(String(id), reasons)} // ✅ pass reasons
            onViewPost={onViewPost}
          />
        ))
      )}
    </div>
  );
};

export default ApprovalQueueTab;
