// src/services/forumService.ts
import { supabase } from "@/lib/supabaseClient";
import type {
  DbForumPost,
  DbForumReport,
  DbPatientUser,
  UiForumPost,
  UiComment,
  UUID,
} from "@/components/types/forum";
import { formatIsoToDisplay, severityFromCount } from "@/components/types/forum";

/** Local helper for embedded one-to-one shapes (object | array | null). */
type EmbeddedOne<T> = T | T[] | null;

/** ----------------------------------------------------------------
 * Avatar URL resolver for the "patient_profiles" bucket
 * - Accepts full URLs or storage object paths
 * ---------------------------------------------------------------- */
const resolveAvatarUrl = (value?: string | null): string => {
  if (!value) return "/placeholder-avatar.png";
  if (/^https?:\/\//i.test(value)) return value; // already a URL
  const { data } = supabase.storage.from("patient_profiles").getPublicUrl(value);
  return data?.publicUrl ?? "/mother.png";
};

const isNonEmptyString = (x: unknown): x is string =>
  typeof x === "string" && x.trim().length > 0;

const toReasonList = <T extends { reason: unknown }>(reports: T[]): string[] => {
  const set = new Set<string>();
  for (const r of reports) {
    if (isNonEmptyString(r.reason)) set.add(r.reason.trim());
  }
  return Array.from(set);
};

/** Safely extract author whether embed is object or array (or null). */
const extractAuthor = (authorData: EmbeddedOne<DbPatientUser>): DbPatientUser | null => {
  if (!authorData) return null;
  return Array.isArray(authorData) ? authorData[0] ?? null : authorData;
};

/** Convert to displayable UI author with robust fallbacks. */
const toUiAuthor = (p: DbPatientUser | null) => ({
  id: p?.id ?? "unknown",
  name:
    p && p.first_name && p.last_name
      ? `${p.first_name} ${p.last_name}`.trim()
      : p?.first_name ?? "Unknown User",
  profilePic: resolveAvatarUrl(p?.profile_avatar_url),
});

const aggregateReports = (reports: DbForumReport[] | undefined) => {
  if (!reports || reports.length === 0) return undefined;
  const reasons = toReasonList(reports);
  const count = reports.length;
  return { count, severity: severityFromCount(count), reasons };
};

const deriveStatus = (
  is_deleted?: boolean | null,
  is_locked?: boolean | null,
  reportCount = 0
) => {
  if (is_deleted) return "Removed" as const;
  if (is_locked) return reportCount > 0 ? ("Under Review" as const) : ("Retained" as const);
  return "Posted" as const;
};

type CountAgg = { count: number };

/** Post shape with embedded author. */
type PostRowJoined = DbForumPost & {
  author: EmbeddedOne<DbPatientUser>;
  forum_comments: CountAgg[];
  forum_reactions: CountAgg[];
  forum_reports: DbForumReport[];
};

/** Comment shape with embedded author. */
type CommentRowJoined = {
  id: UUID;
  post_id: UUID;
  author_id: UUID;
  content: string;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean | null;
  author: EmbeddedOne<DbPatientUser>;
  forum_reactions: CountAgg[];
  forum_reports: DbForumReport[];
};

/* ================================================================
 * POSTS
 * ================================================================ */
export async function fetchPostsPage(limit = 20, from = 0): Promise<UiForumPost[]> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(`
      id,
      author_id,
      title,
      content,
      tags,
      created_at,
      updated_at,
      is_locked,
      is_deleted,
      author:patient_users!forum_posts_author_patient_fkey (
        id,
        first_name,
        last_name,
        profile_avatar_url,
        email
      ),
      forum_comments(count),
      forum_reactions(count),
      forum_reports(
        id, reported_by, post_id, comment_id, reason, status, created_at, reviewed_by
      )
    `)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw error;

  const rows = (data ?? []) as PostRowJoined[];

  return rows.map((row): UiForumPost => {
    const patient = extractAuthor(row.author);
    const author = toUiAuthor(patient);
    const likes = row.forum_reactions?.[0]?.count ?? 0;
    const comments = row.forum_comments?.[0]?.count ?? 0;
    const reportedBy = aggregateReports(row.forum_reports);

    return {
      id: row.id,
      author,
      date: formatIsoToDisplay(row.created_at),
      content: row.content,
      tags: row.tags ?? [],
      likes,
      comments,
      status: deriveStatus(row.is_deleted, row.is_locked, reportedBy?.count ?? 0),
      reportedBy,
      isLocked: !!row.is_locked,
      isDeleted: !!row.is_deleted,
    };
  });
}

