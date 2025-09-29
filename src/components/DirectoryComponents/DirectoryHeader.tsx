import { Icon } from "@iconify/react";

export default function DirectoryHeader() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">OB-GYN Directory</h1>
        <p className="text-gray-500 mt-1">
          Manage the list of all verified OB-GYNs.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search + Filter grouped */}
        <div className="flex flex-grow gap-4 w-full">
          {/* Search Bar */}
          <div className="relative w-130">
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

          {/* Day Filter */}
          <div className="relative w-48">
            <select className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#E9AEA4] transition">
              <option>Any Day</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
              <option>Sunday</option>
            </select>
            <Icon
              icon="mdi:chevron-down"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none"
            />
          </div>
        </div>

        {/* Sort Button */}
        <button className="flex items-center justify-center gap-2 w-full md:w-auto bg-white border border-gray-300 rounded-lg py-2.5 px-6 hover:bg-gray-50 transition text-gray-600 font-medium">
          <span>Sort</span>
          <Icon icon="ic:round-swap-vert" className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
