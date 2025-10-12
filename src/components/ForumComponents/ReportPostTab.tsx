import React, { useCallback, useMemo, useState } from "react";
import ForumPostCard from "./ForumPostCard";
import FilterBar, { type SortOrder } from "./FilterBar";
import type { UiForumPost } from "@/components/types/forum";

interface ReportedPostsTabProps {
  posts: UiForumPost[];
  onRemovePost: (postId: string, reasons: string[]) => void;
  onViewPost: (post: UiForumPost) => void;
  /** minimum number of reports to surface in this tab (default: 1) */
  minReports?: number;
}

const ReportedPostsTab: React.FC<ReportedPostsTabProps> = ({
  posts,
  onRemovePost,
  onViewPost,
  minReports = 1,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // --- Safe helpers ----------------------------------------------------------
  const safeString = (v: unknown) =>
    typeof v === "string" ? v : v == null ? "" : String(v);

  const safeAuthorName = (author: unknown) => {
    if (typeof author === "string") return author;
    if (author && typeof author === "object" && "name" in author) {
      
      return safeString(author.name);
    }
    return "";
  };

  const safeTags = (tags: unknown): string[] =>
    Array.isArray(tags)
      ? tags.map((t) => (typeof t === "string" ? t : String(t))).filter(Boolean)
      : [];

  const getSortableDate = (p: UiForumPost) => {
    const raw =
      (p as any)?.date ??
      (p as any)?.createdAt ??
      (p as any)?.created_at ??
      (p as any)?.publishedAt ??
      (p as any)?.published_at ??
      null;
    const ts = raw ? new Date(raw).getTime() : NaN;
    return Number.isFinite(ts) ? ts : 0;
  };

  // Prefer mapped Ui shape, but support legacy/mixed data.
  const getReportCount = (p: UiForumPost): number => {
    const fromUi = (p as any)?.reportedBy?.count;
    if (typeof fromUi === "number") return fromUi;

    const fromDirect = (p as any)?.reportCount;
    if (typeof fromDirect === "number") return fromDirect;

    const fromMeta = (p as any)?.meta?.reports?.count;
    if (typeof fromMeta === "number") return fromMeta;

    const fromArray = Array.isArray((p as any)?.reports)
      ? (p as any).reports.length
      : 0;

    return fromArray ?? 0;
  };

  // --- Derived lists ---------------------------------------------------------
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const reported = posts.filter((p) => getReportCount(p) >= minReports);

    const searched = reported.filter((p) => {
      if (!q) return true;
      const title = safeString((p as any)?.title).toLowerCase();
      const content = safeString((p as any)?.content).toLowerCase();
      const authorName = safeAuthorName((p as any)?.author).toLowerCase();
      const tags = safeTags((p as any)?.tags).map((t) => t.toLowerCase());

      return (
        title.includes(q) ||
        content.includes(q) ||
        authorName.includes(q) ||
        tags.some((t) => t.includes(q))
      );
    });

    const sorted = [...searched].sort((a, b) => {
      const da = getSortableDate(a);
      const db = getSortableDate(b);
      return sortOrder === "newest" ? db - da : da - db;
    });

    return sorted;
  }, [posts, searchQuery, sortOrder, minReports]);

  const totalReported = useMemo(
    () => posts.filter((p) => getReportCount(p) >= minReports).length,
    [posts, minReports]
  );

  // --- Stable handlers -------------------------------------------------------
  const handleToggleSort = useCallback(
    () => setSortOrder((s) => (s === "newest" ? "oldest" : "newest")),
    []
  );

  const handleRemove = useCallback(
    (id: string, reasons: string[]) => onRemovePost(String(id), reasons),
    [onRemovePost]
  );

  // --- Render ----------------------------------------------------------------
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm text-gray-600">
          Reported posts: <span className="font-semibold">{totalReported}</span>
        </h2>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOrder={sortOrder}
        onToggleSort={handleToggleSort}
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
            key={String((post as any)?.id)}
            post={post}
            onRemove={handleRemove}
            onViewPost={onViewPost}
          />
        ))
      )}
    </div>
  );
};

export default ReportedPostsTab;
