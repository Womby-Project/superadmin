// components/modals/RejectModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean; // NEW
}

export default function RejectModal({ isOpen, onClose, onConfirm, loading = false }: RejectModalProps) {
  // prevent closing while submitting
  const handleOpenChange = (open: boolean) => {
    if (!loading && !open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95%] max-w-sm bg-white rounded-xl shadow-lg p-8 text-center border-none">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Return Registration</h2>
        <p className="text-sm text-gray-600 mb-8">
          Are you sure you want to <span className="font-semibold">return</span> this registration? The user will be notified by email.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 rounded-lg text-white font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Returning…" : "Return"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
