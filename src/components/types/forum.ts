// src/components/types/forum.ts
export type UUID = string;

/** =======================
 *  DB enums & mappings
 *  ======================= */
export type DbForumPostStatus = 'Pending' | 'Approved' | 'Dismissed';
export type DbForumReportStatus = 'Pending' | 'Reviewed';

/** Map DB post status ➜ UI moderation status */
export type ModerationStatus = 'Posted' | 'Pending' | 'Under Review' | 'Retained' | 'Removed';

export const mapDbStatusToUi = (s: DbForumPostStatus): ModerationStatus => {
  switch (s) {
    case 'Approved':
      return 'Posted';
    case 'Pending':
      return 'Pending';
    case 'Dismissed':
      return 'Removed';
    default:
      return 'Pending';
  }
};

/** Optional: map UI moderation status back to DB post status (when applicable) */
export const mapUiStatusToDb = (s: ModerationStatus): DbForumPostStatus | null => {
  switch (s) {
    case 'Posted':
      return 'Approved';
    case 'Pending':
      return 'Pending';
    case 'Removed':
      return 'Dismissed';
    // These are review-layer concepts, not DB post states
    case 'Under Review':
    case 'Retained':
    default:
      return null;
  }
};

/** =======================
 *  DB Rows (match schema)
 *  ======================= */
export interface DbForumPost {
  id: UUID;
  author_id: UUID;
  title: string | null;
  content: string;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  is_locked: boolean | null;
  is_deleted: boolean | null;
  /** NEW: forum_posts.status in DB */
  status: DbForumPostStatus; // 'Pending' | 'Approved' | 'Dismissed'
}

export interface DbForumComment {
  id: UUID;
  post_id: UUID;
  author_id: UUID;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
}

export interface DbForumReaction {
  id: UUID;
  post_id: UUID | null;
  comment_id: UUID | null;
  user_id: UUID;
  reaction_type: string | null;
  created_at: string | null;
}

export interface DbForumReport {
  id: UUID;
  reported_by: UUID;
  post_id: UUID | null;
  comment_id: UUID | null;
  reason: string;
  status: DbForumReportStatus | null; // 'Pending' | 'Reviewed'
  created_at: string | null;
  reviewed_by: UUID | null;
}

export interface DbPatientUser {
  id: UUID;
  first_name: string;
  last_name: string;
  profile_avatar_url: string | null;
  email: string;
}

/** PostgREST one-to-one embeds can be object | array | null */
export type EmbeddedOne<T> = T | T[] | null;

/** Convenience: count aggregation shape from PostgREST (e.g., forum_reactions(count)) */
export type CountAgg = { count: number };

/** When selecting forum_posts with aggregate counts */
export interface DbForumPostWithAgg extends DbForumPost {
  forum_reactions?: CountAgg[]; // top-1 with {count}
  forum_comments?: CountAgg[];  // top-1 with {count}
}

/** =======================
 *  UI Types
 *  ======================= */
export interface UiAuthor {
  id: UUID;
  name: string;        // "First Last"
  profilePic: string;  // resolved URL with fallback
}

export interface UiReportedBy {
  count: number;
  severity: 'Low' | 'Medium' | 'High';
  reasons: string[];
}

export interface UiComment {
  id: UUID;
  author: UiAuthor;
  date: string;
  replyTo?: string;
  content: string;
  likes: number;
  status?: ModerationStatus;
  reportedBy?: UiReportedBy;
}

export interface UiForumPost {
  id: UUID;
  author: UiAuthor;
  date: string;
  content: string;
  replyTo?: string;
  tags: string[];
  likes: number;
  comments: number;
  commentsList?: UiComment[];
  status?: ModerationStatus;
  reportedBy?: UiReportedBy;
  isLocked?: boolean;
  isDeleted?: boolean;
}

/** =======================
 *  Helpers
 *  ======================= */
export const formatIsoToDisplay = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString() : '';

export const severityFromCount = (n: number): UiReportedBy['severity'] =>
  n >= 10 ? 'High' : n >= 5 ? 'Medium' : 'Low';

/** Resolve author's display name and avatar with fallback */
export const resolveAuthor = (
  a: Pick<DbPatientUser, 'id' | 'first_name' | 'last_name' | 'profile_avatar_url'> | null | undefined,
  fallbackAvatar: string = '/images/mother.png'
): UiAuthor => {
  const nameRaw = `${a?.first_name ?? ''} ${a?.last_name ?? ''}`.trim();
  const name = nameRaw.length ? nameRaw : 'Anonymous Patient';
  const profilePic = a?.profile_avatar_url || fallbackAvatar;
  return {
    id: a?.id ?? '00000000-0000-0000-0000-000000000000',
    name,
    profilePic,
  };
};

/** Get numeric count from PostgREST aggregates safely */
export const getAggCount = (arr?: CountAgg[] | null) =>
  Array.isArray(arr) && arr[0] && typeof arr[0].count === 'number' ? arr[0].count : 0;

/** Map a DB post row (+ optional author) to a UI post */
export const mapDbPostToUi = (
  row: DbForumPostWithAgg,
  author: Pick<DbPatientUser, 'id' | 'first_name' | 'last_name' | 'profile_avatar_url'> | null | undefined
): UiForumPost => ({
  id: row.id,
  author: resolveAuthor(author),
  date: formatIsoToDisplay(row.created_at),
  content: row.content,
  tags: row.tags ?? [],
  likes: getAggCount(row.forum_reactions),
  comments: getAggCount(row.forum_comments),
  status: mapDbStatusToUi(row.status),
  isLocked: !!row.is_locked,
  isDeleted: !!row.is_deleted,
});
