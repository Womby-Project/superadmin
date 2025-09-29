// You will need to add this import
import { Icon } from '@iconify/react';

import SidebarComponents from '../components/SidebarComponents';
import Header from '../components/HeaderComponent';
import ServiceCard, { type Service } from '../components/ServiceFeeComponents/ServiceCard';

const stats = [
  {
    title: 'Total Revenue',
    value: '₱4,500',
    period: 'This month',
    icon: 'ph:money-bold',
    iconBgColor: 'bg-red-100',
    iconTextColor: 'text-red-500',
  },
  {
    title: 'Total Bookings',
    value: '57',
    period: 'All time',
    icon: 'ph:calendar-bold',
    iconBgColor: 'bg-red-100',
    iconTextColor: 'text-red-500',
  },
];

const services: Service[] = [
  {
    title: 'Standard Consultation',
    description: 'Book a single session when you need it most.',
    price: '₱500.00',
    duration: '20 minutes',
    features: [
      '20-minute video consultation with a licensed OB-GYN.',
      'Discussion of current concerns (e.g. symptoms, discomfort, questions about pregnancy/postpartum).',
      'Recommendations for medication, lifestyle, or further tests (if necessary).',
    ],
    bookings: 41,
    revenue: '20,500',
  },
  {
    title: 'Extended Care Subscription',
    description: 'Stay connected with your OB-GYN for ongoing support and closer monitoring.',
    price: '₱649.00',
    duration: '20 to 30 minutes',
    features: [
      '20 to 30 minutes video consultation with a licensed OB-GYN.',
      'Discussion of current concerns (e.g. symptoms, discomfort, questions about pregnancy/postpartum).',
      'Recommendations for medication, lifestyle, or further tests (if necessary).',
      'In-app chat messaging with your OB-GYN for minor concerns or queries.',
    ],
    bookings: 41,
    revenue: '20,500',
  },
];

export default function ServiceFeePage() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white shadow-md">
        <SidebarComponents />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-8">
            {/* Main header rendered once */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Service Fees</h1>
              <p className="text-gray-500 mt-1">Manage pricing and track revenue of your services.</p>
            </div>

            {/* Grid for the statistic cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.title} className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.iconBgColor}`}>
                      <Icon icon={stat.icon} className={`h-6 w-6 ${stat.iconTextColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                      <p className="text-xs text-gray-400">{stat.period}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Grid for the service details (unchanged) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <ServiceCard key={index} service={service} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}