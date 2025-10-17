'use client';

import { useState } from 'react';

export default function OrgAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('throughput');

  const projectMetrics = [
    {
      name: 'Financial Analysis Q4 2024',
      manager: 'John Smith',
      throughput: 156,
      returnRate: 5.2,
      editDistance: 0.08,
      trend: 'up'
    },
    {
      name: 'Product Documentation Review',
      manager: 'Sarah Johnson',
      throughput: 142,
      returnRate: 7.8,
      editDistance: 0.12,
      trend: 'down'
    },
    {
      name: 'Legal Contract Analysis',
      manager: 'Mike Wilson',
      throughput: 89,
      returnRate: 3.1,
      editDistance: 0.06,
      trend: 'up'
    },
    {
      name: 'Technical Architecture Review',
      manager: 'Emily Davis',
      throughput: 67,
      returnRate: 12.5,
      editDistance: 0.18,
      trend: 'down'
    }
  ];

  const throughputData = [
    { week: 'W1', financial: 45, product: 38, legal: 25, technical: 18 },
    { week: 'W2', financial: 52, product: 42, legal: 28, technical: 22 },
    { week: 'W3', financial: 38, product: 35, legal: 20, technical: 15 },
    { week: 'W4', financial: 21, product: 27, legal: 16, technical: 12 }
  ];

  const returnRateData = [
    { week: 'W1', financial: 4.2, product: 6.8, legal: 2.1, technical: 15.2 },
    { week: 'W2', financial: 5.8, product: 8.2, legal: 3.5, technical: 12.8 },
    { week: 'W3', financial: 6.1, product: 7.5, legal: 2.8, technical: 11.5 },
    { week: 'W4', financial: 4.8, product: 8.8, legal: 4.2, technical: 10.8 }
  ];

  const anomalies = [
    {
      type: 'high_return_rate',
      project: 'Technical Architecture Review',
      manager: 'Emily Davis',
      value: '12.5%',
      description: 'QA退回率异常偏高',
      severity: 'high',
      files: ['Architecture_Design_v2.pdf', 'System_Overview.pdf']
    },
    {
      type: 'low_throughput',
      project: 'Legal Contract Analysis',
      manager: 'Mike Wilson',
      value: '16 tasks/week',
      description: '吞吐量低于预期',
      severity: 'medium',
      files: ['Contract_Terms.pdf']
    },
    {
      type: 'high_edit_distance',
      project: 'Product Documentation Review',
      manager: 'Sarah Johnson',
      value: '0.18',
      description: '编辑距离偏高，需要关注质量',
      severity: 'medium',
      files: ['Product_Spec_v3.pdf', 'Feature_Requirements.pdf']
    }
  ];

  const getSeverityColor = (severity: string) => {
    const colorMap: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colorMap[severity] || 'bg-gray-100 text-gray-800';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 'ri-arrow-up-line text-green-600' : 'ri-arrow-down-line text-red-600';
  };

  const projectColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">组织级分析</h2>
          <p className="text-sm text-gray-600 mt-1">深入分析组织内各项目的表现和趋势</p>
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

      {/* Project Performance Overview */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">项目表现概览</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">项目</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">负责人</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">吞吐量</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">QA退回率</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">编辑距离</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">趋势</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projectMetrics.map((project, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{project.manager}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900">{project.throughput}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${
                      project.returnRate > 10 ? 'text-red-600' : 
                      project.returnRate > 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {project.returnRate}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${
                      project.editDistance > 0.15 ? 'text-red-600' : 
                      project.editDistance > 0.10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {project.editDistance}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <i className={`w-4 h-4 flex items-center justify-center ${getTrendIcon(project.trend)}`}></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'throughput', label: '吞吐量趋势', icon: 'ri-line-chart-line' },
            { id: 'quality', label: '质量趋势', icon: 'ri-shield-check-line' },
            { id: 'anomalies', label: '异常分析', icon: 'ri-alert-line' }
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

      {activeTab === 'throughput' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">按项目吞吐量趋势</h3>
          <div className="h-80 flex items-end justify-between space-x-4">
            {throughputData.map((week, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col justify-end space-y-1" style={{ height: '280px' }}>
                  <div className="text-center mb-2">
                    <span className="text-xs font-medium text-gray-900">
                      {week.financial + week.product + week.legal + week.technical}
                    </span>
                  </div>
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(week.financial / 60) * 200}px` }}
                    title="Financial Analysis"
                  ></div>
                  <div 
                    className="w-full bg-green-500"
                    style={{ height: `${(week.product / 60) * 200}px` }}
                    title="Product Documentation"
                  ></div>
                  <div 
                    className="w-full bg-purple-500"
                    style={{ height: `${(week.legal / 60) * 200}px` }}
                    title="Legal Contract"
                  ></div>
                  <div 
                    className="w-full bg-orange-500"
                    style={{ height: `${(week.technical / 60) * 200}px` }}
                    title="Technical Architecture"
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{week.week}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Financial Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Product Documentation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Legal Contract</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Technical Architecture</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">QA退回率趋势</h3>
          <div className="h-80 flex items-end justify-between space-x-4">
            {returnRateData.map((week, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col justify-end space-y-1" style={{ height: '280px' }}>
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(week.financial / 20) * 200}px` }}
                    title={`Financial: ${week.financial}%`}
                  ></div>
                  <div 
                    className="w-full bg-green-500"
                    style={{ height: `${(week.product / 20) * 200}px` }}
                    title={`Product: ${week.product}%`}
                  ></div>
                  <div 
                    className="w-full bg-purple-500"
                    style={{ height: `${(week.legal / 20) * 200}px` }}
                    title={`Legal: ${week.legal}%`}
                  ></div>
                  <div 
                    className="w-full bg-orange-500"
                    style={{ height: `${(week.technical / 20) * 200}px` }}
                    title={`Technical: ${week.technical}%`}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{week.week}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Financial Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Product Documentation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Legal Contract</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Technical Architecture</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">异常Top N</h3>
              <p className="text-sm text-gray-600 mt-1">需要重点关注的项目和文件</p>
            </div>
            <div className="divide-y divide-gray-200">
              {anomalies.map((anomaly, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        anomaly.severity === 'high' ? 'bg-red-100' :
                        anomaly.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <i className={`w-4 h-4 flex items-center justify-center ${
                          anomaly.severity === 'high' ? 'ri-error-warning-line text-red-600' :
                          anomaly.severity === 'medium' ? 'ri-alert-line text-yellow-600' : 'ri-information-line text-green-600'
                        }`}></i>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{anomaly.project}</div>
                        <div className="text-sm text-gray-500">负责人: {anomaly.manager}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{anomaly.value}</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity === 'high' ? '高风险' : 
                         anomaly.severity === 'medium' ? '中风险' : '低风险'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{anomaly.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">相关文件: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {anomaly.files.map((file, fileIndex) => (
                          <span key={fileIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                        查看详情
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer">
                        标记已处理
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