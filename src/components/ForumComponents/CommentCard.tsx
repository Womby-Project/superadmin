import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { type Comment } from '../../lib/ForumPost';

interface CommentCardProps {
  comment: Comment;
  // In a real app, you would pass handlers from the parent to manage state
  // onKeepComment: (commentId: number) => void;
  // onRemoveComment: (commentId: number) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  // State to manage the UI's status (Pending, Under Review, etc.)
  const [currentStatus, setCurrentStatus] = useState(comment.status);

  // --- Mock Handlers for UI demonstration ---
  // In a real app, these would call props to update the parent's state.
  const handleKeep = () => setCurrentStatus('Retained');
  const handleRemove = () => setCurrentStatus('Removed'); // Hides the component

  // Helper to get styling for status pills
  const getStatusPill = (status: Comment['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-orange-100 text-orange-800';
      case 'Retained': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // If removed, don't render the card
  if (currentStatus === 'Removed') {
    return null;
  }

  return (
    <div className="flex items-start space-x-4 py-4 border-t">
      <img src={comment.author.profilePic} alt={comment.author.name} className="w-9 h-9 rounded-full" />
      <div className="flex-1">
        {/* Top Section: Author Info and Status Pill */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{comment.author.name}</p>
            <p className="text-xs text-gray-500">{comment.date}</p>
          </div>
          {comment.reportedBy && currentStatus !== 'Posted' && (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusPill(currentStatus)}`}>
              {currentStatus}
            </span>
          )}
        </div>

        {/* Comment Content */}
        <p className="mt-2 text-gray-700 text-sm leading-relaxed">{comment.content}</p>

        {/* Bottom Section: Likes, Report Info, and Actions */}
{/* Bottom Section: Likes, Report Info, and Actions */}
<div className="mt-3">
  {/* Likes */}
  <div className="flex items-center space-x-1.5 text-sm text-gray-500">
    <Icon icon="mdi:heart-outline" className="h-4 w-4" />
    <span>{comment.likes}</span>
  </div>

  {comment.reportedBy && (
    <div className="mt-3 flex justify-between items-start">
      {/* Report Info */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-sm">
        <Icon icon="mdi:flag" className="text-red-500 h-5 w-5" />
        <span className="text-red-600 font-medium">
          Reported by {comment.reportedBy.count} users
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

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {currentStatus !== "Retained" && (
          <button
            onClick={handleKeep}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 text-sm font-medium"
          >
            <Icon icon="feather:check" className="h-4 w-4" />
            <span>Keep</span>
          </button>
        )}
        <button
          onClick={handleRemove}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 text-sm font-medium"
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