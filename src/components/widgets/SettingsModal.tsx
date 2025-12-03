import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'integrations' | 'billing' | 'invoices' | 'security' | 'notifications-settings';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'billing', label: 'Manage Billing' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'security', label: 'Security' },
    { id: 'notifications-settings', label: 'Notifications' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Personal Profile</h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1">This is how your profile looks to others.</p>
            </div>
            <div className="flex items-center gap-4">
              <img 
                src="https://placehold.co/64x64/e2e8f0/64748b?text=U" 
                className="w-16 h-16 rounded-full object-cover" 
                alt="User Avatar" 
              />
              <div>
                <button className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                  Change
                </button>
                <button className="p-2 text-slate-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-900 dark:text-white">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                defaultValue="User Name"
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white/70 dark:bg-slate-700/50 text-slate-900 dark:text-white p-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-white">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue="user.name@example.com"
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white/70 dark:bg-slate-700/50 text-slate-900 dark:text-white p-2"
              />
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Integrations</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Connect your favorite apps to streamline your workflow.</p>
          </div>
        );

      case 'billing':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Manage Billing</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Update your payment method and view your subscription details.</p>
          </div>
        );

      case 'invoices':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Invoices</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Review and download your past invoices.</p>
          </div>
        );

      case 'security':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Security</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your password and two-factor authentication.</p>
          </div>
        );

      case 'notifications-settings':
        return (
          <div>
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Notification Settings</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Choose how and when you want to be notified.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-slate-700 m-4 flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 flex-shrink-0 border-b border-white/30 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-grow overflow-hidden">
          {/* Left Navigation */}
          <nav className="w-1/4 p-4 border-r border-white/30 dark:border-slate-700 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`settings-tab w-full text-left hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      activeTab === tab.id ? 'active' : ''
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Content Panels */}
          <div className="w-3/4 p-6 overflow-y-auto custom-scrollbar">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex-shrink-0 flex items-center justify-end gap-4 border-t border-white/30 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

