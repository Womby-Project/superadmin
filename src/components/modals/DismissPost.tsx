import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from 'react';

const REASONS = [
  "Spam",
  "Misinformation",
  "Harassment/Bullying",
  "Hate Speech/Discrimination",
  "Privacy Violation",
];

interface DismissPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasons: string[]) => void;
}

export default function DismissPostModal({ isOpen, onClose, onConfirm }: DismissPostModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason) 
        : [...prev, reason]
    );
  };

  const handleConfirm = () => {
    if (selectedReasons.length > 0) {
      onConfirm(selectedReasons);
      setSelectedReasons([]); // Reset for next time
    } else {
      alert("Please select at least one reason for dismissal.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-lg bg-white rounded-xl shadow-lg p-8 border-none space-y-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Reason for Dismissal</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please provide a reason for not approving this post. This will be shared with the user.
            </p>
        </div>

        <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Reasons</h3>
            <div className="flex flex-wrap gap-2">
                {REASONS.map(reason => {
                    const isSelected = selectedReasons.includes(reason);
                    return (
                        <button 
                            key={reason}
                            onClick={() => toggleReason(reason)}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                isSelected 
                                ? 'bg-[#E46B64] text-white border-[#E46B64]' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {reason}
                        </button>
                    )
                })}
            </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleConfirm}
                className="px-6 py-2 rounded-lg text-white font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors disabled:bg-gray-400"
                disabled={selectedReasons.length === 0}
            >
                Confirm Dismissal
            </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
