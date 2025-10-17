'use client';

import { useState } from 'react';
import OrgOverview from '../../../components/console/OrgOverview';
import MembersRoles from '../../../components/console/MembersRoles';
import ProjectsList from '../../../components/console/ProjectsList';
import AllocationRules from '../../../components/console/AllocationRules';
import OrgAnalytics from '../../../components/console/OrgAnalytics';

export default function OrgAdminConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Org Overview', icon: 'ri-pie-chart-line' },
    { id: 'members', label: 'Members & Roles', icon: 'ri-team-line' },
    { id: 'projects', label: 'Projects', icon: 'ri-folder-line' },
    { id: 'rules', label: 'Allocation Rules', icon: 'ri-settings-3-line' },
    { id: 'analytics', label: 'Org Analytics', icon: 'ri-bar-chart-line' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OrgOverview />;
      case 'members':
        return <MembersRoles />;
      case 'projects':
        return <ProjectsList />;
      case 'rules':
        return <AllocationRules />;
      case 'analytics':
        return <OrgAnalytics />;
      default:
        return <OrgOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization Admin Console</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your organization's projects and members</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-building-line w-4 h-4 flex items-center justify-center text-blue-500"></i>
                <span>TechCorp Solutions</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-user-star-line w-4 h-4 flex items-center justify-center text-orange-500"></i>
                <span>Org Admin</span>
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