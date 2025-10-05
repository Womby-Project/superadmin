import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecentArticles, resolveArticleImage, type Article } from "@/components/services/articleService";

export default function InformativeContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRecentArticles(3, 0); // show top 3
        setArticles(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load articles");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Informative Content</h3>
        <Link
          to="/informative-content"
          className="text-sm font-medium text-red-500 hover:text-pink-600"
        >
          View All
        </Link>
      </div>

      {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-sm text-gray-500">No articles available</p>
      ) : (
        <div className="space-y-5">
          {articles.map((article) => (
            <div key={article.id} className="flex items-start space-x-4">
              <img
                className="h-20 w-20 rounded-lg object-cover"
                src={resolveArticleImage(article.thumbnail_url)}
                alt={article.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://placehold.co/80x80/EFEFEF/333333?text=Article";
                }}
              />
              <div className="flex-1">
                <p
                  className="font-semibold text-gray-800 text-sm leading-tight hover:underline cursor-pointer"
                  onClick={() => window.open(article.link, "_blank")}
                >
                  {article.title}
                </p>
                <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
                  <span>
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString()
                      : ""}
                  </span>
                  {article.source && (
                    <>
                      <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                      <span>Source: {article.source}</span>
                    </>
                  )}
                </div>
                {article.excerpt && (
                  <p className="text-xs text-gray-500 mt-2">{article.excerpt}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
