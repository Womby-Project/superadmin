import React from "react";
import { Icon } from "@iconify/react";

export type SortOrder = "newest" | "oldest";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortOrder: SortOrder;
  onToggleSort: () => void;
  availableTags?: string[];
  onTagClick?: (tag: string) => void;
  disableTags?: boolean;
  placeholder?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  sortOrder,
  onToggleSort,
  availableTags = [],
  onTagClick,
  disableTags = false,
  placeholder = "Search posts...",
}) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow mb-6 flex items-center justify-between">
      {/* --- Left Section: Search + Tags --- */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon icon="feather:search" className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minWidth: "300px" }}
          />
        </div>

        {/* Tags Dropdown (optional) */}
        <div className="relative">
          <button
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disableTags}
          >
            <span>Tags</span>
            <Icon icon="feather:chevron-down" className="ml-2 h-5 w-5" />
          </button>

          {/* Simple dropdown list — replace with menu later */}
          {availableTags.length > 0 && !disableTags && (
            <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-48">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Right Section: Sort Button --- */}
      <div>
        <button
          onClick={onToggleSort}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>Sort</span>
          <Icon
            icon="heroicons-outline:switch-vertical"
            className="ml-2 h-5 w-5 text-gray-500"
          />
          <span className="ml-1 text-xs text-gray-400 capitalize">{sortOrder}</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
