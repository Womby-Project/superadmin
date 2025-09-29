import { Icon } from "@iconify/react";
import { useState } from "react";
import ApprovalModal from "../modals/ApprovalModal";
import RejectModal from "../modals/RejectModal";

// Define and export the structure of an approval item
export interface Approval {
  name: string;
  email: string;
  licenseNumber: string;
  affiliations: string[];
  status: 'Pending' | 'Returned';
}

interface ApprovalsTableProps {
  approvals: Approval[];
}

// Sub-component for rendering the status badge
const StatusBadge = ({ status }: { status: 'Pending' | 'Returned' }) => {
  const baseClasses = "text-xs font-semibold px-3 py-1 rounded-full inline-block";
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Returned: "bg-gray-200 text-gray-800",
  };
  return <span className={`${baseClasses} ${styles[status]}`}>{status}</span>;
};

// Sub-component for each table row
const ApprovalRow = ({ 
  approval, 
  onRowClick,
  onApprove, 
  onReject 
}: { 
  approval: Approval, 
  onRowClick: () => void,
  onApprove: () => void, 
  onReject: () => void 
}) => {
  const MAX_AFFILIATIONS_VISIBLE = 1;
  const visibleAffiliations = approval.affiliations.slice(0, MAX_AFFILIATIONS_VISIBLE);
  const remainingCount = approval.affiliations.length - MAX_AFFILIATIONS_VISIBLE;

  return (
    <tr className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={onRowClick}>
      <td className="px-6 py-4">
        <div className="font-semibold text-gray-800">{approval.name}</div>
        <div className="text-sm text-gray-500">{approval.email}</div>
      </td>
      <td className="px-6 py-4 text-gray-600">{approval.licenseNumber}</td>
      <td className="px-6 py-4 text-gray-600">
        <ul className="space-y-1">
          {visibleAffiliations.map((hospital, index) => (
            <li key={index} className="flex items-start gap-2">
              <Icon icon="ic:outline-place" className="h-4 w-4 text-[#E46B64] mt-0.5 flex-shrink-0" />
              <span>{hospital}</span>
            </li>
          ))}
          {remainingCount > 0 && (
            <li className="pl-6 text-xs text-red-500">+{remainingCount} more</li>
          )}
        </ul>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={approval.status} />
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {/* Removed the view button */}
          <button onClick={onApprove} className="p-2 rounded-md bg-green-100 hover:bg-green-200 transition">
            <Icon icon="mdi:check" className="h-5 w-5 text-green-600" />
          </button>
          <button onClick={onReject} className="p-2 rounded-md bg-red-100 hover:bg-red-200 transition">
            <Icon icon="mdi:close" className="h-5 w-5 text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Main table component with updated modal logic
export default function ApprovalsTable({ approvals }: ApprovalsTableProps) {
  const [modalState, setModalState] = useState<{
    type: 'approve' | 'reject' | null;
    data: Approval | null;
  }>({ type: null, data: null });

  const handleOpenModal = (type: 'approve' | 'reject', approval: Approval) => {
    setModalState({ type, data: approval });
  };

  const handleCloseModal = () => {
    setModalState({ type: null, data: null });
  };

  const handleConfirmApproval = () => {
    console.log(`Approved: ${modalState.data?.name}`);
    handleCloseModal();
  };

  const handleConfirmRejection = () => {
    console.log(`Rejected: ${modalState.data?.name}`);
    handleCloseModal();
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-[#6B7280] uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">OB-GYN</th>
                <th scope="col" className="px-6 py-3">License Number</th>
                <th scope="col" className="px-6 py-3">Affiliated Hospitals</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval, index) => (
                <ApprovalRow 
                  key={index} 
                  approval={approval}
                  onRowClick={() => handleOpenModal('approve', approval)}
                  onApprove={() => handleOpenModal('approve', approval)}
                  onReject={() => handleOpenModal('reject', approval)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ApprovalModal
        isOpen={modalState.type === 'approve'}
        onClose={handleCloseModal}
        onConfirm={handleConfirmApproval}
        approval={modalState.data}
      />
      
      <RejectModal
        isOpen={modalState.type === 'reject'}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRejection}
      />
    </>
  );
}

