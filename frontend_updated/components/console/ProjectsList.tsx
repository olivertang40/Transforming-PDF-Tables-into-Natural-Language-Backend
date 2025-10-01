'use client';

import { useState } from 'react';

export default function ProjectsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const projects = [
    {
      id: 1,
      name: 'Financial Analysis Q4 2024',
      manager: 'John Smith',
      fileCount: 8,
      completedFiles: 6,
      totalTasks: 68,
      completedTasks: 54,
      qualityScore: 96.2,
      status: 'active',
      updatedAt: '2024-01-22',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Product Documentation Review',
      manager: 'Sarah Johnson',
      fileCount: 12,
      completedFiles: 9,
      totalTasks: 156,
      completedTasks: 142,
      qualityScore: 92.8,
      status: 'active',
      updatedAt: '2024-01-21',
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      name: 'Legal Contract Analysis',
      manager: 'Mike Wilson',
      fileCount: 6,
      completedFiles: 6,
      totalTasks: 48,
      completedTasks: 48,
      qualityScore: 94.5,
      status: 'completed',
      updatedAt: '2024-01-20',
      createdAt: '2023-12-20'
    },
    {
      id: 4,
      name: 'Technical Architecture Review',
      manager: 'Emily Davis',
      fileCount: 15,
      completedFiles: 7,
      totalTasks: 89,
      completedTasks: 32,
      qualityScore: 89.3,
      status: 'active',
      updatedAt: '2024-01-22',
      createdAt: '2024-01-18'
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">项目列表</h2>
          <p className="text-sm text-gray-600 mt-1">查看和管理组织内的所有项目</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
          <span>新建项目</span>
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
              placeholder="搜索项目或负责人..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">所有状态</option>
          <option value="active">进行中</option>
          <option value="completed">已完成</option>
          <option value="archived">已归档</option>
        </select>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">项目名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">负责人</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">文件进度</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">任务进度</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">质量指标</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">更新时间</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                        project.status === 'active' ? 'bg-green-500' : 
                        project.status === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">创建于 {project.createdAt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{project.manager}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{project.completedFiles}/{project.fileCount}</span>
                        <span className="text-gray-500">{getProgressPercentage(project.completedFiles, project.fileCount)}%</span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${getProgressPercentage(project.completedFiles, project.fileCount)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{project.completedTasks}/{project.totalTasks}</span>
                        <span className="text-gray-500">{getProgressPercentage(project.completedTasks, project.totalTasks)}%</span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${getProgressPercentage(project.completedTasks, project.totalTasks)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <i className={`ri-star-fill w-3 h-3 flex items-center justify-center ${getQualityColor(project.qualityScore)}`}></i>
                      <span className={`text-sm font-medium ${getQualityColor(project.qualityScore)}`}>
                        {project.qualityScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{project.updatedAt}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                        查看
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer">
                        编辑
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm cursor-pointer">
                        归档
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <i className="ri-folder-open-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">组织内暂无项目</h3>
          <p className="text-gray-600 mb-4">请联系项目经理创建新项目</p>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">创建新项目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目名称 *
                </label>
                <input
                  type="text"
                  placeholder="输入项目名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目经理 *
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">选择项目经理</option>
                  <option value="john">John Smith</option>
                  <option value="sarah">Sarah Johnson</option>
                  <option value="mike">Mike Wilson</option>
                  <option value="emily">Emily Davis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目描述
                </label>
                <textarea
                  placeholder="输入项目描述..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap cursor-pointer"
              >
                创建项目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}