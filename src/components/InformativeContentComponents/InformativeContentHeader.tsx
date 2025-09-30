import { Icon } from "@iconify/react";
import { useState } from "react";
import AddArticleModal from "../modals/AddArticle";

interface InformativeContentHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  onAdd: (url: string) => void; // callback passed from parent
}

export default function InformativeContentHeader({
  search,
  setSearch,
  onAdd,
}: InformativeContentHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Informative Content</h1>
          <p className="text-gray-500 mt-1">
            Manage and review articles for your community.
          </p>
        </div>

        {/* Controls: Search + Add */}
        <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
          {/* Search input */}
          <div className="relative flex-grow w-full">
            <Icon
              icon="ic:round-search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"
            />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E9AEA4] transition"
            />
          </div>

          {/* Add Article Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#E46B64] text-white rounded-md py-2.5 px-4 hover:shadow-lg transition w-full md:w-auto"
          >
            <Icon icon="ic:round-add" className="h-5 w-5" />
            <span className="whitespace-nowrap leading-none cursor-pointer">
              Add Article by URL
            </span>
          </button>
        </div>
      </div>

      {/* Modal */}
      <AddArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(url) => {
          onAdd(url); // call parent
          setIsModalOpen(false); // close modal
        }}
      />
    </>
  );
}
