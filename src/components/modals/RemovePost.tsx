import { Dialog, DialogContent } from "@/components/ui/dialog";

interface RemovePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RemovePostModal({ isOpen, onClose, onConfirm }: RemovePostModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-md bg-white rounded-xl shadow-lg p-8 text-center border-none">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Removal</h2>
        <p className="text-sm text-gray-600 mb-8">
          Removing this post/comment will permanently hide it from users and move it to the archive. This action helps maintain forum guidelines.
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
            Remove Post
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
