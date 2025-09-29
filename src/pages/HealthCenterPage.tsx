import SidebarComponents from '../components/SidebarComponents';
import Header from '../components/HeaderComponent';
import HealthCenterHeader from '../components/HealthCenterComponents/HealthCenterHeader';
import HealthCenterCard, { type HealthCenter } from '../components/HealthCenterComponents/HealthCenterCard';

// Mock data for the health centers list
const healthCenters: HealthCenter[] = [
  {
    name: 'Catalunan Pequeño Health Center',
    address: '3GG9+97C, Talomo, Davao City, Davao del Sur',
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contactInfo: {
      phone1: '+63 929 555 7327',
      phone2: '(082) 241 1000',
    }
  },
  {
    name: 'Catalunan Pequeño Health Center',
    address: '3GG9+97C, Talomo, Davao City, Davao del Sur',
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contactInfo: {
      phone1: '+63 929 555 7327',
      phone2: '(082) 241 1000',
    }
  },
  {
    name: 'Catalunan Pequeño Health Center',
    address: '3GG9+97C, Talomo, Davao City, Davao del Sur',
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contactInfo: {
      phone1: '+63 929 555 7327',
      phone2: '(082) 241 1000',
    }
  },
  {
    name: 'Catalunan Pequeño Health Center',
    address: '3GG9+97C, Talomo, Davao City, Davao del Sur',
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contactInfo: {
      phone1: '+63 929 555 7327',
      phone2: '(082) 241 1000',
    }
  },
    {
    name: 'Catalunan Pequeño Health Center',
    address: '3GG9+97C, Talomo, Davao City, Davao del Sur',
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contactInfo: {
      phone1: '+63 929 555 7327',
      phone2: '(082) 241 1000',
    }
  },
      {
    name: 'Catalunan Pequeño Health Center',
    address: '3GG9+97C, Talomo, Davao City, Davao del Sur',
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contactInfo: {
      phone1: '+63 929 555 7327',
      phone2: '(082) 241 1000',
    }
  },
];

export default function HealthCenterPage() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white shadow-md">
        <SidebarComponents />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-6">
            <HealthCenterHeader />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {healthCenters.map((center, index) => (
                <HealthCenterCard key={index} center={center} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

