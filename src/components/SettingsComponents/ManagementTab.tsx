// src/pages/ManagementTab.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

// ✅ Vite-friendly pdf.js worker import
import type * as PDFJS from "pdfjs-dist";
// @ts-ignore - vite will resolve to a URL string
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

type DocType = "privacy_policy" | "terms_and_conditions";
type DocStatus = "published" | "archived";

type LegalDoc = {
  id: string;
  doc_type: DocType;
  version: number;
  title: string | null;
  body: string | null;
  file_url: string | null;
  file_mime: string | null;
  file_size: number | null;
  locale: string;
  status: DocStatus;
  effective_date: string | null;
  changelog: string | null;
  created_by: string | null;
  updated_by: string | null;
  checksum?: string | null;
  created_at: string;
  updated_at: string;
};

const DOC_LABEL: Record<DocType, string> = {
  privacy_policy: "Privacy Policy",
  terms_and_conditions: "Terms & Conditions",
};

/* ===================== Shared UI ===================== */

const ManagementSection = ({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <div className="flex items-start gap-3">
      <Icon icon={icon} className="h-6 w-6 text-[#E46B64]" />
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <div className="mt-6 space-y-4">{children}</div>
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAD1C9] focus:border-[#E46B64] ${props.className ?? ""}`}
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAD1C9] focus:border-[#E46B64] ${props.className ?? ""}`}
  />
);

function FileRow({
  fileName,
  fileSize,
  fileMime,
}: {
  fileName?: string | null;
  fileSize?: number | null;
  fileMime?: string | null;
}) {
  if (!fileName) return null;
  const pretty = fileName.split("/").pop();
  return (
    <div className="text-xs text-gray-600 border rounded-md px-2 py-1">
      <div className="flex items-center gap-2">
        <Icon icon="ph:file-text-duotone" className="h-4 w-4" />
        <span className="truncate">{pretty}</span>
        {fileSize ? <span>• {(fileSize / 1024).toFixed(1)} KB</span> : null}
        {fileMime ? <span>• {fileMime}</span> : null}
      </div>
    </div>
  );
}

/* ===================== Auth / Admin helpers ===================== */

function useIsAdmin() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      if (loading) return;
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      setChecking(true);
      setError(null);

      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) setError(error.message);
      setIsAdmin(!!data);
      setChecking(false);
    };
    check();
  }, [user, loading]);

  return { checking, isAdmin, error, user, authLoading: loading };
}

/* ===================== Data hooks ===================== */

function useLatestDoc(docType: DocType, locale = "en") {
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState<LegalDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("legal_documents")
      .select("*")
      .eq("doc_type", docType)
      .eq("locale", locale)
      .eq("status", "published")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) setError(error.message);
    else setLatest((data as unknown as LegalDoc) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docType, locale]);

  return { loading, latest, error, refetch: fetchLatest };
}

/* ===================== File → Text Extraction Helpers ===================== */

const readAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsText(file);
  });

const readAsArrayBuffer = (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = reject;
    r.readAsArrayBuffer(file);
  });

