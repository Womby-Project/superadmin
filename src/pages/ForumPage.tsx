"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import SidebarComponents from "../components/SidebarComponents";
import Header from "../components/HeaderComponent";
import ForumHeader from "../components/ForumComponents/ForumHeader";
import ForumTabs from "../components/ForumComponents/ForumTabs";
import AllPostsTab from "../components/ForumComponents/AllPostTab";
import ReportedPostsTab from "../components/ForumComponents/ReportPostTab";
import ApprovalQueueTab from "../components/ForumComponents/ApprovalQueueTab";
import ArchiveTab from "../components/ForumComponents/ArchiveTab";
import PostDetailView from "../components/ForumComponents/PostDetailView";

import type { UiForumPost, UiComment } from "@/components/types/forum";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

/* ---------------- DB Row Types ---------------- */
type ForumPostRow = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  author_id: string;
  tags: string[] | null;
  status: "Pending" | "Approved" | "Dismissed";
  is_deleted: boolean | null;
  is_locked?: boolean | null;
  forum_reactions: { count: number }[];
  forum_comments: { count: number }[];
};

type AuthorPublic = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_avatar_url: string | null;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string | null;
  author_id: string;
  post_id?: string; // we’ll fetch this when resolving comment reports
};

/* ---------------- Helpers ---------------- */
const toUiStatus = (s: ForumPostRow["status"]): "Posted" | "Pending" | "Removed" => {
  switch (s) {
    case "Approved":
      return "Posted";
    case "Pending":
      return "Pending";
    case "Dismissed":
      return "Removed";
    default:
      return "Pending";
  }
};

const getAggCount = (arr?: { count: number }[] | null) =>
  Array.isArray(arr) && arr[0] && typeof arr[0].count === "number" ? arr[0].count : 0;

const mapToUi = (row: ForumPostRow, author?: AuthorPublic): UiForumPost => ({
  id: row.id,
  author: {
    id: row.author_id,
    name: `${author?.first_name ?? "Anonymous"} ${author?.last_name ?? "Patient"}`.trim(),
    profilePic: author?.profile_avatar_url ?? "/images/mother.png",
  },
  date: row.created_at ? new Date(row.created_at).toLocaleString() : "",
  content: row.content,
  tags: row.tags ?? [],
  likes: getAggCount(row.forum_reactions),
  comments: getAggCount(row.forum_comments),
  status: toUiStatus(row.status),
  isLocked: !!row.is_locked,
  isDeleted: !!row.is_deleted,
});

/* Fetch minimal public author info via RPC (RLS-friendly) */
async function fetchAuthorsPublic(ids: string[]) {
  if (ids.length === 0) return new Map<string, AuthorPublic>();
  const { data, error } = await supabase.rpc("get_forum_author_public", {
    author_ids: ids,
  });
  if (error) {
    console.warn("[Forum] author RPC error:", error);
    return new Map<string, AuthorPublic>();
  }
  const list = (data as AuthorPublic[]) ?? [];
  return new Map(list.map((a) => [a.id, a]));
}

/* ---------------- Notifications helper ---------------- */
async function sendForumNotification(params: {
  recipientId: string;
  triggeredBy?: string | null;
  postId: string;
  title: string;
  message: string;
}) {
  const { recipientId, triggeredBy, postId, title, message } = params;
  const { error } = await supabase.from("notifications").insert({
    recipient_id: recipientId,
    recipient_role: "Patient",
    triggered_by: triggeredBy ?? null,
    type: "forum_interaction",
    title,
    message,
    related_forum_post_id: postId,
    is_read: false,
  });
  if (error) console.warn("[Forum] notification insert failed (non-blocking):", error);
}

/* ---------------- Data fetchers (Supabase) ---------------- */

/** All Posts = Approved & not deleted */
async function fetchApprovedPosts(limit = 20, offset = 0): Promise<UiForumPost[]> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(
      `
      id, title, content, created_at, author_id, tags, status, is_deleted, is_locked,
      forum_reactions(count),
      forum_comments(count)
    `
    )
    .eq("status", "Approved")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const rows = (data ?? []) as ForumPostRow[];
  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const authorMap = await fetchAuthorsPublic(authorIds);
  return rows.map((r) => mapToUi(r, authorMap.get(r.author_id)));
}

/**
 * Reported Posts = posts that have at least one Pending report,
 * whether the report targeted the post itself OR a comment under that post.
 *
 * Strategy:
 * 1) Collect `post_id`s from pending post-level reports.
 * 2) Collect `comment_id`s from pending comment-level reports -> resolve to `post_id`s.
 * 3) Union post_ids, fetch posts (not deleted), order/limit/range, map to UI.
 */
