import { Icon } from '@iconify/react';
import { useState } from 'react';
import AddArticleModal from '../modals/AddArticle'; // Adjust path if needed

export default function InformativeContentHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddArticle = (url: string) => {
    // Here, you would typically make an API call to your backend
    // to process the URL and create the new article.
    console.log("Adding article from URL:", url);
    setIsModalOpen(false); // Close the modal on save
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Informative Content</h1>
          <p className="text-gray-500 mt-1">
            Manage and review articles for your community.
          </p>
        </div>

        {/* Controls (Search, Sort, Add) */}
        <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
          <div className="flex flex-grow gap-4 w-full">
          {/* Search Bar */}
          <div className="relative flex-grow">
              <Icon
                icon="ic:round-search"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-12 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E9AEA4] transition"
              />
            </div>

          {/* Sort Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <span>Sort</span>
            <Icon icon="ph:arrows-down-up-bold" className="h-4 w-4" />
          </button>
          </div>

          {/* Add Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#E46B64] text-white rounded-md py-2.5 px-4 hover:bg-[#E9AEA4] transition w-full md:w-auto"
          >
            <Icon icon="ic:round-add" className="h-5 w-5" />
            <span className="whitespace-nowrap leading-none">Add Article by URL</span>
          </button>
        </div>
      </div>

      <AddArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddArticle}
      />
    </>
  );
}
