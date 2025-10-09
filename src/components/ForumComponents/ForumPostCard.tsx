import React, { useState } from "react";
import { Icon } from "@iconify/react";
import type { UiForumPost, ModerationStatus } from "@/components/types/forum";
import { supabase } from "@/lib/supabaseClient";

import ReviewPostModal from "../modals/ReviewPost";
import KeepPostModal from "../modals/KeepPost";
import RemovePostModal from "../modals/RemovePost";
import ReasonForRemovalModal from "../modals/ReasonforRemoval";
import ApprovePostModal from "../modals/ApprovePost";
import DismissPostModal from "../modals/DismissPost";

interface ForumPostCardProps {
  post: UiForumPost;
  /** Reported tab: archive/remove */
  onRemove?: (postId: string, reasons: string[]) => void;
  /** Approval queue context */
  isApprovalQueue?: boolean;
  /** Optional: parent can refresh lists AFTER DB success (no DB call here) */
  onApprove?: (postId: string) => void | Promise<void>;
  onDismiss?: (postId: string, reasons: string[]) => void | Promise<void>;
  onViewPost?: (post: UiForumPost) => void;
  isDetailView?: boolean;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  onRemove,
  isApprovalQueue = false,
  onApprove,
  onDismiss,
  onViewPost,
  isDetailView = false,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ModerationStatus | undefined>(post.status);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isKeepModalOpen, setIsKeepModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);

  const [busy, setBusy] = useState(false);
  const [actionTaken, setActionTaken] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  /* ---------------- UI Helpers ---------------- */
  const getStatusPillClasses = (status?: ModerationStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Under Review":
        return "bg-orange-100 text-orange-800";
      case "Retained":
        return "bg-green-100 text-green-800";
      case "Removed":
        return "bg-red-100 text-red-800";
      case "Posted":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // If we’re in the approval queue and an action was taken, show “Approved/Dismissed”
  const getStatusLabel = (status?: ModerationStatus) => {
    if (isApprovalQueue && actionTaken) {
      if (status === "Posted") return "Approved";
      if (status === "Removed") return "Dismissed";
    }
    return status ?? "Posted";
  };

  const shouldShowPill =
    isApprovalQueue ? actionTaken : !!currentStatus && currentStatus !== "Posted";

  /* ---------------- Reported tab local-only actions ---------------- */
  const handleReviewConfirm = () => {
    setCurrentStatus("Under Review");
    setIsReviewModalOpen(false);
  };

  const handleKeepConfirm = () => {
    setCurrentStatus("Retained");
    setIsKeepModalOpen(false);
  };

  const handleInitialRemoveConfirm = () => {
    setIsRemoveModalOpen(false);
    setIsReasonModalOpen(true);
  };

  const handleFinalRemoveConfirm = (reasons: string[]) => {
    onRemove?.(post.id, reasons);
    setIsReasonModalOpen(false);
    setCurrentStatus("Removed");
  };

  /* ---------------- Approval Queue: DB-wired actions ---------------- */
  const approveInDb = async (postId: string) => {
    const { error } = await supabase
      .from("forum_posts")
      .update({ status: "Approved" })
      .eq("id", postId)
      .eq("status", "Pending");
    if (error) throw error;
  };

  const dismissInDb = async (postId: string, reasons?: string[]) => {
    const { error } = await supabase
      .from("forum_posts")
      .update({ status: "Dismissed" })
      .eq("id", postId)
      .eq("status", "Pending");
    if (error) throw error;

    // Optional: log a moderation record (non-blocking)
    if (reasons && reasons.length > 0) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const me = authData?.user?.id ?? null;
        const { error: repErr } = await supabase.from("forum_reports").insert({
          reported_by: me,
          post_id: postId,
          reason: reasons.join("; "),
          status: "Reviewed",
          reviewed_by: me,
        });
        if (repErr) console.warn("[ForumPostCard] report log failed:", repErr);
      } catch (e) {
        console.warn("[ForumPostCard] report log skipped:", e);
      }
    }
  };

  const handleApproveConfirm = async () => {
    setErrMsg(null);
    setBusy(true);
    try {
      await approveInDb(post.id);           // 🔌 DB write
      setCurrentStatus("Posted");           // UI reflect → Approved
      setActionTaken(true);
      // optional parent refresh AFTER DB success
      await Promise.resolve(onApprove?.(post.id));
    } catch (e: any) {
      console.error(e);
      setErrMsg(e?.message ?? "Failed to approve post");
    } finally {
      setIsApproveModalOpen(false);
      setBusy(false);
    }
  };

  const handleDismissConfirm = async (reasons: string[]) => {
    setErrMsg(null);
    setBusy(true);
    try {
      await dismissInDb(post.id, reasons);  // 🔌 DB write
      setCurrentStatus("Removed");          // UI reflect → Dismissed
      setActionTaken(true);
      // optional parent refresh AFTER DB success
      await Promise.resolve(onDismiss?.(post.id, reasons));
    } catch (e: any) {
      console.error(e);
      setErrMsg(e?.message ?? "Failed to dismiss post");
    } finally {
      setIsDismissModalOpen(false);
      setBusy(false);
    }
  };

  /* ---------------- Click wrappers ---------------- */
  const handleCardClick = () => {
    if (!isDetailView && onViewPost) onViewPost(post);
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    if (!busy) action();
  };

  return (
    <>
      <div
        className={`bg-white px-4 py-6 border-b border-gray-200 ${
          !isDetailView ? "cursor-pointer hover:bg-gray-50" : ""
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-start space-x-4">
          <img
            src={post.author.profilePic}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{post.author.name}</p>
                <p className="text-sm text-gray-500">
                  {isApprovalQueue ? `Submitted ${post.date}` : `Posted on ${post.date}`}
                </p>
              </div>

              {shouldShowPill && (
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusPillClasses(
                    currentStatus
                  )}`}
                >
                  {getStatusLabel(currentStatus)}
                </span>
              )}
            </div>

            {errMsg && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                {errMsg}
              </div>
            )}

            {post.replyTo && !isApprovalQueue && (
              <p className="mt-3 text-sm text-gray-500">
                <Icon icon="mdi:reply" className="inline-block mr-1" />
                Replied to{" "}
                <span className="font-semibold text-blue-600">{post.replyTo}'s</span> post
              </p>
            )}

            <p className="mt-4 text-gray-700 leading-relaxed">{post.content}</p>

            <div
              className={`mt-4 flex ${
                isApprovalQueue ? "justify-start" : "justify-between"
              } items-center`}
            >
              <div className="flex flex-wrap gap-2">
                {currentStatus === "Removed" && post.reportedBy ? (
                  post.reportedBy.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      {reason}
                    </span>
                  ))
                ) : (
                  post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>

              {!isApprovalQueue && (
                <div className="flex items-center space-x-6 text-gray-500 text-sm">
                  <div className="flex items-center space-x-1.5">
                    <Icon icon="healthicons:heart-outline-24px" className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Icon icon="fluent:comment-16-regular" className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              )}
            </div>

            {isApprovalQueue && !actionTaken && (
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={(e) => handleButtonClick(e, () => setIsApproveModalOpen(true))}
                  disabled={busy}
                  className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium ${
                    busy
                      ? "bg-green-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <Icon icon="feather:check" className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={(e) => handleButtonClick(e, () => setIsDismissModalOpen(true))}
                  disabled={busy}
                  className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium ${
                    busy
                      ? "bg-red-400 text-white cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <Icon icon="feather:x" className="h-4 w-4" />
                  <span>Dismiss</span>
                </button>
              </div>
            )}

            {post.reportedBy && currentStatus !== "Removed" && !isApprovalQueue && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-sm">
                    <Icon icon="mdi:flag" className="text-red-500 h-5 w-5" />
                    <span className="text-red-600 font-medium">
                      Reported by {post.reportedBy.count}{" "}
                      {post.reportedBy.count === 1 ? "user" : "users"}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        post.reportedBy.severity === "Low"
                          ? "bg-yellow-200 text-yellow-800"
                          : post.reportedBy.severity === "Medium"
                          ? "bg-orange-200 text-orange-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {post.reportedBy.severity}
                    </span>
                    {post.reportedBy.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    {currentStatus === "Pending" && (
                      <button
                        onClick={(e) => handleButtonClick(e, () => setIsReviewModalOpen(true))}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-200 text-sm font-medium"
                      >
                        <Icon icon="feather:eye" className="h-4 w-4" />
                        <span>Review</span>
                      </button>
                    )}

                    {currentStatus === "Under Review" && (
                      <>
                        <button
                          onClick={(e) => handleButtonClick(e, () => setIsKeepModalOpen(true))}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                          <Icon icon="feather:check" className="h-4 w-4" />
                          <span>Keep</span>
                        </button>
                        <button
                          onClick={(e) => handleButtonClick(e, () => setIsRemoveModalOpen(true))}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 text-sm font-medium"
                        >
                          <Icon icon="feather:x" className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </>
                    )}

                    {currentStatus === "Retained" && (
                      <button
                        onClick={(e) => handleButtonClick(e, () => setIsRemoveModalOpen(true))}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 text-sm font-medium"
                      >
                        <Icon icon="feather:x" className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReviewPostModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleReviewConfirm}
      />
      <KeepPostModal
        isOpen={isKeepModalOpen}
        onClose={() => setIsKeepModalOpen(false)}
        onConfirm={handleKeepConfirm}
      />
      <RemovePostModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleInitialRemoveConfirm}
      />
      <ReasonForRemovalModal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        onConfirm={handleFinalRemoveConfirm}
      />
      <ApprovePostModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
      />
      <DismissPostModal
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        onConfirm={handleDismissConfirm}
      />
    </>
  );
};

export default ForumPostCard;
