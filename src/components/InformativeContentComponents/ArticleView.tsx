import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabaseClient";
import { type Article } from "./ArticleCard";

interface ArticleDetailViewProps {
  article: Article;
  onBack: () => void;
  onStatusChange?: (id: string, newStatus: "Posted" | "Draft" | "Archived") => void;
}

const statusStyles = {
  Posted: "bg-green-100 text-green-800",
  Archived: "bg-gray-100 text-gray-800",
  Draft: "bg-yellow-100 text-yellow-800",
};

function cleanArticleBody(body: string): string {
  if (!body) return "";
  let next = body.replace(/<img([^>]+)src="\/([^"]+)"/g, `<img$1src="https://www.parenteam.com.ph/$2"`);
  next = next.replace(/<img([^>]+)data-src="([^"]+)"([^>]*)>/g, `<img$1src="$2"$3>`);
  next = next.replace(/loading="lazy"/g, "");
  return next;
}

const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ article, onBack, onStatusChange }) => {
  const [viewsCount, setViewsCount] = useState<number>(article.viewsCount ?? 0);
  const [updating, setUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState<Article["status"]>(article.status);

  useEffect(() => {
    setLocalStatus(article.status);
  }, [article.status]);

  useEffect(() => {
    const record = async () => {
      if (!article?.id) return;
      const { error } = await supabase.rpc("record_article_view", { p_article_id: article.id });
      if (!error) {
        const { data, error: fetchErr } = await supabase
          .from("articles")
          .select("views_count")
          .eq("id", article.id)
          .single();
        if (!fetchErr && data) setViewsCount(data.views_count ?? viewsCount);
      }
    };
    record();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  const updateStatus = async (newStatus: "Posted" | "Archived") => {
    if (!article?.id) return;
    try {
      setUpdating(true);
      const { error } = await supabase.from("articles").update({ status: newStatus }).eq("id", article.id);
      if (error) throw error;

      setLocalStatus(newStatus);
      onStatusChange?.(article.id, newStatus);
    } catch (err) {
      console.error("Error updating article status:", err);
    } finally {
      setUpdating(false);
    }
  };

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
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex-1">
            {article.title}
          </h1>

          {/* Views */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Icon icon="uil:statistics" className="w-5 h-5" />
            <span className="font-medium">{viewsCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Status Badge */}
        {localStatus && (
          <div className="mt-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                statusStyles[localStatus]
              }`}
            >
              {localStatus}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-1 mt-2">
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
        {localStatus === "Posted" && (
          <button
            onClick={() => updateStatus("Archived")}
            disabled={updating}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200 disabled:opacity-50"
          >
            <Icon icon="ri:archive-line" className="w-4 h-4" />
            <span>{updating ? "Archiving..." : "Archive"}</span>
          </button>
        )}
        {localStatus === "Draft" && (
          <button
            onClick={() => updateStatus("Posted")}
            disabled={updating}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-green-600 rounded-md hover:bg-green-50 border border-green-200 disabled:opacity-50"
          >
            <Icon icon="mdi:upload" className="w-4 h-4" />
            <span>{updating ? "Posting..." : "Post"}</span>
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
        <h4 className="font-semibold text-gray-800 mb-2">Source & Copyright</h4>
        <p className="text-gray-600 mb-3">
          This article was originally published by <strong>{article.source}</strong>. Content has been adapted for
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