async function fetchReportedPosts(limit = 20, offset = 0): Promise<UiForumPost[]> {
  // 1) Pending post-level reports
  const { data: postReports, error: prErr } = await supabase
    .from("forum_reports")
    .select("post_id")
    .eq("status", "Pending")
    .not("post_id", "is", null);

  if (prErr) throw prErr;

  const postIdsFromPostReports = new Set<string>(
    (postReports ?? [])
      .map((r: { post_id: string | null }) => r.post_id)
      .filter((x): x is string => !!x)
  );

  // 2) Pending comment-level reports -> resolve to posts
  const { data: commentReports, error: crErr } = await supabase
    .from("forum_reports")
    .select("comment_id")
    .eq("status", "Pending")
    .not("comment_id", "is", null);

  if (crErr) throw crErr;

  const commentIds = Array.from(
    new Set(
      (commentReports ?? [])
        .map((r: { comment_id: string | null }) => r.comment_id)
        .filter((x): x is string => !!x)
    )
  );

  let postIdsFromCommentReports: string[] = [];
  if (commentIds.length > 0) {
    // Resolve the parent posts of those comments
    const { data: comments, error: cErr } = await supabase
      .from("forum_comments")
      .select("id, post_id")
      .in("id", commentIds);

    if (cErr) throw cErr;

    postIdsFromCommentReports = Array.from(
      new Set(
        (comments ?? [])
          .map((c: { id: string; post_id: string | null }) => c.post_id)
          .filter((x): x is string => !!x)
      )
    );
  }

  // 3) Union of all affected post ids
  const affectedPostIds = Array.from(
    new Set<string>([
      ...postIdsFromPostReports,
      ...postIdsFromCommentReports,
    ])
  );

  if (affectedPostIds.length === 0) return [];

  // 4) Fetch those posts (not deleted), apply order + range for paging
  const { data: posts, error: postsErr } = await supabase
    .from("forum_posts")
    .select(
      `
      id, title, content, created_at, author_id, tags, status, is_deleted, is_locked,
      forum_reactions(count),
      forum_comments(count)
    `
    )
    .in("id", affectedPostIds)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (postsErr) throw postsErr;

  const rows = (posts ?? []) as ForumPostRow[];
  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const authorMap = await fetchAuthorsPublic(authorIds);
  return rows.map((r) => mapToUi(r, authorMap.get(r.author_id)));
}

/** Approval Queue = Pending & not deleted */
async function fetchApprovalQueue(limit = 20, offset = 0): Promise<UiForumPost[]> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(
      `
      id, title, content, created_at, author_id, tags, status, is_deleted, is_locked,
      forum_reactions(count),
      forum_comments(count)
    `
    )
    .eq("status", "Pending")
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const rows = (data ?? []) as ForumPostRow[];
  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const authorMap = await fetchAuthorsPublic(authorIds);
  return rows.map((r) => mapToUi(r, authorMap.get(r.author_id)));
}

/** Archive = Dismissed OR is_deleted = true */
async function fetchArchivedPosts(limit = 20, offset = 0): Promise<UiForumPost[]> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(
      `
      id, title, content, created_at, author_id, tags, status, is_deleted, is_locked,
      forum_reactions(count),
      forum_comments(count)
    `
    )
    .or("status.eq.Dismissed,is_deleted.eq.true")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const rows = (data ?? []) as ForumPostRow[];
  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const authorMap = await fetchAuthorsPublic(authorIds);
  return rows.map((r) => mapToUi(r, authorMap.get(r.author_id)));
}

/** Comments for Post (typed) */
export async function fetchCommentsForPost(postId: string): Promise<UiComment[]> {
  const { data, error } = await supabase
    .from("forum_comments")
    .select(`id, content, created_at, author_id`)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows: CommentRow[] = (data ?? []) as CommentRow[];

  // Authors
  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  let authorMap = new Map<string, AuthorPublic>();
  if (authorIds.length) {
    const { data: authors, error: aerr } = await supabase.rpc("get_forum_author_public", {
      author_ids: authorIds,
    });
    if (aerr) {
      console.warn("[Forum] get_forum_author_public error:", aerr);
    } else {
      const list = (authors as AuthorPublic[]) ?? [];
      authorMap = new Map(list.map((a) => [a.id, a]));
    }
  }

  return rows.map((r) => {
    const a = authorMap.get(r.author_id);
    return {
      id: r.id,
      content: r.content,
      date: r.created_at ? new Date(r.created_at).toLocaleString() : "",
      likes: 0,
      author: {
        id: r.author_id,
        name: `${a?.first_name ?? "Anonymous"} ${a?.last_name ?? "Patient"}`.trim(),
        profilePic: a?.profile_avatar_url ?? "/images/mother.png",
      },
    };
  });
}

