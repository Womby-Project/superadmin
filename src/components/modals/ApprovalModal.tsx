import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { type Approval } from '../ApprovalsComponents/ApprovalsTable';

// A new component to render the day badges
const DayBadge: React.FC<{ day: string }> = ({ day }) => (
    <span className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
        {day}
    </span>
);

// Updated AvailabilitySlot to use the DayBadge component
const AvailabilitySlot: React.FC<{ time: string; days: string[]; }> = ({ time, days }) => (
    <div className="flex items-start gap-4">
        <Icon icon="ph:clock" className="h-5 w-5 text-[#E46B64] mt-0.5" />
        <div>
            <p className="text-sm font-medium text-gray-800">{time}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
                {days.map(day => <DayBadge key={day} day={day} />)}
            </div>
        </div>
    </div>
);

// Updated AffiliatedHospitalItem for the new icon-based list
const AffiliatedHospitalItem: React.FC<{ name: string }> = ({ name }) => (
    <div className="flex items-center gap-3">
        <Icon icon="ic:outline-place" className="h-5 w-5 text-[#E46B64]" />
        <span className="text-sm text-gray-700">{name}</span>
    </div>
);


interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  approval: Approval | null;
}

export default function ApprovalModal({ isOpen, onClose, onConfirm, approval }: ApprovalModalProps) {
  if (!approval) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[95%] max-w-lg bg-white rounded-xl shadow-2xl p-5 border-none space-y-4">
        {/* Header Section */}
        <div>
            <h2 className="text-xl font-bold text-gray-900">{approval.name}</h2>
            <p className="text-sm font-semibold text-gray-600 mt-1">
            PRC License No.: <span className="text-xs font-normal">{approval.licenseNumber}</span>
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Female • {approval.email}</p>
        </div>

        <hr className="my-0.5    border-gray-200" />

        {/* Availability Section */}
        <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">Availability</h3>
            <div className="space-y-3">
            <AvailabilitySlot
                time="8:00 AM - 2:00 PM"
                days={["Monday", "Tuesday", "Wednesday"]}
            />
            <AvailabilitySlot
                time="10:00 AM - 4:00 PM"
                days={["Thursday", "Friday", "Saturday"]}
            />
            </div>
        </div>

        {/* Affiliated Hospitals Section */}
        <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">Affiliated Hospitals</h3>
            <div className="space-y-1.5">
            {approval.affiliations.map((hospital, index) => (
                <AffiliatedHospitalItem key={index} name={hospital} />
            ))}
            </div>
        </div>

        {/* PRC ID Section */}
        <div className="-mb-1">
            <h3 className="text-sm font-bold text-gray-800 mb-2">PRC ID</h3>
            <p className="text-xs text-gray-600 mb-1">1 attachment</p>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md p-2 cursor-pointer hover:bg-gray-50">
            <Icon
                icon="ph:file-image"
                className="w-7 h-7 text-gray-500 flex-shrink-0"
            />
            <div>
                <p className="text-xs font-medium text-gray-800">PRC-ID.png</p>
                <p className="text-[11px] text-gray-500">5.57MB</p>
            </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-3 pt-4 border-gray-200">
            <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md bg-white border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
            Cancel
            </button>
            <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-md text-white text-sm font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors"
            >
            Approve
            </button>
        </div>
        </DialogContent>
    </Dialog>
  );
}

