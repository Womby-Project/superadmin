import SidebarComponents from '../components/SidebarComponents';
import Header from '../components/HeaderComponent';
import ApprovalsHeader from '../components/ApprovalsComponents/ApprovalsHeader';
import ApprovalsTable, { type Approval } from '../components/ApprovalsComponents/ApprovalsTable';

// Mock data for the approvals list
const approvals: Approval[] = [
  {
    name: 'Dr. Samantha Cruz',
    email: 'example2025@gmail.com',
    licenseNumber: '0012345',
    affiliations: ['United Davao Specialists Hospital and Medical Center', 'Broken shire Medical Center'],
    status: 'Returned'
  },
  {
    name: 'Dr. Samantha Cruz',
    email: 'example2025@gmail.com',
    licenseNumber: '0012345',
    affiliations: ['United Davao Specialists Hospital and Medical Center', 'Davao Doctors Hospital'],
    status: 'Pending'
  },
  {
    name: 'Dr. Samantha Cruz',
    email: 'example2025@gmail.com',
    licenseNumber: '0012345',
    affiliations: ['United Davao Specialists Hospital and Medical Center', 'San Pedro Hospital of Davao City'],
    status: 'Pending'
  },
  {
    name: 'Dr. Samantha Cruz',
    email: 'example2025@gmail.com',
    licenseNumber: '0012345',
    affiliations: ['United Davao Specialists Hospital and Medical Center', 'Brokenshire Medical Center'],
    status: 'Returned'
  },
    {
    name: 'Dr. Samantha Cruz',
    email: 'example2025@gmail.com',
    licenseNumber: '0012345',
    affiliations: ['United Davao Specialists Hospital and Medical Center', 'Brokenshire Medical Center'],
    status: 'Returned'
  },
];

export default function ApprovalPage() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white shadow-md">
              <SidebarComponents />
            </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-6">
            <ApprovalsHeader />
            <ApprovalsTable approvals={approvals} />
          </div>
        </main>
      </div>
    </div>
  );
}

