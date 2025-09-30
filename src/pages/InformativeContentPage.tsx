import React, { useState, useEffect } from "react";
import SidebarComponents from "../components/SidebarComponents";
import Header from "../components/HeaderComponent";
import InformativeContentHeader from "../components/InformativeContentComponents/InformativeContentHeader";
import ContentFilter from "../components/InformativeContentComponents/ContentFilter";
import ContentCard, { type Article } from "../components/InformativeContentComponents/ArticleCard";
import ArticleDetailView from "@/components/InformativeContentComponents/ArticleView";
import { supabase } from "@/lib/supabaseClient";
import { toast, Toaster } from "sonner"; // ✅ toast for notifications

// Map Supabase row -> ArticleCard type
function mapArticle(row: any): Article {
  const normalizedStatus = row.status
    ? row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase()
    : "Draft";

  return {
    id: row.id,
    image: row.thumbnail_url || "/placeholder.png",
    title: row.title,
    status: normalizedStatus as "Posted" | "Draft" | "Archived",  // ✅ always consistent
    description: row.excerpt || "",
    publishedDate: row.published_at
      ? new Date(row.published_at).toLocaleDateString()
      : "Unpublished",
    source: row.source || "Unknown",
    fetchedDate: row.created_at
      ? new Date(row.created_at).toLocaleDateString()
      : "",
    body: row.body || "",
    author: row.author || "Unknown",
  };
}


export default function InformativeContentPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // --- Fetch Articles ---
  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error.message);
      toast.error("Failed to fetch articles");
      setArticles([]);
    } else {
      setArticles(data.map(mapArticle));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // --- Add Article Handler ---
  const handleAddArticle = async (url: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-article`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errText}`);
      }

      const data = await res.json();

      if (data.article) {
        // Optimistic update
        setArticles((prev) => [mapArticle(data.article), ...prev]);
        toast.success("Article added to draft successfully!");
      }

    } catch (err) {
      console.error("Error adding article:", err);
      toast.error("Failed to add article. Please try again.");
    }
  };

  // --- Handlers ---
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };


  const handleStatusChange = (id: string, newStatus: 'Posted' | 'Draft' | 'Archived') => {
    setArticles(prev =>
      prev.map(article =>
        article.id === id ? { ...article, status: newStatus } : article
      )
    );
  };


  const filteredArticles = articles.filter((article) => {
    const matchesFilter = activeFilter === "All" ? true : article.status === activeFilter;
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // --- Update counts dynamically based on normalized statuses
  const counts = {
    All: articles.length,
    Posted: articles.filter(a => a.status === 'Posted').length,
    Draft: articles.filter(a => a.status === 'Draft').length,
    Archived: articles.filter(a => a.status === 'Archived').length,
  };



  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Toaster richColors position="top-right" />
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <SidebarComponents />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-6">
            {selectedArticle ? (
              <ArticleDetailView
                article={selectedArticle}
                onBack={handleBackToList}
              />
            ) : (
              <>
                {/* ✅ now handleAddArticle exists */}
                <InformativeContentHeader
                  search={search}
                  setSearch={setSearch}
                  onAdd={handleAddArticle}
                />

                <ContentFilter
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  counts={counts}
                />

                {loading ? (
                  <p className="text-center text-gray-500">
                    Loading articles...
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article, index) => (
                      <ContentCard
                        key={index}
                        article={article}
                        onView={handleViewArticle}
                        onStatusChange={handleStatusChange}
                      />

                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
