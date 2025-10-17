'use client';

import { useState } from 'react';

export default function QualityRisks() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('quality');

  const qualityMetrics = [
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
      title: '退回率',
      value: '5.8%',
      change: '-1.2%',
      changeType: 'positive',
      icon: 'ri-arrow-go-back-line'
    },
    {
      title: '重试次数',
      value: '1.3',
      change: '-0.2',
      changeType: 'positive',
      icon: 'ri-refresh-line'
    }
  ];

  const trendData = [
    { day: 'Mon', passRate: 92, editDistance: 0.15, returnRate: 8 },
    { day: 'Tue', passRate: 89, editDistance: 0.18, returnRate: 11 },
    { day: 'Wed', passRate: 95, editDistance: 0.10, returnRate: 5 },
    { day: 'Thu', passRate: 93, editDistance: 0.12, returnRate: 7 },
    { day: 'Fri', passRate: 96, editDistance: 0.08, returnRate: 4 },
    { day: 'Sat', passRate: 94, editDistance: 0.11, returnRate: 6 },
    { day: 'Sun', passRate: 97, editDistance: 0.09, returnRate: 3 }
  ];

  const riskAnnotators = [
    {
      id: 1,
      name: 'Mike Wilson',
      returnRate: 15.2,
      avgEditDistance: 0.25,
      completedTasks: 23,
      riskLevel: 'high'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      returnRate: 8.1,
      avgEditDistance: 0.14,
      completedTasks: 45,
      riskLevel: 'medium'
    },
    {
      id: 3,
      name: 'John Smith',
      returnRate: 12.3,
      avgEditDistance: 0.19,
      completedTasks: 31,
      riskLevel: 'high'
    }
  ];

  const longWaitingTasks = [
    {
      id: 1,
      fileName: 'Financial Report Q4.pdf',
      tableId: 'Table_3_Page_15',
      assignee: 'Mike Wilson',
      waitingTime: '3.2天',
      priority: 'high',
      status: 'in_progress'
    },
    {
      id: 2,
      fileName: 'Legal Contract.pdf',
      tableId: 'Table_1_Page_8',
      assignee: 'John Smith',
      waitingTime: '2.8天',
      priority: 'medium',
      status: 'qa_pending'
    },
    {
      id: 3,
      fileName: 'Technical Spec.pdf',
      tableId: 'Table_2_Page_12',
      assignee: 'Sarah Johnson',
      waitingTime: '2.1天',
      priority: 'high',
      status: 'in_progress'
    }
  ];

  const getRiskColor = (level: string) => {
    const colorMap: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
  };

  const getRiskLabel = (level: string) => {
    const labelMap: { [key: string]: string } = {
      'low': '低风险',
      'medium': '中风险',
      'high': '高风险'
    };
    return labelMap[level] || level;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: { [key: string]: string } = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-red-600'
    };
    return colorMap[priority] || 'text-gray-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">质量与风险管理</h2>
          <p className="text-sm text-gray-600 mt-1">监控项目质量指标和风险因素</p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">最近7天</option>
          <option value="30d">最近30天</option>
          <option value="90d">最近90天</option>
        </select>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qualityMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className={`${metric.icon} w-5 h-5 flex items-center justify-center text-blue-600`}></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs 上周</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'quality', label: '质量趋势', icon: 'ri-line-chart-line' },
            { id: 'risks', label: '风险分析', icon: 'ri-alert-line' }
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

      {activeTab === 'quality' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QA Pass Rate Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">QA通过率趋势</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {trendData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-center mb-2">
                    <span className="text-xs font-medium text-gray-900">{day.passRate}%</span>
                  </div>
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(day.passRate / 100) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Return Rate Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">退回率趋势</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {trendData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-center mb-2">
                    <span className="text-xs font-medium text-gray-900">{day.returnRate}%</span>
                  </div>
                  <div 
                    className="w-full bg-red-500 rounded-t"
                    style={{ height: `${(day.returnRate / 15) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Risk Annotators */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">高风险标注员</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {riskAnnotators.map((annotator) => (
                <div key={annotator.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {annotator.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{annotator.name}</div>
                        <div className="text-sm text-gray-500">{annotator.completedTasks} 个已完成任务</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(annotator.riskLevel)}`}>
                      {getRiskLabel(annotator.riskLevel)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">退回率:</span>
                      <span className="ml-2 font-medium text-red-600">{annotator.returnRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">编辑距离:</span>
                      <span className="ml-2 font-medium text-gray-900">{annotator.avgEditDistance}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                      重新分配
                    </button>
                    <button className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer">
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Long Waiting Tasks */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">长等待任务</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {longWaitingTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{task.tableId}</div>
                      <div className="text-sm text-gray-500">{task.fileName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">{task.waitingTime}</div>
                      <div className="flex items-center space-x-1">
                        <i className={`ri-flag-line w-3 h-3 flex items-center justify-center ${getPriorityColor(task.priority)}`}></i>
                        <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      分配给: <span className="font-medium">{task.assignee}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                        重新分配
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer">
                        催促
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}