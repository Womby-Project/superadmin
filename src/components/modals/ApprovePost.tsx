import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ApprovePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ⬇️ make this async so the modal can await the DB update
  onConfirm: () => Promise<void>;
}

export default function ApprovePostModal({ isOpen, onClose, onConfirm }: ApprovePostModalProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setErr(null);
      await onConfirm();     // ⬅️ await DB call
      onClose();             // close only on success
    } catch (e: any) {
      setErr(e?.message ?? "Failed to approve post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-md bg-white rounded-xl shadow-lg p-8 text-center border-none">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Approve Post</h2>
        <p className="text-sm text-gray-600 mb-6">
          Approving this post will make it visible to all forum members, allowing them to view and interact with it.
        </p>

        {err && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {err}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 rounded-lg text-white font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors disabled:opacity-60"
          >
            {loading ? "Approving…" : "Approve"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
