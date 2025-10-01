'use client';

import { useState } from 'react';

export default function ProjectOverview() {
  const [timeRange, setTimeRange] = useState('7d');

  const kpiData = [
    {
      title: '今日完成',
      value: '23',
      change: '+5',
      changeType: 'positive',
      icon: 'ri-check-line'
    },
    {
      title: 'QA通过率',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: 'ri-shield-check-line'
    },
    {
      title: '平均编辑距离',
      value: '0.12',
      change: '-0.03',
      changeType: 'positive',
      icon: 'ri-edit-line'
    },
    {
      title: '平均TTX',
      value: '2.4h',
      change: '-0.3h',
      changeType: 'positive',
      icon: 'ri-time-line'
    }
  ];

  const statusData = [
    { status: 'pending', count: 12, color: 'bg-yellow-500' },
    { status: 'in_progress', count: 18, color: 'bg-blue-500' },
    { status: 'qa_pending', count: 8, color: 'bg-orange-500' },
    { status: 'completed', count: 45, color: 'bg-green-500' }
  ];

  const burndownData = [
    { day: 'Mon', remaining: 83, completed: 0 },
    { day: 'Tue', remaining: 78, completed: 5 },
    { day: 'Wed', remaining: 65, completed: 18 },
    { day: 'Thu', remaining: 52, completed: 31 },
    { day: 'Fri', remaining: 41, completed: 42 },
    { day: 'Sat', remaining: 35, completed: 48 },
    { day: 'Sun', remaining: 28, completed: 55 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <span className="text-sm text-gray-500 ml-2">vs 上周</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">燃尽图</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {burndownData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(day.completed / 83) * 160}px` }}
                  ></div>
                  <div 
                    className="w-full bg-gray-300"
                    style={{ height: `${(day.remaining / 83) * 160}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">已完成</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-gray-600">剩余</span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">状态分布</h3>
          <div className="space-y-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700 capitalize">
                    {item.status === 'pending' ? '待处理' :
                     item.status === 'in_progress' ? '进行中' :
                     item.status === 'qa_pending' ? 'QA待审' : '已完成'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / 83) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">总计</span>
              <span className="font-medium text-gray-900">83 个任务</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">最近活动</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            {
              action: '任务完成',
              details: 'Sarah Johnson 完成了 Financial Report Q4.pdf 的标注',
              time: '5分钟前',
              type: 'success'
            },
            {
              action: 'QA退回',
              details: 'Product Specification.pdf 被QA退回，需要重新标注',
              time: '1小时前',
              type: 'warning'
            },
            {
              action: '新任务分配',
              details: 'Legal Contract.pdf 已分配给 Mike Wilson',
              time: '2小时前',
              type: 'info'
            },
            {
              action: '文件上传',
              details: '新文件 Technical Architecture.pdf 已上传',
              time: '3小时前',
              type: 'success'
            }
          ].map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <i className={`w-4 h-4 flex items-center justify-center ${
                    activity.type === 'success' ? 'ri-check-line text-green-600' :
                    activity.type === 'warning' ? 'ri-alert-line text-yellow-600' : 'ri-information-line text-blue-600'
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