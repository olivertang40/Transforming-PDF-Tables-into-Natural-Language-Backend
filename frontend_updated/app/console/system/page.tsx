'use client';

import { useState } from 'react';
import SystemOverview from '../../../components/console/SystemOverview';
import OrganizationsManagement from '../../../components/console/OrganizationsManagement';
import UsersRolesManagement from '../../../components/console/UsersRolesManagement';
import TaskAllocation from '../../../components/console/TaskAllocation';
import AuditBilling from '../../../components/console/AuditBilling';
import Emergency from '../../../components/console/Emergency';

export default function SystemAdminConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'organizations', label: 'Organizations', icon: 'ri-building-line' },
    { id: 'users', label: 'Users & Roles', icon: 'ri-team-line' },
    { id: 'allocation', label: 'Task Allocation', icon: 'ri-task-line' },
    { id: 'audit', label: 'Audit & Billing', icon: 'ri-file-list-line' },
    { id: 'emergency', label: 'Emergency', icon: 'ri-alarm-warning-line' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SystemOverview />;
      case 'organizations':
        return <OrganizationsManagement />;
      case 'users':
        return <UsersRolesManagement />;
      case 'allocation':
        return <TaskAllocation />;
      case 'audit':
        return <AuditBilling />;
      case 'emergency':
        return <Emergency />;
      default:
        return <SystemOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Admin Console</h1>
              <p className="text-sm text-gray-600 mt-1">Platform-level governance and emergency management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-shield-check-line w-4 h-4 flex items-center justify-center text-green-500"></i>
                <span>System Admin</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} w-4 h-4 flex items-center justify-center`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}