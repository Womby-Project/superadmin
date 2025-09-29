import { Icon } from '@iconify/react';

export interface Article {
  image: string;
  title: string;
  status: 'Posted' | 'Archived' | 'Draft';
  description: string;
  publishedDate: string;
  source: string;
  fetchedDate: string;
}

interface ContentCardProps {
  article: Article;
  onView: (article: Article) => void;
}

const statusStyles = {
  Posted: 'bg-green-100 text-green-800',
  Archived: 'bg-gray-100 text-gray-800',
  Draft: 'bg-yellow-100 text-yellow-800',
};

export default function ContentCard({ article, onView }: ContentCardProps) {
  const { image, title, status, description, publishedDate, source, fetchedDate } = article;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <img
        className="h-48 w-full object-cover"
        src={image}
        alt={title}
      />
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-md font-bold text-gray-800 mb-2">{title}</h3>

        <div className="mb-3">
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusStyles[status]}`}>
            {status}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 flex-grow">{description}</p>

        <div className="text-xs text-gray-400 space-y-2 mb-4">
          <div className="flex items-center gap-1">
            <Icon icon="octicon:calendar-24" className="w-4 h-4" />
            <span className="font-semibold text-gray-500">Published:</span> {publishedDate}
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="ion:open-outline" className="w-4 h-4" />
            <span className="font-semibold text-gray-500">Source:</span> {source}
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:web" className="w-4 h-4" />
            <span className="font-semibold text-gray-500">Fetched:</span> {fetchedDate}
          </div>
        </div>

        {/* Action Buttons with Conditional Logic */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
          <button 
            onClick={() => onView(article)} 
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200"
          >
            <Icon icon="ph:eye" className="w-4 h-4" />
            <span>View</span>
          </button>

          {status === 'Draft' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 border border-red-200">
              <Icon icon="mdi:upload" className="w-4 h-4" />
              <span>Post</span>
            </button>
          )}

          {status === 'Posted' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200">
              <Icon icon="ri:archive-line" className="w-4 h-4" />
              <span>Archive</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}