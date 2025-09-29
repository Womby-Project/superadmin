import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { useState } from 'react';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string) => void;
}

export default function AddArticleModal({ isOpen, onClose, onAdd }: AddArticleModalProps) {
  const [url, setUrl] = useState('');

  const handleAddArticle = () => {
    // Basic validation
    if (url.trim()) {
      onAdd(url);
      setUrl(''); // Reset field
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-lg bg-white rounded-xl shadow-lg p-8 border-none space-y-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Add Article By URL</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter a URL to add an article to your content library. The system will automatically extract the title, content, and images.
            </p>
        </div>

        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Article URL</label>
            <Icon
              icon="ph:link-bold"
              className="absolute left-3 top-10 text-gray-400 h-5 w-5"
            />
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E46B64]/40 outline-none"
            />
        </div>
        
        <div className="flex justify-end gap-4 pt-4 border-gray-200">
            <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleAddArticle}
                className="px-6 py-2 rounded-lg text-white font-semibold bg-[#E46B64] hover:bg-[#d65c58] transition-colors"
            >
                Add Article
            </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
