'use client';

import { useState } from 'react';

export default function OrgOverview() {
  const [timeRange, setTimeRange] = useState('week');

  const kpiData = [
    {
      title: '成员数量',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: 'ri-team-line'
    },
    {
      title: '项目数量',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: 'ri-folder-line'
    },
    {
      title: '本周吞吐',
      value: '156',
      change: '+23',
      changeType: 'positive',
      icon: 'ri-file-text-line'
    },
    {
      title: 'QA通过率',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: 'ri-shield-check-line'
    },
    {
      title: '平均TTX',
      value: '2.4h',
      change: '-0.3h',
      changeType: 'positive',
      icon: 'ri-time-line'
    }
  ];

  const topProjects = [
    {
      id: 1,
      name: 'Financial Analysis Q4 2024',
      manager: 'John Smith',
      throughput: 45,
      passRate: 96.2,
      progress: 85
    },
    {
      id: 2,
      name: 'Product Documentation Review',
      manager: 'Sarah Johnson',
      throughput: 38,
      passRate: 92.8,
      progress: 72
    },
    {
      id: 3,
      name: 'Legal Contract Analysis',
      manager: 'Mike Wilson',
      throughput: 32,
      passRate: 94.5,
      progress: 100
    },
    {
      id: 4,
      name: 'Technical Architecture Review',
      manager: 'Emily Davis',
      throughput: 28,
      passRate: 89.3,
      progress: 45
    }
  ];

  const weeklyData = [
    { day: 'Mon', throughput: 22, passRate: 94 },
    { day: 'Tue', throughput: 18, passRate: 91 },
    { day: 'Wed', throughput: 35, passRate: 96 },
    { day: 'Thu', throughput: 28, passRate: 93 },
    { day: 'Fri', throughput: 31, passRate: 95 },
    { day: 'Sat', throughput: 12, passRate: 97 },
    { day: 'Sun', throughput: 10, passRate: 98 }
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
              <span className="text-sm text-gray-500 ml-2">vs 上周</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">本周表现</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                  <div className="text-center mb-2">
                    <span className="text-xs font-medium text-gray-900">{day.throughput}</span>
                  </div>
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(day.throughput / 40) * 160}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
            <span>日吞吐量</span>
          </div>
        </div>

        {/* Top Projects Ranking */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">项目排行榜</h3>
            <p className="text-sm text-gray-600 mt-1">按吞吐量和通过率排序</p>
          </div>
          <div className="divide-y divide-gray-200">
            {topProjects.map((project, index) => (
              <div key={project.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">PM: {project.manager}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{project.throughput} 完成</div>
                    <div className="text-sm text-green-600">{project.passRate}% 通过</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{project.progress}%</span>
                </div>
              </div>
            ))}
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
              action: '新项目创建',
              details: 'John Smith 创建了 "Technical Architecture Review" 项目',
              time: '30分钟前',
              type: 'success'
            },
            {
              action: '成员加入',
              details: '3名新的标注员加入了组织',
              time: '2小时前',
              type: 'info'
            },
            {
              action: '项目完成',
              details: '"Legal Contract Analysis" 项目已完成所有任务',
              time: '5小时前',
              type: 'success'
            },
            {
              action: '质量警告',
              details: '"Product Documentation Review" 项目QA通过率低于90%',
              time: '1天前',
              type: 'warning'
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