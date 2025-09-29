
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function SidebarComponents() {
    return (
        <aside className="fixed left-0 w-[260px] bg-white border-r h-screen shadow-md flex flex-col border-gray-200 overflow-hidden">
            {/* Logo and App Name */}
            <div className="h-15 flex items-center px-4 border-b border-gray-200 space-x-3 py-3 pl-6">
                <img
                    src="/src/assets/wombly-logo.png"
                    alt="womblylogo"
                    className="w-[40px] h-[40px] bg-[#FCF5EE] rounded-lg"
                />
                <div>
                    <h1 className="text-[17px] font-semibold text-gray-900 pr-15">Wombly</h1>
                    <p className="text-[13px] text-gray-500 pr-6">OBGYN-Dashboard</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col justify-between flex-1 pt-2">
                <div>
                    {/* Overview Section */}
                    <p className="ml-8 mt-3 text-[12px] font-semibold text-left text-gray-400 uppercase mb-1 tracking-wider">
                        OVERVIEW
                    </p>
                    <nav className="px-8 space-y-1">
                        <SidebarLink icon={<Icon icon="ph:house-bold" className='h-5 w-5' />} text="Dashboard" to="/" />
                    </nav>


                    {/* OBGYN's Section */}
                    <p className="ml-8 mt-4 text-[12px] font-semibold text-left text-gray-400 uppercase mb-1 tracking-wider">
                        OB-GYNS
                    </p>
                    <nav className="px-8 space-y-1">
                        <SidebarLink icon={<Icon icon="jam:medical" className='h-5 w-5' />} text="Directory" to="/obgyndirectory" />
                        <SidebarLink icon={<Icon icon="mingcute:send-fill" className='h-5 w-5' />} text="Approvals" to="/aprrovals-list" />
                    </nav>
                    {/* Community & Content Section */}
                    <p className="ml-8 mt-4 text-[12px] font-semibold text-left text-gray-400 uppercase mb-1 tracking-wider">
                        COMMUNITY & CONTENT
                    </p>
                    <nav className="px-8 space-y-1">
                        <SidebarLink icon={<Icon icon="ic:baseline-people-alt" className='h-5 w-5' />} text="Forum" to="/forum-management" />
                        <SidebarLink icon={<Icon icon="mingcute:hospital-fill" className='h-5 w-5' />} text="Health Centers" to="/healthcenter-management" />
                        <SidebarLink icon={<Icon icon="material-symbols:library-books-rounded" className='h-5 w-5' />} text="Informative Content" to="/informative-content" />
                    </nav>
                     {/* Pricing Section */}
                    <p className="ml-8 mt-4 text-[12px] font-semibold text-left text-gray-400 uppercase mb-1 tracking-wider">
                        Pricing
                    </p>
                    <nav className="px-8 space-y-1">
                        <SidebarLink icon={<Icon icon="ic:twotone-payment" className='h-5 w-5' />} text="Service Fee" to="/service-fee" />
                    </nav>
                </div>

                {/* Account Settings at bottom */}
                <div className="px-8 mb-4 space-y-1">
                    <p className="text-[12px] font-semibold uppercase text-left text-gray-400 mb-1 tracking-wider">
                        Account
                    </p>
                    <SidebarLink icon={<Icon icon="ph:gear-six-bold" className='h-5 w-5' />} text="Settings" to="/settings" />
                    <SidebarLink icon={<Icon icon="ph:sign-out-bold" className='h-5 w-5' />} text="Logout" to="/logout" />
                </div>
            </div>
        </aside>
    );
}

type SidebarLinkProps = {
    icon: React.ReactNode;
    text: string;
    to: string;
};

function SidebarLink({ icon, text, to }: SidebarLinkProps) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
            }
        >
            {icon}
            <span className="text-base font-medium">{text}</span>
        </NavLink>
    );
}

