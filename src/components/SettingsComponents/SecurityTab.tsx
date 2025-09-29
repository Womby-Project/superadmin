import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';

// Reusable component for each settings section card
const FormSection = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500 mt-1 mb-6">{description}</p>
    <div className="max-w-md">{children}</div>
  </div>
);

// Reusable component for a single input field
const InputField = ({ label, type = 'text', id, value, onChange }: { label: string, type?: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#FAD1C9] focus:border-[#E9AEA4]"
    />
  </div>
);

// Component specifically for password fields with a visibility toggle
const PasswordField = ({ label, id, value, onChange }: { label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={isVisible ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#FAD1C9] focus:border-[#E9AEA4]"
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Icon icon={isVisible ? "ph:eye-bold" : "ph:eye-slash-bold"} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Component to display a single password requirement and its validation status
const PasswordRequirement = ({ isValid, text }: { isValid: boolean, text: string }) => (
  <li className={`flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
    <Icon icon={isValid ? "ph:check-circle-fill" : "ph:x-circle-fill"} />
    {text}
  </li>
);

export default function SecurityTab() {
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Memoize password validation results
  const passwordValidations = useMemo(() => {
    const hasLength = newPassword.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);

    return {
      length: hasLength,
      specialChar: hasSpecialChar,
      number: hasNumber,
      case: hasUpperCase && hasLowerCase,
    };
  }, [newPassword]);

  return (
    <>
      {/* Account Information */}
      <FormSection title="Account Information" description="Update administrator's email address.">
        <InputField label="Current Email" id="current-email" value="admin@wombly.com" onChange={() => {}} />
        <InputField label="New Email" id="new-email" value="" onChange={() => {}} />
        <button className="bg-[#E46B64] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#E9AEA4] transition-colors">Update Email</button>
      </FormSection>

      {/* Password Security */}
      <FormSection title="Password Security" description="Update administrator's password for security.">
        <PasswordField label="Old Password" id="old-password" value="" onChange={() => {}} />
        <PasswordField 
          label="New Password" 
          id="new-password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
        />
        <PasswordField label="Repeat New Password" id="repeat-password" value="" onChange={() => {}} />
        <div className="text-xs text-gray-500 mt-2 mb-6">
          <p className="font-medium mb-2">Your password must contain:</p>
          <ul className="space-y-1.5">
            <PasswordRequirement isValid={passwordValidations.length} text="A total of at least 8 characters" />
            <PasswordRequirement isValid={passwordValidations.specialChar} text="A minimum of one special character" />
            <PasswordRequirement isValid={passwordValidations.number} text="A minimum of one number" />
            <PasswordRequirement isValid={passwordValidations.case} text="A combination of lower and upper case letters" />
          </ul>
        </div>
        <button className="bg-[#E46B64] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#E9AEA4] transition-colors">Update Password</button>
      </FormSection>

      {/* Two-Factor Authentication */}
      <FormSection title="Two-Factor Authentication (2FA)" description="Keep your account more secure with 2FA.">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <p className="font-medium text-gray-800">Enable Two-Factor Authentication (2FA)</p>
          <label htmlFor="2fa-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                id="2fa-toggle" 
                className="sr-only peer" 
                checked={twoFactorEnabled} 
                onChange={() => setTwoFactorEnabled(!twoFactorEnabled)} 
              />
              <div className="block bg-gray-300 w-10 h-6 rounded-full peer-checked:bg-[#E46B64]"></div>
              <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-[#E9AEA4]"></div>
            </div>
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-4 mb-6">By enabling this, you will receive a one-time passcode via email every time you log in.</p>
        <button className="bg-[#E46B64] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#E9AEA4] transition-colors">Save</button>
      </FormSection>
    </>
  );
}
