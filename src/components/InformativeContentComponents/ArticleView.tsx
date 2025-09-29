import React from 'react';
import { Icon } from '@iconify/react';
import { type Article } from './ArticleCard';

interface ArticleDetailViewProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ article, onBack }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
        <Icon icon="feather:arrow-left" className="mr-2 h-4 w-4" />
        Back to Library
      </button>

      {/* Article Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
        <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-1">
          <span>By Dr. Sara Johnson</span>
          <span className="text-gray-300">|</span>
          <span><strong>Source:</strong> {article.source}</span>
          <span className="text-gray-300">|</span>
          <span><strong>Published:</strong> {article.publishedDate}</span>
           <span className="text-gray-300">|</span>
          <span><strong>Fetched:</strong> {article.fetchedDate}</span>
        </div>
      </div>
      
      {/* --- REVISED ACTION BUTTONS SECTION --- */}
      <div className="flex justify-end items-center gap-2 mb-4">
        {/* If status is 'Posted', show "Archive" button */}
        {article.status === 'Posted' && (
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200">
            <Icon icon="ri:archive-line" className="w-4 h-4" />
            <span>Archive</span>
          </button>
        )}
        
        {/* If status is 'Draft', show "Post" button */}
        {article.status === 'Draft' && (
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 border border-red-200">
            <Icon icon="mdi:upload" className="w-4 h-4" />
            <span>Post</span>
          </button>
        )}
        
        {/* If status is 'Archived', no action buttons are shown */}
      </div>

      {/* Main Image */}
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-auto max-h-96 object-cover rounded-lg mb-6"
      />

      {/* Article Body */}
      <div className="prose max-w-none text-gray-700">
        <p>{article.description}</p>
        <p>Pellentesque sodales in sapien quis auctor. In et laoreet quam. In quis quam et ex pellentesque egestas. Curabitur et nunc egestas, congue tellus nec, tincidunt nulla. Donec gravida, purus nec maximus feugiat, felis urna commodo quam, et tempor enim ex eget magna. Sed sed nunc et ex fringilla consequat.</p>
        <p>Nullam eu tellus pellentesque, hendrerit mauris et, viverra lacus. Duis ac auctor nisi. Integer eget est non leo viverra pharetra. Praesent vitae odio et ipsum semper malesuada. Sed ut finibus odio, et varius sem.</p>
      </div>

      {/* Source & Copyright */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
        <h4 className="font-semibold text-gray-800 mb-2">Source & Copyright</h4>
        <p className="text-gray-600 mb-3">This article was originally published by <strong>{article.source}</strong>. Content has been adapted for educational purposes.</p>
        <a href="#" className="flex items-center text-red-600 font-medium hover:underline">
          Read original article
          <Icon icon="feather:arrow-right" className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default ArticleDetailView;