function stripRtf(rtf: string): string {
  return rtf
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\'[0-9a-fA-F]{2}/g, " ")
    .replace(/\\[a-zA-Z]+-?\d*(?:\s|;)?/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function sha256Hex(file: File): Promise<string> {
  const buf = await readAsArrayBuffer(file);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** DOCX → text via mammoth (browser build) */
async function extractDocx(file: File): Promise<string> {
  const { default: mammoth } = await import("mammoth/mammoth.browser");
  const arrayBuffer = await readAsArrayBuffer(file);
  const { value } = await mammoth.convertToHtml({ arrayBuffer });

  const tmp = document.createElement("div");
  tmp.innerHTML = value;
  return tmp.innerText.replace(/\n{3,}/g, "\n\n").trim();
}

/** PDF → text via pdfjs-dist (Vite worker url) */
async function extractPdf(file: File): Promise<string> {
  const pdfjs = (await import("pdfjs-dist")) as typeof PDFJS;
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const data = new Uint8Array(await readAsArrayBuffer(file));
  const doc = await pdfjs.getDocument({ data }).promise;
  const out: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      // @ts-ignore - TextItem typing is a bit loose
      .map((it) => it.str)
      .filter(Boolean)
      .join(" ");
    out.push(line);
  }
  return out.join("\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

/** Dispatcher: choose best extractor by MIME/ext */
async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();

  if (mime.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
    return (await readAsText(file)).trim();
  }
  if (mime === "text/rtf" || name.endsWith(".rtf")) {
    return stripRtf(await readAsText(file));
  }
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return await extractDocx(file);
  }
  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    try {
      return await extractPdf(file);
    } catch (e) {
      console.warn("PDF extraction failed; keeping file only:", e);
      return "";
    }
  }
  try {
    return (await readAsText(file)).trim();
  } catch {
    return "";
  }
}

/* ===================== Editor (Publish-only) ===================== */

function LegalEditor({ docType }: { docType: DocType }) {
  const { loading, latest, error, refetch } = useLatestDoc(docType, "en");
  const { user } = useAuth();

  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [changelog, setChangelog] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [checksum, setChecksum] = useState<string | null>(null);

  useEffect(() => {
    if (!latest) {
      setTitle(DOC_LABEL[docType]);
      setBody("");
      setEffectiveDate("");
      setChangelog("");
      setFile(null);
      setChecksum(null);
      return;
    }
    setTitle(latest.title ?? DOC_LABEL[docType]);
    setBody(latest.body ?? "");
    setEffectiveDate(latest.effective_date ?? "");
    setChangelog("");
    setFile(null);
    setChecksum(null);
  }, [latest, docType]);

  const lastUpdated = useMemo(() => {
    if (!latest?.updated_at) return "—";
    try {
      return format(new Date(latest.updated_at), "MMM d, yyyy");
    } catch {
      return latest.updated_at;
    }
  }, [latest]);

  const hasContent = (body?.trim()?.length ?? 0) > 0 || !!file;

  const uploadFileIfAny = async (): Promise<{
    file_url: string | null;
    file_mime: string | null;
    file_size: number | null;
    checksum: string | null;
  }> => {
    if (!file) return { file_url: null, file_mime: null, file_size: null, checksum: null };

    const ext = file.name.split(".").pop() || "bin";
    const path = `${docType}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("legal-docs")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const publicUrl = supabase.storage.from("legal-docs").getPublicUrl(data.path).data.publicUrl;

    let hex: string | null = null;
    try {
      hex = await sha256Hex(file);
    } catch (e) {
      console.warn("Checksum failed:", e);
    }

    return {
      file_url: publicUrl ?? data.path,
      file_mime: file.type || null,
      file_size: file.size || null,
      checksum: hex,
    };
  };

  // When a file is chosen: auto-extract text into body + compute checksum
  const onChooseFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f ?? null);
    setChecksum(null);
    if (!f) return;

    try {
      const text = (await extractTextFromFile(f)) || "";
      if (text.trim().length > 0) setBody(text);
    } catch (err: any) {
      console.warn("Text extraction failed:", err?.message || err);
    }

    try {
      const hex = await sha256Hex(f);
      setChecksum(hex);
    } catch (err) {
      console.warn("Checksum computation failed:", err);
    }
  };

  const publishNow = async () => {
    if (!user) {
      alert("You must be signed in to publish.");
      return;
    }
    if (!hasContent) {
      alert("Please paste content or upload a file before publishing.");
      return;
    }

    setSaving(true);
    try {
      const upload = await uploadFileIfAny();

      const { data, error } = await supabase
        .from("legal_documents")
        .insert({
          doc_type: docType,
          title: title || DOC_LABEL[docType],
          body: (body?.trim()?.length ?? 0) > 0 ? body : null, // ← save extracted or typed text
          file_url: upload.file_url,
          file_mime: upload.file_mime,
          file_size: upload.file_size,
          checksum: upload.checksum ?? checksum ?? null,
          locale: "en",
          status: "published",
          effective_date: effectiveDate || null,
          changelog: changelog || "Auto-published update",
          created_by: user.id,
          updated_by: user.id,
        })
        .select("*")
        .single();

      if (error) throw error;

      setChangelog("");
      setFile(null);
      setChecksum(null);
      await refetch();
      alert(`${DOC_LABEL[docType]} published (v${data.version}).`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1">
          <Icon icon="ph:hash-duotone" className="h-4 w-4" />
          Version: <b className="ml-1">{latest?.version ?? "—"}</b>
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon icon="ph:info-duotone" className="h-4 w-4" />
          Status: <b className="ml-1 capitalize">{latest?.status ?? "—"}</b>
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon icon="ph:calendar-duotone" className="h-4 w-4" />
          Last Updated: <b className="ml-1">{lastUpdated}</b>
        </span>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
        <Input
          placeholder={`${DOC_LABEL[docType]} title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Body (required if no file) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Content (required if no file is uploaded)
        </label>
        <Textarea
          rows={10}
          placeholder={`Paste ${DOC_LABEL[docType]} content here...`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500">
          If you upload a file, we’ll auto-extract its text here so the app can render the body directly.
        </p>
      </div>

      {/* File upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Upload file (PDF/DOCX/TXT/RTF/MD)</label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer">
            <Icon icon="ph:upload-simple-bold" className="h-5 w-5" />
            <input
              type="file"
              className="hidden"
              onChange={onChooseFile}
              accept=".pdf,.docx,.txt,.rtf,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/rtf,text/markdown"
            />
            Choose File
          </label>
          <span className="text-sm text-gray-500">
            
          </span>
        </div>
        <FileRow
          fileName={file?.name ?? latest?.file_url ?? null}
          fileSize={file?.size ?? latest?.file_size ?? null}
          fileMime={file?.type ?? latest?.file_mime ?? null}
        />
        {checksum ? (
          <div className="text-[11px] text-gray-500 break-all">Checksum (SHA-256): {checksum}</div>
        ) : null}
      </div>

      {/* Effective date + changelog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Effective Date</label>
          <Input
            type="date"
            value={effectiveDate ?? ""}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Changelog (short note)</label>
          <Input
            placeholder="e.g., Updated retention clause"
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
          />
        </div>
      </div>

      {/* Publish */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {loading
            ? "Loading…"
            : error
            ? `Error: ${error}`
            : latest
            ? `Current: v${latest.version} • ${latest.status}`
            : "No versions yet"}
        </div>
        <button
          disabled={!((body?.trim()?.length ?? 0) > 0 || !!file) || saving}
          onClick={publishNow}
          className="bg-[#E46B64] text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-[#d85b56] disabled:opacity-60"
          title={
            !((body?.trim()?.length ?? 0) > 0 || !!file)
              ? "Paste content or upload a file to enable publishing"
              : "Publish update"
          }
        >
          Update & Publish
        </button>
      </div>
    </div>
  );
}

/* ===================== Page ===================== */

export default function ManagementTab() {
  const { checking, isAdmin, error, authLoading } = useIsAdmin();

  if (authLoading || checking) {
    return (
      <div className="p-6">
        <div className="text-sm text-gray-600">Authenticating…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-sm text-red-600">Auth/RLS error: {error}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-4 py-3">
          You’re signed in, but not authorized to manage legal documents. Please contact a super admin.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <ManagementSection
        icon="ph:paper-plane-tilt-fill"
        title="Send Announcement"
        description="Send customized notifications to all users."
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
          <Input placeholder="Announcement subject" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Message Content</label>
          <Textarea rows={6} placeholder="Enter announcement message..." />
        </div>
        <button className="bg-[#E46B64] text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-[#d85b56] transition-colors">
          Send Announcement
        </button>
      </ManagementSection>

      <ManagementSection
        icon="ph:file-text-fill"
        title="Privacy Policy"
        description="Update the app's privacy policy (paste content or upload a file)."
      >
        <LegalEditor docType="privacy_policy" />
      </ManagementSection>

      <ManagementSection
        icon="ph:file-text-fill"
        title="Terms & Conditions"
        description="Update the app's terms and conditions (paste content or upload a file)."
      >
        <LegalEditor docType="terms_and_conditions" />
      </ManagementSection>
    </div>
  );
}
