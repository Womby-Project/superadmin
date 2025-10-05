import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import ForumPostCard from "./ForumPostCard";
import type { UiForumPost } from "@/components/types/forum"; // ✅ new type

interface AllPostsTabProps {
  posts: UiForumPost[];
  onViewPost: (post: UiForumPost) => void;
}

const AllPostsTab: React.FC<AllPostsTabProps> = ({ posts, onViewPost }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // --- Derived filters ---
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = posts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );

    const sorted = filtered.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return sorted;
  }, [posts, searchQuery, sortOrder]);

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
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: "300px" }}
            />
          </div>

          {/* Placeholder for tag filter (hook up later) */}
          <div className="relative">
            <button
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            >
              <span>Tags</span>
              <Icon icon="feather:chevron-down" className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={() =>
              setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
            }
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Sort</span>
            <Icon
              icon="heroicons-outline:switch-vertical"
              className="ml-2 h-5 w-5 text-gray-500"
            />
            <span className="ml-1 text-xs text-gray-400 capitalize">
              {sortOrder}
            </span>
          </button>
        </div>
      </div>

      {/* Post List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No posts found.
        </div>
      ) : (
        filteredPosts.map((post) => (
          <ForumPostCard key={post.id} post={post} onViewPost={onViewPost} />
        ))
      )}
    </div>
  );
};

export default AllPostsTab;
