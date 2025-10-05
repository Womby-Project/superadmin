import React, { useEffect, useMemo, useState } from "react";
import SidebarComponents from "../components/SidebarComponents";
import Header from "../components/HeaderComponent";
import ForumHeader from "../components/ForumComponents/ForumHeader";
import ForumTabs from "../components/ForumComponents/ForumTabs";
import AllPostsTab from "../components/ForumComponents/AllPostTab";
import ReportedPostsTab from "../components/ForumComponents/ReportPostTab";
import ApprovalQueueTab from "../components/ForumComponents/ApprovalQueueTab";
import ArchiveTab from "../components/ForumComponents/ArchiveTab";
import PostDetailView from "../components/ForumComponents/PostDetailView";

// ✅ Use real data (no mocks)
import {
  fetchPostsPage,
  fetchReportedPosts,
  fetchApprovalQueue,
  fetchArchivedPosts,
  fetchCommentsForPost,            // <-- import comments fetcher
} from "@/components/services/forumService";
import type { UiForumPost, UiComment } from "@/components/types/forum";

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState<
    "All Posts" | "Reported Posts & Comments" | "Approval Queue" | "Archive"
  >("All Posts");

  // Data sets (no mocks)
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

  /** -------- Data loading helpers -------- */
  const loadAllCounts = async () => {
    const [all, rep, appr, arch] = await Promise.all([
      fetchPostsPage(10, 0),
      fetchReportedPosts(10, 0),
      fetchApprovalQueue(10, 0),
      fetchArchivedPosts(10, 0),
    ]);
    setForumPosts(all);
    setReportedPosts(rep);
    setApprovalQueue(appr);
    setArchivedPosts(arch);
  };

  const loadActiveTab = async (tab = activeTab) => {
    setLoading(true);
    setErr(null);
    try {
      if (tab === "All Posts") {
        const data = await fetchPostsPage(20, 0);
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
  };

  // Initial load: header counts + default tab
  useEffect(() => {
    (async () => {
      try {
        await loadAllCounts();
        await loadActiveTab("All Posts");
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load forum data");
      }
    })();
  }, []);

  // When tab changes, load that tab’s list
  useEffect(() => {
    setSelectedPost(null);
    loadActiveTab(activeTab);
  }, [activeTab]);

  /** -------- Handlers (optimistic + refetch) -------- */

  // Open a post: show it immediately, then fetch comments
  const handleViewPost = async (post: UiForumPost) => {
    // render post right away without comments
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

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  // Remove (archive) a reported post
  // Now accepts reasons from the Reported tab
  const handleRemovePost = async (postId: string, reasons?: string[]) => {
    setReportedPosts((curr) => curr.filter((p) => p.id !== postId));
    try {
      // TODO: mutation to set is_deleted = true and optionally persist reasons to forum_reports or an audit log
      // await archivePost(postId, reasons);
    } catch (e) {
      console.error(e);
    } finally {
      await Promise.all([
        loadActiveTab("Reported Posts & Comments"),
        loadActiveTab("Archive"),
      ]);
      await loadAllCounts();
    }
  };

  // Approve a queued post
  const handleApprovePost = async (postId: string) => {
    setApprovalQueue((curr) => curr.filter((p) => p.id !== postId));
    try {
      // TODO: mutation to unlock/resolve reports
      // await approvePost(postId);
    } catch (e) {
      console.error(e);
    } finally {
      await Promise.all([loadActiveTab("Approval Queue"), loadActiveTab("All Posts")]);
      await loadAllCounts();
    }
  };

  // Dismiss (remove) a queued post
  const handleDismissPost = async (postId: string, reasons?: string[]) => {
    setApprovalQueue((curr) => curr.filter((p) => p.id !== postId));
    try {
      // TODO: mutation to set is_deleted = true (optionally save reasons)
      // await dismissPost(postId, reasons);
    } catch (e) {
      console.error(e);
    } finally {
      await Promise.all([loadActiveTab("Approval Queue"), loadActiveTab("Archive")]);
      await loadAllCounts();
    }
  };

  /** -------- Derived counters for header -------- */
  const headerCounts = useMemo(() => {
    return {
      totalPosts: forumPosts.length,
      pendingApproval: approvalQueue.length,
      pendingReports: reportedPosts.length,
    };
  }, [forumPosts.length, approvalQueue.length, reportedPosts.length]);

  /** -------- Render tab content -------- */
  const renderContent = () => {
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
