import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import {
  fetchReportedPosts,
  fetchApprovalQueue,
} from "@/components/services/forumService";
import type { UiForumPost } from "@/components/types/forum";

/* === Avatar with initials fallback === */
function AvatarWithFallback({
  src,
  name,
  size = 40,
  className = "",
  fallbackBg = "bg-gray-400",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  fallbackBg?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const [errored, setErrored] = useState(false);

  return src && !errored ? (
    <img
      src={src}
      alt={name}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
      decoding="async"
      loading="lazy"
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${fallbackBg} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </div>
  );
}

export default function ForumPostsReview() {
  const [items, setItems] = useState<UiForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [reported, approval] = await Promise.all([
          fetchReportedPosts(5, 0),
          fetchApprovalQueue(5, 0),
        ]);

        const map = new Map<string, UiForumPost>();
        [...reported, ...approval].forEach((p) => map.set(p.id, p));

        const merged = Array.from(map.values()).sort((a, b) => {
          const ta = a.date ? new Date(a.date).getTime() : 0;
          const tb = b.date ? new Date(b.date).getTime() : 0;
          return tb - ta;
        });

        setItems(merged.slice(0, 5));
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load forum posts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Forum Posts Under Review
          </h3>
          <p className="text-sm text-gray-500">
            Today's New Posts & Reported Posts
          </p>
        </div>
        <Link
          to="/forum-management"
          className="text-sm font-medium text-red-500 hover:text-pink-600"
        >
          View All
        </Link>
      </div>

      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-semibold text-gray-700">
            No posts under review
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Everything looks good. There are no new or reported posts pending review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((post) => (
            <div key={post.id} className="border-t border-gray-100 pt-4">
              <div className="flex items-start space-x-4">
                <AvatarWithFallback
                  src={post.author?.profilePic}
                  name={post.author?.name ?? "Unknown User"}
                  size={40}
                  className="flex-shrink-0"
                  fallbackBg="bg-pink-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {post.author?.name ?? "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-400">{post.date}</p>
                    </div>
                    {!!post.reportedBy?.count && (
                      <div className="flex items-center text-red-500 text-xs font-medium">
                        <Icon icon="mdi:flag" className="h-4 w-4 mr-1" />
                        <span>
                          Reported by {post.reportedBy.count}{" "}
                          {post.reportedBy.count === 1 ? "user" : "users"}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-2 mb-3 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
