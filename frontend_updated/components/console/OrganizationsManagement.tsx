'use client';

import { useState } from 'react';

export default function OrganizationsManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const organizations = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      storageUsed: 45,
      storageQuota: 100,
      apiUsed: 12450,
      apiQuota: 50000,
      tasksUsed: 2340,
      tasksQuota: 10000,
      status: 'active',
      members: 24,
      projects: 8,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'DataTech Corp',
      storageUsed: 78,
      storageQuota: 50,
      apiUsed: 8900,
      apiQuota: 25000,
      tasksUsed: 1890,
      tasksQuota: 5000,
      status: 'active',
      members: 12,
      projects: 3,
      createdAt: '2024-02-01'
    },
    {
      id: 3,
      name: 'FinanceFlow Inc',
      storageUsed: 23,
      storageQuota: 75,
      apiUsed: 3400,
      apiQuota: 30000,
      tasksUsed: 890,
      tasksQuota: 8000,
      status: 'suspended',
      members: 18,
      projects: 5,
      createdAt: '2023-12-10'
    }
  ];

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getUsageColor = (used: number, quota: number) => {
    const percentage = (used / quota) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Organizations Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage organization quotas and settings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
          <span>New Organization</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search organizations..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Organization</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Storage Quota</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">API Quota</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Task Quota</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.members} members • {org.projects} projects</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{org.storageUsed}GB / {org.storageQuota}GB</span>
                        <span className="text-gray-500">{Math.round((org.storageUsed / org.storageQuota) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getUsageColor(org.storageUsed, org.storageQuota)}`}
                          style={{ width: `${Math.min((org.storageUsed / org.storageQuota) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{org.apiUsed.toLocaleString()} / {org.apiQuota.toLocaleString()}</span>
                        <span className="text-gray-500">{Math.round((org.apiUsed / org.apiQuota) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getUsageColor(org.apiUsed, org.apiQuota)}`}
                          style={{ width: `${Math.min((org.apiUsed / org.apiQuota) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{org.tasksUsed.toLocaleString()} / {org.tasksQuota.toLocaleString()}</span>
                        <span className="text-gray-500">{Math.round((org.tasksUsed / org.tasksQuota) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getUsageColor(org.tasksUsed, org.tasksQuota)}`}
                          style={{ width: `${Math.min((org.tasksUsed / org.tasksQuota) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      org.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {org.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer">
                        Edit
                      </button>
                      <button className={`text-sm cursor-pointer ${
                        org.status === 'active' 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-green-600 hover:text-green-700'
                      }`}>
                        {org.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrgs.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <i className="ri-building-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations yet</h3>
          <p className="text-gray-600 mb-4">Create one to start managing document annotation projects</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer"
          >
            Create Organization
          </button>
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Organization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter organization name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage (GB)
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Calls
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasks
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Create Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}