/* ================================================================
 * COMMENTS
 * ================================================================ */
export async function fetchCommentsForPost(postId: UUID): Promise<UiComment[]> {
  const { data, error } = await supabase
    .from("forum_comments")
    .select(`
      id,
      post_id,
      author_id,
      content,
      created_at,
      updated_at,
      is_deleted,
      author:patient_users!forum_comments_author_patient_fkey (
        id, first_name, last_name, profile_avatar_url, email
      ),
      forum_reactions(count),
      forum_reports(
        id, reported_by, post_id, comment_id, reason, status, created_at, reviewed_by
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as CommentRowJoined[];

  return rows.map((c): UiComment => {
    const patient = extractAuthor(c.author);
    const author = toUiAuthor(patient);

    const likeCount = c.forum_reactions?.[0]?.count ?? 0;
    const reports = c.forum_reports ?? [];
    const reportedBy =
      reports.length > 0
        ? {
            count: reports.length,
            severity: severityFromCount(reports.length),
            reasons: toReasonList(reports),
          }
        : undefined;

    const status = c.is_deleted ? "Removed" : reports.length > 0 ? "Under Review" : "Posted";

    return {
      id: c.id,
      author,
      date: formatIsoToDisplay(c.created_at),
      content: c.content,
      likes: likeCount,
      status,
      reportedBy,
    };
  });
}

/* ================================================================
 * FILTER HELPERS
 * ================================================================ */
export async function fetchReportedPosts(limit = 20, from = 0): Promise<UiForumPost[]> {
  const posts = await fetchPostsPage(limit, from);
  return posts.filter((p) => (p.reportedBy?.count ?? 0) > 0);
}

export async function fetchApprovalQueue(limit = 20, from = 0): Promise<UiForumPost[]> {
  const posts = await fetchPostsPage(limit, from);
  return posts.filter((p) => p.isLocked || (p.reportedBy?.count ?? 0) > 0);
}

/* ================================================================
 * ARCHIVED POSTS (is_deleted = true)
 * ================================================================ */
export async function fetchArchivedPosts(limit = 20, from = 0): Promise<UiForumPost[]> {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(`
      id,
      author_id,
      title,
      content,
      tags,
      created_at,
      updated_at,
      is_locked,
      is_deleted,
      author:patient_users!forum_posts_author_patient_fkey (
        id,
        first_name,
        last_name,
        profile_avatar_url,
        email
      ),
      forum_comments(count),
      forum_reactions(count),
      forum_reports(
        id, reported_by, post_id, comment_id, reason, status, created_at, reviewed_by
      )
    `)
    .eq("is_deleted", true)
    .order("updated_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw error;

  const rows = (data ?? []) as PostRowJoined[];

  return rows.map((row): UiForumPost => {
    const patient = extractAuthor(row.author);
    const author = toUiAuthor(patient);
    const likes = row.forum_reactions?.[0]?.count ?? 0;
    const comments = row.forum_comments?.[0]?.count ?? 0;
    const reportedBy =
      row.forum_reports && row.forum_reports.length > 0
        ? {
            count: row.forum_reports.length,
            severity: severityFromCount(row.forum_reports.length),
            reasons: toReasonList(row.forum_reports),
          }
        : undefined;

    return {
      id: row.id,
      author,
      date: formatIsoToDisplay(row.created_at),
      content: row.content,
      tags: row.tags ?? [],
      likes,
      comments,
      status: "Removed",
      reportedBy,
      isLocked: !!row.is_locked,
      isDeleted: !!row.is_deleted,
    };
  });
}
