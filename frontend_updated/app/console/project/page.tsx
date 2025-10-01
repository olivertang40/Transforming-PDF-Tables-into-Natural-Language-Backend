
'use client';

import { useState } from 'react';
import ProjectOverview from '../../../components/console/ProjectOverview';
import FilesGuidelines from '../../../components/console/FilesGuidelines';
import TaskAssignment from '../../../components/console/TaskAssignment';
import QualityRisks from '../../../components/console/QualityRisks';
import ProjectExport from '../../../components/console/ProjectExport';

export default function ProjectManagerConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Project Overview', icon: 'ri-dashboard-3-line' },
    { id: 'files', label: 'Files & Guidelines', icon: 'ri-file-text-line' },
    { id: 'assignment', label: 'Task Assignment', icon: 'ri-user-add-line' },
    { id: 'quality', label: 'Quality & Risks', icon: 'ri-shield-check-line' },
    { id: 'export', label: 'Data Export', icon: 'ri-download-line' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProjectOverview />;
      case 'files':
        return <FilesGuidelines />;
      case 'assignment':
        return <TaskAssignment />;
      case 'quality':
        return <QualityRisks />;
      case 'export':
        return <ProjectExport />;
      default:
        return <ProjectOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Manager Console</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your projects and task assignments</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-folder-3-line w-4 h-4 flex items-center justify-center text-green-500"></i>
                <span>Financial Analysis Q4 2024</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-user-settings-line w-4 h-4 flex items-center justify-center text-purple-500"></i>
                <span>Project Manager</span>
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
