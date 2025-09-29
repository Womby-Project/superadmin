import { Icon } from '@iconify/react';

const activityLogs = [
    { timestamp: '2025 August 31 14:30', category: 'System', action: 'Announcement Sent', description: 'Email announcement sent to 2,847 users.' },
    { timestamp: '2025 August 31 14:30', category: 'User', action: 'OB-GYN Approval', description: 'Dr. Aivee Rose Santos\' application has been approved.' },
    { timestamp: '2025 August 31 14:30', category: 'System', action: 'Admin Login Activity', description: 'A login to the Admin account has been detected.' },
    { timestamp: '2025 August 31 14:30', category: 'Forums', action: 'Forum Post Approval', description: 'A forum post by @basename has been approved.' },
    { timestamp: '2025 August 31 14:30', category: 'Forums', action: 'Reported Forum Post', description: 'A reported forum post has been reviewed and taken down.' },
];

const CategoryBadge = ({ category }: { category: string }) => {
    const icons: { [key: string]: string } = {
        'System': 'mi:computer',
        'User': 'proicons:person',
        'Forums': 'octicon:comment-discussion-16'
    };
    return (
        <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-2">
            <Icon icon={icons[category] || 'ph:question-fill'} className="h-4 w-4" />
            {category}
        </div>
    );
};

export default function ActivityTab() {
  return (
    <div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
                <Icon icon="ic:round-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E9AEA4]"
                />
            </div>
            <div className="relative w-full md:w-48">
                <select className="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#E9AEA4]">
                    <option>All Categories</option>
                    <option>System</option>
                    <option>User</option>
                    <option>Forums</option>
                </select>
                <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>
            <button className="flex items-center justify-center gap-2 w-full md:w-auto bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition">
                <span>Sort</span>
                <Icon icon="ic:round-swap-vert" className="h-5 w-5 text-gray-500" />
            </button>
        </div>

        {/* Activity Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {activityLogs.map((log, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{log.timestamp}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <CategoryBadge category={log.category} />
                            </td>   
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                <p className="font-semibold">{log.action}</p>
                                <p className="text-gray-500">{log.description}</p>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}
