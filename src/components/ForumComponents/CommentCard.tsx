import React, { useState } from "react";
import { Icon } from "@iconify/react";
import type { UiComment, ModerationStatus } from "@/components/types/forum";

interface CommentCardProps {
  comment: UiComment;
  onKeepComment?: (commentId: string) => Promise<void> | void;
  onRemoveComment?: (commentId: string) => Promise<void> | void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onKeepComment,
  onRemoveComment,
}) => {
  // Start from server-derived status; allow optimistic updates
  const [currentStatus, setCurrentStatus] = useState<ModerationStatus | undefined>(
    comment.status
  );
  const [processing, setProcessing] = useState(false);

  const handleKeep = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      setCurrentStatus("Retained");
      await onKeepComment?.(comment.id);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      setCurrentStatus("Removed");
      await onRemoveComment?.(comment.id);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusPill = (status?: ModerationStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Under Review":
        return "bg-orange-100 text-orange-800";
      case "Retained":
        return "bg-green-100 text-green-800";
      case "Removed":
        return "bg-gray-200 text-gray-700";
      case "Posted":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // If removed, hide the card
  if (currentStatus === "Removed") return null;

  return (
    <div className="flex items-start space-x-4 py-4 border-t">
      <img
        src={comment.author.profilePic}
        alt={comment.author.name}
        className="w-9 h-9 rounded-full object-cover"
      />
      <div className="flex-1">
        {/* Top: author + status */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{comment.author.name}</p>
            <p className="text-xs text-gray-500">{comment.date}</p>
          </div>

          {/* Show pill if there are reports or non-Posted status */}
          {(comment.reportedBy || currentStatus !== "Posted") && currentStatus && (
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusPill(
                currentStatus
              )}`}
            >
              {currentStatus}
            </span>
          )}
        </div>

        {/* Content */}
        <p className="mt-2 text-gray-700 text-sm leading-relaxed">{comment.content}</p>

        {/* Bottom: likes, report info, actions */}
        <div className="mt-3">
          {/* Likes */}
          <div className="flex items-center space-x-1.5 text-sm text-gray-500">
            <Icon icon="mdi:heart-outline" className="h-4 w-4" />
            <span>{comment.likes}</span>
          </div>

          {comment.reportedBy && (
            <div className="mt-3 flex justify-between items-start">
              {/* Report info */}
              <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-sm">
                <Icon icon="mdi:flag" className="text-red-500 h-5 w-5" />
                <span className="text-red-600 font-medium">
                  Reported by {comment.reportedBy.count}{" "}
                  {comment.reportedBy.count === 1 ? "user" : "users"}
                </span>
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                    comment.reportedBy.severity === "Low"
                      ? "bg-yellow-200 text-yellow-800"
                      : comment.reportedBy.severity === "Medium"
                      ? "bg-orange-200 text-orange-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {comment.reportedBy.severity}
                </span>
                {comment.reportedBy.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    {reason}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {currentStatus !== "Retained" && (
                  <button
                    onClick={handleKeep}
                    disabled={processing}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                  >
                    <Icon icon="feather:check" className="h-4 w-4" />
                    <span>Keep</span>
                  </button>
                )}
                <button
                  onClick={handleRemove}
                  disabled={processing}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                >
                  <Icon icon="feather:x" className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
