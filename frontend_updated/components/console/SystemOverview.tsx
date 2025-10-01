'use client';

import { useState } from 'react';

export default function SystemOverview() {
  const [timeRange, setTimeRange] = useState('7d');

  const kpiData = [
    {
      title: 'Active Organizations',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: 'ri-building-line'
    },
    {
      title: 'Total Users',
      value: '1,247',
      change: '+89',
      changeType: 'positive',
      icon: 'ri-team-line'
    },
    {
      title: 'Today Throughput',
      value: '3,456',
      change: '+12%',
      changeType: 'positive',
      icon: 'ri-file-text-line'
    },
    {
      title: 'Failure Rate',
      value: '2.3%',
      change: '-0.5%',
      changeType: 'positive',
      icon: 'ri-error-warning-line'
    },
    {
      title: 'API Cost',
      value: '$12,450',
      change: '+8%',
      changeType: 'negative',
      icon: 'ri-money-dollar-circle-line'
    }
  ];

  const trendData = [
    { name: 'Mon', parsing: 2400, success: 95, return: 5 },
    { name: 'Tue', parsing: 1398, success: 92, return: 8 },
    { name: 'Wed', parsing: 9800, success: 98, return: 2 },
    { name: 'Thu', parsing: 3908, success: 94, return: 6 },
    { name: 'Fri', parsing: 4800, success: 96, return: 4 },
    { name: 'Sat', parsing: 3800, success: 93, return: 7 },
    { name: 'Sun', parsing: 4300, success: 97, return: 3 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className={`${kpi.icon} w-5 h-5 flex items-center justify-center text-blue-600`}></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parsing Throughput Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Parsing Throughput</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {trendData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(day.parsing / 10000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{day.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">LLM Success Rate & P95</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Success Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Return Rate</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {trendData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(day.success / 100) * 180}px` }}
                  ></div>
                  <div 
                    className="w-full bg-red-500"
                    style={{ height: `${(day.return / 100) * 180}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{day.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Activities</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            {
              action: 'New organization created',
              details: 'DataTech Corp registered with 50GB storage quota',
              time: '2 minutes ago',
              type: 'success'
            },
            {
              action: 'Emergency task reallocation',
              details: 'Task #4521 reassigned from John Smith to Sarah Johnson',
              time: '15 minutes ago',
              type: 'warning'
            },
            {
              action: 'API quota exceeded',
              details: 'TechCorp Solutions reached 95% of monthly API limit',
              time: '1 hour ago',
              type: 'error'
            },
            {
              action: 'Bulk user import completed',
              details: '45 new annotators added to FinanceFlow Inc',
              time: '2 hours ago',
              type: 'success'
            }
          ].map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <i className={`w-4 h-4 flex items-center justify-center ${
                    activity.type === 'success' ? 'ri-check-line text-green-600' :
                    activity.type === 'warning' ? 'ri-alert-line text-yellow-600' : 'ri-error-warning-line text-red-600'
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}