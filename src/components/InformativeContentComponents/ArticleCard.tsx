import { Icon } from '@iconify/react';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { toast } from 'sonner';

export interface Article {
  id: string;
  title: string;
  image: string;
  description: string;
  body?: string | null;
  author?: string | null;
  publishedDate: string;
  source: string;
  fetchedDate: string;
  status: 'Posted' | 'Draft' | 'Archived';
}

interface ContentCardProps {
  article: Article;
  onView: (article: Article) => void;
  onStatusChange?: (id: string, newStatus: 'Posted' | 'Draft' | 'Archived') => void; 
}

const statusStyles = {
  Posted: 'bg-green-100 text-green-800',
  Archived: 'bg-gray-100 text-gray-800',
  Draft: 'bg-yellow-100 text-yellow-800',
};

export default function ContentCard({ article, onView, onStatusChange }: ContentCardProps) {
  const { id, image, title, description, publishedDate, source, fetchedDate, status } = article;
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);

  const updateStatus = async (newStatus: 'Posted' | 'Archived') => {
    if (!id) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('articles').update({ status: newStatus }).eq('id', id);
      if (error) throw error;

      // Optimistic UI update
      setLocalStatus(newStatus);
      if (onStatusChange) onStatusChange(id, newStatus);

      toast.success(
        `Article ${newStatus === 'Posted' ? 'posted' : 'archived'} successfully!`
      );
    } catch (err: any) {
      console.error('Error updating article status:', err);
      toast.error(err.message || 'Failed to update article status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <img className="h-48 w-full object-cover" src={image} alt={title} />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-bold text-gray-800 mb-2">{title}</h3>

        <div className="mb-3">
          <span
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusStyles[localStatus]}`}
          >
            {localStatus}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 flex-grow">{description}</p>

        <div className="text-xs text-gray-400 space-y-2 mb-4">
          <div className="flex items-center gap-1">
            <Icon icon="octicon:calendar-24" className="w-4 h-4" />
            <span className="font-semibold text-gray-500">Published:</span>{' '}
            {publishedDate}
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="ion:open-outline" className="w-4 h-4" />
            <span className="font-semibold text-gray-500">Source:</span> {source}
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:web" className="w-4 h-4" />
            <span className="font-semibold text-gray-500">Fetched:</span>{' '}
            {fetchedDate}
          </div>
        </div>

        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={() => onView(article)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200 disabled:opacity-50"
          >
            <Icon icon="ph:eye" className="w-4 h-4" />
            <span>View</span>
          </button>

          {localStatus === 'Draft' && (
            <button
              onClick={() => updateStatus('Posted')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-green-600 rounded-md hover:bg-green-50 border border-green-200 disabled:opacity-50"
            >
              <Icon icon="mdi:upload" className="w-4 h-4" />
              <span>{loading ? 'Posting...' : 'Post'}</span>
            </button>
          )}

          {localStatus === 'Posted' && (
            <button
              onClick={() => updateStatus('Archived')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200 disabled:opacity-50"
            >
              <Icon icon="ri:archive-line" className="w-4 h-4" />
              <span>{loading ? 'Archiving...' : 'Archive'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
