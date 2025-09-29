import { Icon } from '@iconify/react';
import { useState } from 'react';
import EditServiceModal from '../modals/EditService'; 

export interface Service {
  title: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
  bookings: number;
  revenue: string;
}

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service: initialService }: ServiceCardProps) {
  const [service, setService] = useState(initialService);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (updatedService: Service) => {
    // Here you would typically make an API call to save the data.
    // For this example, we'll just update the local state.
    console.log("Saving changes:", updatedService);
    setService(updatedService);
    setIsModalOpen(false); // Close the modal on save
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
            <p className="text-sm text-gray-500">{service.description}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="text-gray-400 hover:text-[#E9AEA4]"
          >
            <Icon icon="ph:pencil-simple-bold" className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-800">{service.price}</p>
          <p className="text-sm text-gray-500">{service.duration}</p>
        </div>

        <ul className="space-y-2 mb-6 text-sm text-gray-600 flex-grow">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Icon icon="ph:check-circle-bold" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-200 pt-4 flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Total Bookings</p>
            <p className="font-bold text-gray-800">{service.bookings}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Revenue Last Month</p>
            <p className="font-bold text-gray-800">₱{service.revenue}</p>
          </div>
        </div>
      </div>

      <EditServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        service={service}
      />
    </>
  );
}

