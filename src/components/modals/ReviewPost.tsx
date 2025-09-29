import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ReviewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReviewPostModal({ isOpen, onClose, onConfirm }: ReviewPostModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-md bg-white rounded-xl shadow-lg p-8 text-center border-none">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Place Under Review</h2>
        <p className="text-sm text-gray-600 mb-8">
          You are about to review this post/comment. It will be hidden from users and placed under review until you decide to keep or remove it.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg text-white font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors"
          >
            Proceed
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
