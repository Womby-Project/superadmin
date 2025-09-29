import React, { useState } from 'react';
import SidebarComponents from '../components/SidebarComponents';
import Header from '../components/HeaderComponent';
import ForumHeader from '../components/ForumComponents/ForumHeader';
import ForumTabs from '../components/ForumComponents/ForumTabs';
import AllPostsTab from '../components/ForumComponents/AllPostTab';
import ReportedPostsTab from '../components/ForumComponents/ReportPostTab';
import ApprovalQueueTab from '../components/ForumComponents/ApprovalQueueTab';
import ArchiveTab from '../components/ForumComponents/ArchiveTab';
import PostDetailView from '../components/ForumComponents/PostDetailView'; 
import { 
  forumPosts as initialForumPosts,
  reportedPosts as initialReportedPosts, 
  approvalQueue as initialApprovalQueue,
  archivedPosts as initialArchivedPosts 
} from '../lib/ForumPost';
import { type ForumPost } from '../lib/ForumPost';

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState('All Posts');
  
  const [forumPosts, setForumPosts] = useState(initialForumPosts);
  const [reportedPosts, setReportedPosts] = useState(initialReportedPosts);
  const [approvalQueue, setApprovalQueue] = useState(initialApprovalQueue);
  const [archivedPosts, setArchivedPosts] = useState(initialArchivedPosts);

  // State to manage which post is selected for the detail view
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

  // --- Handlers for State Changes ---

  const handleViewPost = (post: ForumPost) => {
    setSelectedPost(post);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  const handleRemovePost = (postId: number) => {
    const postToMove = reportedPosts.find(p => p.id === postId);
    if (!postToMove) return;
    const updatedPost = { ...postToMove, status: 'Removed' as const };
    setReportedPosts(reportedPosts.filter(p => p.id !== postId));
    setArchivedPosts([updatedPost, ...archivedPosts]);
  };

  const handleApprovePost = (postId: number) => {
    const postToApprove = approvalQueue.find(p => p.id === postId);
    if (!postToApprove) return;
    const approvedPost: ForumPost = { ...postToApprove, status: 'Posted' };
    setApprovalQueue(approvalQueue.filter(p => p.id !== postId));
    setForumPosts([approvedPost, ...forumPosts]);
  };

  const handleDismissPost = (postId: number) => {
    const postToDismiss = approvalQueue.find(p => p.id === postId);
    if (!postToDismiss) return;
    const dismissedPost: ForumPost = { ...postToDismiss, status: 'Removed' };
    setApprovalQueue(approvalQueue.filter(p => p.id !== postId));
    setArchivedPosts([dismissedPost, ...archivedPosts]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'All Posts':
        return <AllPostsTab posts={forumPosts} onViewPost={handleViewPost} />;
      case 'Reported Posts & Comments':
        return <ReportedPostsTab posts={reportedPosts} onRemovePost={handleRemovePost} onViewPost={handleViewPost} />;
      case 'Approval Queue':
        return <ApprovalQueueTab posts={approvalQueue} onApprovePost={handleApprovePost} onDismissPost={handleDismissPost} onViewPost={handleViewPost} />;
      case 'Archive':
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
              // If a post is selected, show the detail view
              <PostDetailView post={selectedPost} onBack={handleBackToList} />
            ) : (
              // Otherwise, show the normal forum list view
              <>
                <ForumHeader 
                  totalPosts={forumPosts.length}
                  pendingApproval={approvalQueue.length}
                  pendingReports={reportedPosts.length}
                />
                <ForumTabs 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab}
                />
                <div className="mt-4">
                  {renderContent()}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}