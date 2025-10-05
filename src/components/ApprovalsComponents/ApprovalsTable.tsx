import { Icon } from "@iconify/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import ApprovalModal from "../modals/ApprovalModal";
import RejectModal from "../modals/RejectModal";

export interface Approval {
  obgynId: string;
  name: string;
  email: string;
  licenseNumber: string;
  affiliations: string[];
  status: "Pending" | "Returned";
}

interface ApprovalsTableProps {
  approvals: Approval[];
  onRefresh?: () => Promise<void> | void;
}

/** ---------------- UI ---------------- **/
const StatusBadge = ({ status }: { status: "Pending" | "Returned" }) => {
  const base = "text-xs font-semibold px-3 py-1 rounded-full inline-block";
  const styles = { Pending: "bg-yellow-100 text-yellow-800", Returned: "bg-gray-200 text-gray-800" } as const;
  return <span className={`${base} ${styles[status]}`}>{status}</span>;
};

const ApprovalRow = ({
  approval,
  onRowClick,
  onApprove,
  onReject,
  disabled,
}: {
  approval: Approval;
  onRowClick: () => void;
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
}) => {
  const MAX = 1;
  const { visible, more } = useMemo(() => {
    const list = Array.isArray(approval.affiliations) ? approval.affiliations : [];
    return { visible: list.slice(0, MAX), more: Math.max(0, list.length - MAX) };
  }, [approval.affiliations]);

  return (
    <tr
      className={`bg-white border-b hover:bg-gray-50 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={() => !disabled && onRowClick()}
    >
      <td className="px-6 py-4">
        <div className="font-semibold text-gray-800">{approval.name}</div>
        <div className="text-sm text-gray-500">{approval.email}</div>
      </td>
      <td className="px-6 py-4 text-gray-600">{approval.licenseNumber || "—"}</td>
      <td className="px-6 py-4 text-gray-600">
        <ul className="space-y-1">
          {visible.map((h, i) => (
            <li key={i} className="flex items-start gap-2">
              <Icon icon="ic:outline-place" className="h-4 w-4 text-[#E46B64] mt-0.5 flex-shrink-0" />
              <span className="truncate max-w-[28ch]" title={h}>
                {h}
              </span>
            </li>
          ))}
          {more > 0 && <li className="pl-6 text-xs text-red-500">+{more} more</li>}
        </ul>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={approval.status} />
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <button
            disabled={disabled}
            onClick={onApprove}
            className="p-2 rounded-md bg-green-100 hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Accept / Verify"
            aria-label={`Verify ${approval.name}`}
          >
            <Icon icon="mdi:check" className="h-5 w-5 text-green-600" />
          </button>
          <button
            disabled={disabled}
            onClick={onReject}
            className="p-2 rounded-md bg-red-100 hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Return"
            aria-label={`Return ${approval.name}`}
          >
            <Icon icon="mdi:close" className="h-5 w-5 text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
};

/** ---------------- Error extraction ---------------- **/
function extractErrorDetail(err: any): string {
  // keep supabase error intact; prefer server JSON
  if (err?.context?.body) {
    try {
      const parsed = typeof err.context.body === "string" ? JSON.parse(err.context.body) : err.context.body;
      const parts: string[] = [];
      if (parsed?.message) parts.push(parsed.message);
      if (parsed?.resend_status) parts.push(`resend_status=${parsed.resend_status}`);
      if (parsed?.hint) parts.push(`hint=${parsed.hint}`);
      if (parsed?.resend_detail) {
        const d = typeof parsed.resend_detail === "string" ? parsed.resend_detail : JSON.stringify(parsed.resend_detail);
        parts.push(`resend_detail=${d.slice(0, 200)}…`);
      }
      return parts.join(" | ") || JSON.stringify(parsed);
    } catch {
      return String(err.context.body);
    }
  }
  return err?.message ?? "Unknown error";
}

// Strip undefined so JSON.stringify never drops the object to empty
function clean<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** ---------------- Component ---------------- **/
export default function ApprovalsTable({ approvals, onRefresh }: ApprovalsTableProps) {
  const [modalState, setModalState] = useState<{ type: "approve" | "reject" | null; data: Approval | null }>({
    type: null,
    data: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = (type: "approve" | "reject", approval: Approval) => {
    setModalState({ type, data: approval });
  };
  const handleCloseModal = () => {
    if (submitting) return;
    setModalState({ type: null, data: null });
  };

  const runAction = useCallback(
    async (payload: {
      action: "verified" | "returned";
      obgynId: string;
      email: string;
      name: string;
      licenseNumber?: string;
    }) => {
      setSubmitting(true);
      try {
        // basic client-side validation (prevents accidental empty bodies)
        const { action, obgynId, email, name } = payload;
        if (!action || !obgynId || !email || !name) {
          throw new Error("Client validation failed: missing required fields.");
        }

        const safePayload = clean(payload);
        // ⚠️ Do NOT set custom headers. supabase-js will JSON-encode the body.
        console.log("[notify-obgyn] sending payload", safePayload);
        const { data, error } = await supabase.functions.invoke("notify-obgyn", {
          body: safePayload,
        });

        if (error) {
          console.error("[notify-obgyn] invoke error", error, error?.context?.body);
          throw error;
        }
        if (onRefresh) await onRefresh();
        return data;
      } finally {
        setSubmitting(false);
      }
    },
    [onRefresh]
  );

  const handleConfirmApproval = async () => {
    if (!modalState.data) return;
    const { obgynId, name, email, licenseNumber } = modalState.data;
    const t = toast.loading("Verifying account and sending email…");
    try {
      await runAction({ action: "verified", obgynId, email, name, licenseNumber });
      toast.success(
        "Congratulations! The OB-GYN account was successfully verified and an email notification has been sent.",
        { id: t }
      );
      handleCloseModal();
    } catch (err) {
      toast.error(`Unable to verify and notify. ${extractErrorDetail(err)}`, { id: t });
    }
  };

  const handleConfirmRejection = async () => {
    if (!modalState.data) return;
    const { obgynId, name, email, licenseNumber } = modalState.data;
    const t = toast.loading("Returning verification and sending email…");
    try {
      await runAction({ action: "returned", obgynId, email, name, licenseNumber });
      toast.success(
        "The verification could not be completed. We’ve notified the OB-GYN to review the details and resubmit.",
        { id: t }
      );
      handleCloseModal();
    } catch (err) {
      toast.error(`Unable to return and notify. ${extractErrorDetail(err)}`, { id: t });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-[#6B7280] uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">OB-GYN</th>
                <th className="px-6 py-3">License Number</th>
                <th className="px-6 py-3">Affiliated Hospitals</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No approvals to review.
                  </td>
                </tr>
              ) : (
                approvals.map((a) => (
                  <ApprovalRow
                    key={a.obgynId}
                    approval={a}
                    onRowClick={() => handleOpenModal("approve", a)}
                    onApprove={() => handleOpenModal("approve", a)}
                    onReject={() => handleOpenModal("reject", a)}
                    disabled={submitting}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ApprovalModal
        isOpen={modalState.type === "approve"}
        onClose={handleCloseModal}
        onConfirm={handleConfirmApproval}
        approval={modalState.data}
        loading={submitting}
      />
      <RejectModal
        isOpen={modalState.type === "reject"}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRejection}
        loading={submitting}
      />
    </>
  );
}
