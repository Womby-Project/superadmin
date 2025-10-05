import { supabase } from "@/lib/supabaseClient";

export type Article = {
  id: string;
  title: string;
  link: string;
  thumbnail_url: string | null;
  excerpt: string | null;
  author: string | null;
  published_at: string | null;
  source: string | null;
  created_at: string | null;
  status: "Posted" | "Draft" | "Archived";
};

/** Resolve article thumbnail or fallback */
export const resolveArticleImage = (url?: string | null): string => {
  if (!url) {
    return "https://placehold.co/80x80/EFEFEF/333333?text=Article";
  }
  if (/^https?:\/\//i.test(url)) return url;

  // Example: if storing in a bucket called "article_thumbnails"
  const { data } = supabase.storage.from("article_thumbnails").getPublicUrl(url);
  return data?.publicUrl ?? "https://placehold.co/80x80/EFEFEF/333333?text=Article";
};

/** Fetch recent posted articles */
export async function fetchRecentArticles(limit = 5, offset = 0) {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, link, thumbnail_url, excerpt, author, published_at, source, created_at, status"
    )
    .eq("status", "Posted")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []) as Article[];
}
