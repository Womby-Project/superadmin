// src/components/types/forum.ts (or wherever your types live)
export type UUID = string;

/** === DB Rows (match your schema) === */
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
  status: string | null; // 'Pending' default
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

/** 🔹 Helper: PostgREST one-to-one embeds can be object | array | null */
export type EmbeddedOne<T> = T | T[] | null;

/** === UI Types === */
export type ModerationStatus = 'Posted' | 'Pending' | 'Under Review' | 'Retained' | 'Removed';

export interface UiAuthor {
  id: UUID;
  name: string;
  profilePic: string; // resolved URL with fallback
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

/** === Helpers === */
export const formatIsoToDisplay = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString() : '';

export const severityFromCount = (n: number): UiReportedBy['severity'] =>
  n >= 10 ? 'High' : n >= 5 ? 'Medium' : 'Low';
