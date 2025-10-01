
'use client';

import { useState } from 'react';

export default function TaskAssignment() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Project Manager 只能看到任务状态，不能分配给 annotator
  const tasks = [
    {
      id: 1,
      fileName: 'Financial_Report_Q4_2024.pdf',
      pageNumber: 1,
      tableCount: 3,
      difficulty: 'medium',
      priority: 'high',
      status: 'pending',
      assignedTo: null,
      createdAt: '2024-01-22',
      dueDate: '2024-01-25'
    },
    {
      id: 2,
      fileName: 'Financial_Report_Q4_2024.pdf',
      pageNumber: 2,
      tableCount: 2,
      difficulty: 'easy',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'System Admin 已分配',
      createdAt: '2024-01-21',
      dueDate: '2024-01-24'
    },
    {
      id: 3,
      fileName: 'Budget_Analysis_2024.pdf',
      pageNumber: 1,
      tableCount: 4,
      difficulty: 'hard',
      priority: 'high',
      status: 'qa_pending',
      assignedTo: 'System Admin 已分配',
      createdAt: '2024-01-20',
      dueDate: '2024-01-23'
    },
    {
      id: 4,
      fileName: 'Budget_Analysis_2024.pdf',
      pageNumber: 2,
      tableCount: 1,
      difficulty: 'easy',
      priority: 'low',
      status: 'completed',
      assignedTo: 'System Admin 已分配',
      createdAt: '2024-01-19',
      dueDate: '2024-01-22'
    }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'qa_pending':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'qa_pending':
        return 'QA待审';
      case 'pending':
        return '待分配';
      default:
        return '未知';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'easy':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">任务分配</h2>
          <p className="text-sm text-gray-600 mt-1">查看项目内的任务状态（任务分配由系统管理员负责）</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <i className="ri-information-line w-4 h-4 flex items-center justify-center text-yellow-600"></i>
            <span className="text-sm text-yellow-800">任务分配权限仅限系统管理员</span>
          </div>
        </div>
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
              placeholder="搜索文件名..."
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
          <option value="pending">待分配</option>
          <option value="in_progress">进行中</option>
          <option value="qa_pending">QA待审</option>
          <option value="completed">已完成</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">所有优先级</option>
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">文件/页面</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">表格数量</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">难度</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">优先级</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">分配状态</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">截止日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{task.fileName}</div>
                      <div className="text-xs text-gray-500">第 {task.pageNumber} 页</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{task.tableCount} 个表格</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty === 'hard' ? '困难' : task.difficulty === 'medium' ? '中等' : '简单'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <i className={`ri-flag-line w-3 h-3 flex items-center justify-center ${getPriorityColor(task.priority)}`}></i>
                      <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {task.assignedTo || '待系统管理员分配'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{task.dueDate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <i className="ri-task-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配的任务</h3>
          <p className="text-gray-600">尝试调整筛选条件查看更多任务</p>
        </div>
      )}

      {/* Project Manager Limitations Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <i className="ri-information-line w-5 h-5 flex items-center justify-center text-blue-600 mt-0.5"></i>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">权限说明</h4>
            <p className="text-sm text-blue-800">
              作为项目经理，您可以查看项目内的任务状态和进度，但无法直接分配任务给标注员。
              任务分配功能仅限系统管理员使用，以确保资源的统一调配和管理。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
