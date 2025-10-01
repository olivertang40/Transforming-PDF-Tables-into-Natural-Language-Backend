'use client';

import { useState } from 'react';

export default function AuditBilling() {
  const [activeTab, setActiveTab] = useState('audit');
  const [dateRange, setDateRange] = useState('7d');
  const [actionFilter, setActionFilter] = useState('all');

  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-22 14:30:25',
      operator: 'System Admin',
      action: 'Task Reassignment',
      target: 'Task #4521',
      result: 'Success',
      ip: '192.168.1.100',
      details: 'Reassigned from John Smith to Sarah Johnson'
    },
    {
      id: 2,
      timestamp: '2024-01-22 13:45:12',
      operator: 'Emily Davis',
      action: 'Organization Created',
      target: 'DataTech Corp',
      result: 'Success',
      ip: '10.0.0.45',
      details: 'New organization with 50GB storage quota'
    },
    {
      id: 3,
      timestamp: '2024-01-22 12:20:08',
      operator: 'System Admin',
      action: 'User Suspended',
      target: 'david.brown@datatech.com',
      result: 'Success',
      ip: '192.168.1.100',
      details: 'Account suspended due to policy violation'
    },
    {
      id: 4,
      timestamp: '2024-01-22 11:15:33',
      operator: 'John Smith',
      action: 'File Upload',
      target: 'Financial Report Q4.pdf',
      result: 'Failed',
      ip: '172.16.0.23',
      details: 'File size exceeded organization quota'
    }
  ];

  const billingData = {
    currentMonth: {
      storage: { used: 245, quota: 500, cost: 49 },
      api: { used: 45600, quota: 100000, cost: 228 },
      tasks: { used: 3420, quota: 10000, cost: 171 }
    },
    trends: [
      { month: 'Jul', storage: 180, api: 32000, tasks: 2100, total: 156 },
      { month: 'Aug', storage: 210, api: 38000, tasks: 2800, total: 189 },
      { month: 'Sep', storage: 235, api: 42000, tasks: 3200, total: 215 },
      { month: 'Oct', storage: 245, api: 45600, tasks: 3420, total: 228 }
    ]
  };

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter === 'all') return true;
    return log.action.toLowerCase().includes(actionFilter.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Audit & Billing</h2>
          <p className="text-sm text-gray-600 mt-1">System audit logs and billing information</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer">
            <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'audit', label: 'Audit Logs', icon: 'ri-file-list-line' },
            { id: 'billing', label: 'Billing & Usage', icon: 'ri-money-dollar-circle-line' }
          ].map((tab) => (
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

      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Audit Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="task">Task Actions</option>
              <option value="user">User Actions</option>
              <option value="organization">Organization Actions</option>
              <option value="file">File Actions</option>
            </select>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Operator</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Target</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Result</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{log.timestamp}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{log.operator}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{log.action}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{log.target}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.result === 'Success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-500">{log.ip}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Current Usage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Storage</h3>
                <i className="ri-database-line w-6 h-6 flex items-center justify-center text-blue-500"></i>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{billingData.currentMonth.storage.used}GB</span>
                  <span className="text-sm text-gray-500">/ {billingData.currentMonth.storage.quota}GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(billingData.currentMonth.storage.used / billingData.currentMonth.storage.quota) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-green-600">${billingData.currentMonth.storage.cost}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">API Calls</h3>
                <i className="ri-code-line w-6 h-6 flex items-center justify-center text-green-500"></i>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{billingData.currentMonth.api.used.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">/ {billingData.currentMonth.api.quota.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(billingData.currentMonth.api.used / billingData.currentMonth.api.quota) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-green-600">${billingData.currentMonth.api.cost}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                <i className="ri-task-line w-6 h-6 flex items-center justify-center text-purple-500"></i>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{billingData.currentMonth.tasks.used.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">/ {billingData.currentMonth.tasks.quota.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(billingData.currentMonth.tasks.used / billingData.currentMonth.tasks.quota) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-green-600">${billingData.currentMonth.tasks.cost}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost Trends</h3>
            <div className="h-64 flex items-end justify-between space-x-4">
              {billingData.trends.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                    <div className="text-center mb-2">
                      <span className="text-sm font-medium text-gray-900">${month.total}</span>
                    </div>
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(month.total / 250) * 160}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}