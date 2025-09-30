import React from "react";
import { Icon } from "@iconify/react";
import { type Article } from "./ArticleCard";

interface ArticleDetailViewProps {
  article: Article;
  onBack: () => void;
}

const statusStyles = {
  Posted: "bg-green-100 text-green-800",
  Archived: "bg-gray-100 text-gray-800",
  Draft: "bg-yellow-100 text-yellow-800",
};


function cleanArticleBody(body: string): string {
  if (!body) return "";

  // 1. Replace relative image URLs with absolute
  body = body.replace(
    /<img([^>]+)src="\/([^"]+)"/g,
    `<img$1src="https://www.parenteam.com.ph/$2"`
  );

  // 2. If there's data-src, replace src with data-src
  body = body.replace(
    /<img([^>]+)data-src="([^"]+)"([^>]*)>/g,
    `<img$1src="$2"$3>`
  );

  // 3. Remove lazy-loading
  body = body.replace(/loading="lazy"/g, "");

  return body;
}


const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  onBack,
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
      >
        <Icon icon="feather:arrow-left" className="mr-2 h-4 w-4" />
        Back to Library
      </button>

      {/* Article Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {article.title}
        </h1>

        {/* Status Badge */}
        {article.status && (
          <div className="mb-3">
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                statusStyles[article.status]
              }`}
            >
              {article.status}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-1">
          {article.author && <span>By {article.author}</span>}
          {article.author && <span className="text-gray-300">|</span>}
          <span>
            <strong>Source:</strong> {article.source}
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <strong>Published:</strong> {article.publishedDate}
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <strong>Fetched:</strong> {article.fetchedDate}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-2 mb-4">
        {article.status === "Posted" && (
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200">
            <Icon icon="ri:archive-line" className="w-4 h-4" />
            <span>Archive</span>
          </button>
        )}
        {article.status === "Draft" && (
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-green-600 rounded-md hover:bg-green-50 border border-green-200">
            <Icon icon="mdi:upload" className="w-4 h-4" />
            <span>Post</span>
          </button>
        )}
      </div>

      {/* Main Image */}
      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-auto max-h-96 object-cover rounded-lg mb-6"
        />
      )}

      {/* Article Body */}
      <div className="prose max-w-none text-gray-700">
        {article.body ? (
          <div dangerouslySetInnerHTML={{ __html: cleanArticleBody(article.body) }} />
        ) : (
          <p>{article.description}</p>
        )}
      </div>

      {/* Source & Copyright */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
        <h4 className="font-semibold text-gray-800 mb-2">
          Source & Copyright
        </h4>
        <p className="text-gray-600 mb-3">
          This article was originally published by{" "}
          <strong>{article.source}</strong>. Content has been adapted for
          educational purposes.
        </p>
        <a
          href="#"
          className="flex items-center text-red-600 font-medium hover:underline"
        >
          Read original article
          <Icon icon="feather:arrow-right" className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default ArticleDetailView;
