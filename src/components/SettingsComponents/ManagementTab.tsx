import React from 'react';
import { Icon } from '@iconify/react';

// Section card wrapper
const ManagementSection = ({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    {/* Header */}
    <div className="flex items-start gap-3">
      <Icon icon={icon} className="h-6 w-6 text-[#E46B64]" />
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>

    {/* Content - removed pl-9 */}
    <div className="mt-6 space-y-4">{children}</div>
  </div>
);


// Input field with label (only for Send Announcement)
const InputField = ({ label, id }: { label: string; id: string }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {label}
    </label>
    <input
      type="text"
      id={id}
      className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAD1C9] focus:border-[#E46B64]"
    />
  </div>
);

// Textarea (with optional label)
const TextAreaField = ({
  label,
  id,
  placeholder,
  rows = 5,
}: {
  label?: string;
  id: string;
  placeholder: string;
  rows?: number;
}) => (
  <div>
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>
    )}
    <textarea
      id={id}
      rows={rows}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAD1C9] focus:border-[#E46B64]"
    />
  </div>
);

// File upload + button + last updated
const FileUploadSection = ({
  buttonText,
  lastUpdated,
}: {
  buttonText: string;
  lastUpdated: string;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
        <Icon icon="ph:upload-simple-bold" className="h-5 w-5" />
        Upload File
      </button>
      <p className="text-sm text-gray-500">or paste content directly above</p>
    </div>

    <div className="flex items-center justify-between">
      <button className="bg-[#E46B64] text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-[#d85b56] transition-colors">
        {buttonText}
      </button>
      <p className="text-xs text-gray-400">Last Updated: {lastUpdated}</p>
    </div>
  </div>
);

export default function ManagementTab() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Send Announcement */}
      <ManagementSection
        icon="ph:paper-plane-tilt-fill"
        title="Send Announcement"
        description="Send customized notifications to all users."
      >
        <InputField label="Subject" id="announcement-subject" />
        <TextAreaField
          label="Message Content"
          id="announcement-message"
          placeholder="Enter announcement message..."
          rows={6}
        />
        <button className="bg-[#E46B64] text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-[#d85b56] transition-colors">
          Send Announcement
        </button>
      </ManagementSection>

      {/* Privacy Policy */}
      <ManagementSection
        icon="ph:file-text-fill"
        title="Privacy Policy"
        description="Update the app's privacy policy."
      >
        <TextAreaField
          id="privacy-policy"
          placeholder="Enter privacy policy content..."
          rows={7}
        />
        <FileUploadSection
          buttonText="Update Privacy Policy"
          lastUpdated="August 14, 2025"
        />
      </ManagementSection>

      {/* Terms & Conditions */}
      <ManagementSection
        icon="ph:file-text-fill"
        title="Terms & Conditions"
        description="Update the app's terms and conditions."
      >
        <TextAreaField
          id="terms-conditions"
          placeholder="Enter terms and conditions content..."
          rows={7}
        />
        <FileUploadSection
          buttonText="Update Terms & Conditions"
          lastUpdated="August 14, 2025"
        />
      </ManagementSection>
    </div>
  );
}