/* ---------------- Page ---------------- */
export default function ForumPage() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "All Posts" | "Reported Posts & Comments" | "Approval Queue" | "Archive"
  >("All Posts");

  // Data sets
  const [forumPosts, setForumPosts] = useState<UiForumPost[]>([]);
  const [reportedPosts, setReportedPosts] = useState<UiForumPost[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<UiForumPost[]>([]);
  const [archivedPosts, setArchivedPosts] = useState<UiForumPost[]>([]);

  // Loading/error
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // Detail view selection + comments loading
  const [selectedPost, setSelectedPost] = useState<UiForumPost | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);

  /** -------- Mutations (with notifications) -------- */

  // Approve -> notify author
  const approvePost = useCallback(
    async (postId: string) => {
      const { data, error } = await supabase
        .from("forum_posts")
        .update({ status: "Approved" })
        .eq("id", postId)
        .select("id, status, author_id, title")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Approve failed: no matching row was updated (check RLS).");

      const titleText = data.title ? `“${data.title}”` : "your forum post";
      await sendForumNotification({
        recipientId: data.author_id,
        triggeredBy: user?.id,
        postId: data.id,
        title: "Your forum post was approved",
        message: `Good news! Your forum post ${titleText} has been approved and is now visible to the community.`,
      });
    },
    [user?.id]
  );

  // Dismiss -> notify author (+ optional moderation log)
  const dismissPost = useCallback(
    async (postId: string, reasons?: string[]) => {
      const { data, error } = await supabase
        .from("forum_posts")
        .update({ status: "Dismissed" })
        .eq("id", postId)
        .select("id, status, author_id, title")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Dismiss failed: no matching row was updated (check RLS).");

      if (reasons && reasons.length > 0 && user?.id) {
        const { error: repErr } = await supabase.from("forum_reports").insert({
          reported_by: user.id,
          post_id: postId,
          reason: reasons.join("; "),
          status: "Reviewed",
          reviewed_by: user.id,
        });
        if (repErr) console.warn("[Forum] report insert failed (non-blocking):", repErr);
      }

      const titleText = data.title ? `“${data.title}”` : "your forum post";
      const reasonText = reasons?.length ? ` Reason: ${reasons.join("; ")}.` : "";
      await sendForumNotification({
        recipientId: data.author_id,
        triggeredBy: user?.id,
        postId: data.id,
        title: "Your forum post was dismissed",
        message: `Hi! Your forum post ${titleText} was dismissed by our moderators.${reasonText} If you believe this is a mistake, you may revise and resubmit.`,
      });
    },
    [user?.id]
  );

  // Archive/Remove -> notify author
  const archivePost = useCallback(
    async (postId: string, reasons?: string[]) => {
      const { data, error } = await supabase
        .from("forum_posts")
        .update({ is_deleted: true })
        .eq("id", postId)
        .select("id, author_id, title, status, is_deleted")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Archive failed: no matching row was updated (check RLS).");

      if (reasons && reasons.length > 0 && user?.id) {
        const { error: repErr } = await supabase.from("forum_reports").insert({
          reported_by: user.id,
          post_id: postId,
          reason: reasons.join("; "),
          status: "Reviewed",
          reviewed_by: user.id,
        });
        if (repErr) console.warn("[Forum] archive log insert failed (non-blocking):", repErr);
      }

      const titleText = data.title ? `“${data.title}”` : "your forum post";
      const reasonText = reasons?.length ? ` Reason: ${reasons.join("; ")}.` : "";
      await sendForumNotification({
        recipientId: data.author_id,
        triggeredBy: user?.id,
        postId: data.id,
        title: "Your forum post was removed",
        message: `Hello. Your forum post ${titleText} has been removed from the forum.${reasonText}`,
      });
    },
    [user?.id]
  );

  /** -------- Data loading helpers -------- */
  const loadAllCounts = useCallback(async () => {
    const [all, rep, appr, arch] = await Promise.all([
      fetchApprovedPosts(10, 0),
      fetchReportedPosts(10, 0),
      fetchApprovalQueue(10, 0),
      fetchArchivedPosts(10, 0),
    ]);
    setForumPosts(all);
    setReportedPosts(rep);
    setApprovalQueue(appr);
    setArchivedPosts(arch);
  }, []);

  const loadActiveTab = useCallback(
    async (tab = activeTab) => {
      setLoading(true);
      setErr(null);
      try {
        if (tab === "All Posts") {
          const data = await fetchApprovedPosts(20, 0);
          setForumPosts(data);
        } else if (tab === "Reported Posts & Comments") {
          const data = await fetchReportedPosts(20, 0);
          setReportedPosts(data);
        } else if (tab === "Approval Queue") {
          const data = await fetchApprovalQueue(20, 0);
          setApprovalQueue(data);
        } else if (tab === "Archive") {
          const data = await fetchArchivedPosts(20, 0);
          setArchivedPosts(data);
        }
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Failed to load forum data");
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  // Initial load
  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        await loadAllCounts();
        await loadActiveTab("All Posts");
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load forum data");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // When tab changes, load that tab’s list
  useEffect(() => {
    if (authLoading) return;
    setSelectedPost(null);
    loadActiveTab(activeTab);
  }, [activeTab, loadActiveTab, authLoading]);

  // Realtime: refresh when forum_posts, forum_reports (and optionally forum_comments) change
  useEffect(() => {
    const channel = supabase
      .channel("forum_admin_dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_posts" },
        () => {
          loadAllCounts();
          loadActiveTab(activeTab);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_reports" },
        () => {
          loadAllCounts();
          if (activeTab === "Reported Posts & Comments") {
            loadActiveTab(activeTab);
          }
        }
      )
      // Optional: if you want automatic refresh when comments themselves change
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_comments" },
        () => {
          if (activeTab === "Reported Posts & Comments") {
            loadAllCounts();
            loadActiveTab(activeTab);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, loadAllCounts, loadActiveTab]);

  /** -------- Handlers (optimistic + refetch) -------- */

  const handleViewPost = async (post: UiForumPost) => {
    setSelectedPost({ ...post, commentsList: [] });
    setCommentsLoading(true);
    try {
      const cs: UiComment[] = await fetchCommentsForPost(post.id);
      setSelectedPost((prev) => (prev ? { ...prev, commentsList: cs } : prev));
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleBackToList = () => setSelectedPost(null);

  const handleRemovePost = async (postId: string, reasons?: string[]) => {
    setReportedPosts((curr) => curr.filter((p) => p.id !== postId));
    try {
      await archivePost(postId, reasons);
    } catch (e) {
      console.error(e);
    } finally {
      await Promise.all([loadActiveTab("Reported Posts & Comments"), loadActiveTab("Archive")]);
      await loadAllCounts();
    }
  };

  const handleApprovePost = async (postId: string) => {
    setApprovalQueue((curr) => curr.filter((p) => p.id !== postId));
    try {
      await approvePost(postId);
    } catch (e) {
      console.error(e);
    } finally {
      await Promise.all([loadActiveTab("Approval Queue"), loadActiveTab("All Posts")]);
      await loadAllCounts();
    }
  };

  const handleDismissPost = async (postId: string, reasons?: string[]) => {
    setApprovalQueue((curr) => curr.filter((p) => p.id !== postId));
    try {
      await dismissPost(postId, reasons);
    } catch (e) {
      console.error(e);
    } finally {
      await Promise.all([loadActiveTab("Approval Queue"), loadActiveTab("Archive")]);
      await loadAllCounts();
    }
  };

  /** -------- Derived counters for header -------- */
  const headerCounts = useMemo(
    () => ({
      totalPosts: forumPosts.length,
      pendingApproval: approvalQueue.length,
      pendingReports: reportedPosts.length,
    }),
    [forumPosts.length, approvalQueue.length, reportedPosts.length]
  );

  /** -------- Render tab content -------- */
  const renderContent = () => {
    if (authLoading) return <div>Checking session…</div>;
    if (err) return <div className="text-red-600 text-sm">Error: {err}</div>;
    if (loading) return <div>Loading…</div>;

    switch (activeTab) {
      case "All Posts":
        return <AllPostsTab posts={forumPosts} onViewPost={handleViewPost} />;

      case "Reported Posts & Comments":
        return (
          <ReportedPostsTab
            posts={reportedPosts}
            onRemovePost={(id: string | number, reasons: string[]) =>
              handleRemovePost(String(id), reasons)
            }
            onViewPost={handleViewPost}
          />
        );

      case "Approval Queue":
        return (
          <ApprovalQueueTab
            posts={approvalQueue}
            onApprovePost={(id: string | number) => handleApprovePost(String(id))}
            onDismissPost={(id: string | number, reasons: string[]) =>
              handleDismissPost(String(id), reasons)
            }
            onViewPost={handleViewPost}
          />
        );

      case "Archive":
        return <ArchiveTab posts={archivedPosts} onViewPost={handleViewPost} />;

      default:
        return <AllPostsTab posts={forumPosts} onViewPost={handleViewPost} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <SidebarComponents />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-6">
            {selectedPost ? (
              <PostDetailView
                post={selectedPost}
                onBack={handleBackToList}
                loading={commentsLoading}
              />
            ) : (
              <>
                <ForumHeader
                  totalPosts={headerCounts.totalPosts}
                  pendingApproval={headerCounts.pendingApproval}
                  pendingReports={headerCounts.pendingReports}
                />

                <ForumTabs
                  activeTab={activeTab}
                  setActiveTab={(t: string) =>
                    setActiveTab(
                      (t as
                        | "All Posts"
                        | "Reported Posts & Comments"
                        | "Approval Queue"
                        | "Archive") ?? "All Posts"
                    )
                  }
                />

                <div className="mt-4">{renderContent()}</div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
