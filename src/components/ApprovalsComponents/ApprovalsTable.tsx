import { Icon } from "@iconify/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import ApprovalModal from "../modals/ApprovalModal";
import RejectModal from "../modals/RejectModal";

export interface Approval {
  prcIdUrl: string;
  obgynId: string;
  name: string;
  email: string;
  licenseNumber: string;
  affiliations: string[];
  organization?: string;
  status: "Pending" | "Returned" | "Approved";
}

interface ApprovalsTableProps {
  approvals: Approval[];
  onRefresh?: () => Promise<void> | void;
}

/** ---------------- UI ---------------- **/
const StatusBadge = ({ status }: { status: "Pending" | "Returned" | "Approved" }) => {
  const base = "text-xs font-semibold px-3 py-1 rounded-full inline-block";
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Returned: "bg-gray-200 text-gray-800",
    Approved: "bg-green-100 text-green-700",
  } as const;
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
      className={`bg-white border-b hover:bg-gray-50 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
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
              <Icon
                icon="ic:outline-place"
                className="h-4 w-4 text-[#E46B64] mt-0.5 flex-shrink-0"
              />
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
            title="Approve"
            aria-label={`Approve ${approval.name}`}
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

/** ---------------- Component ---------------- **/
export default function ApprovalsTable({ approvals, onRefresh }: ApprovalsTableProps) {
  const [modalState, setModalState] = useState<{
    type: "approve" | "reject" | null;
    data: Approval | null;
  }>({ type: null, data: null });

  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = (type: "approve" | "reject", approval: Approval) => {
    setModalState({ type, data: approval });
  };
  const handleCloseModal = () => {
    if (submitting) return;
    setModalState({ type: null, data: null });
  };

  const handleConfirmApproval = useCallback(async () => {
    if (!modalState.data) return;
    const { obgynId, name } = modalState.data;

    const t = toast.loading("Verifying account…");
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("obgyn_users")
        .update({
          is_verified: true,
          status: "Approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", obgynId);

      if (error) throw error;

      toast.success(`OB-GYN "${name}" has been verified.`, { id: t });
      handleCloseModal();
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      toast.error(`Unable to verify. ${err?.message ?? "Unknown error"}`, { id: t });
    } finally {
      setSubmitting(false);
    }
  }, [modalState.data, onRefresh]);

  const handleConfirmRejection = useCallback(async () => {
    if (!modalState.data) return;
    const { obgynId, name } = modalState.data;

    const t = toast.loading("Returning registration…");
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("obgyn_users")
        .update({
          is_verified: false,
          status: "Returned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", obgynId);

      if (error) throw error;

      toast.success(`"${name}" has been marked as Returned.`, { id: t });
      handleCloseModal();
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      toast.error(`Unable to mark as returned. ${err?.message ?? "Unknown error"}`, { id: t });
    } finally {
      setSubmitting(false);
    }
  }, [modalState.data, onRefresh]);

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
        approval={modalState.data} // ✅ Keep reject modal working
        loading={submitting}
      />
    </>
  );
}
