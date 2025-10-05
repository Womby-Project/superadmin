import React, { useMemo, useState } from "react";
import ForumPostCard from "./ForumPostCard";
import FilterBar, { type SortOrder } from "./FilterBar";
import type { UiForumPost } from "@/components/types/forum";

interface ReportedPostsTabProps {
  posts: UiForumPost[];
  onRemovePost: (postId: string, reasons: string[]) => void;
  onViewPost: (post: UiForumPost) => void;
}

const ReportedPostsTab: React.FC<ReportedPostsTabProps> = ({
  posts,
  onRemovePost,
  onViewPost,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase();

    const filtered = posts.filter((p) => {
      const matchesText =
        p.content.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const isReported = (p.reportedBy?.count ?? 0) > 0;
      return matchesText && isReported;
    });

    return filtered.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
  }, [posts, searchQuery, sortOrder]);

  return (
    <div>
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOrder={sortOrder}
        onToggleSort={() =>
          setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
        }
        disableTags
        placeholder="Search reported posts…"
      />

      {filteredPosts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No reported posts found.
        </div>
      ) : (
        filteredPosts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            onRemove={(id, reasons) => onRemovePost(String(id), reasons)}
            onViewPost={onViewPost}
          />
        ))
      )}
    </div>
  );
};

export default ReportedPostsTab;
