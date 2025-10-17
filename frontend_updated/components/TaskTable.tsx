
'use client';

import { useState } from 'react';

interface Task {
  id: number;
  fileName: string;
  taskCount: number;
  completedCount: number;
  status: string;
  assignee: string;
}

interface TaskTableProps {
  tasks: Task[];
  onAssignTask?: (taskId: number, assignee: string) => void;
  showAssignActions?: boolean;
}

export default function TaskTable({ tasks, onAssignTask, showAssignActions = false }: TaskTableProps) {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [assigneeInput, setAssigneeInput] = useState('');

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
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'qa_pending':
        return 'QA Pending';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const handleAssign = (taskId: number) => {
    if (assigneeInput.trim() && onAssignTask) {
      onAssignTask(taskId, assigneeInput.trim());
      setSelectedTask(null);
      setAssigneeInput('');
    }
  };

  const getCompletionRate = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tasks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assignee
            </th>
            {showAssignActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                <div className="truncate font-medium">{task.fileName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {task.taskCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-16">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${getCompletionRate(task.completedCount, task.taskCount)}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {task.completedCount}/{task.taskCount}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {task.assignee || '-'}
              </td>
              {showAssignActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.status === 'pending' ? (
                    selectedTask === task.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={assigneeInput}
                          onChange={(e) => setAssigneeInput(e.target.value)}
                          placeholder="Enter name"
                          className="px-2 py-1 border rounded text-sm w-24"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAssign(task.id)}
                          className="text-blue-600 hover:text-blue-900 w-4 h-4 flex items-center justify-center cursor-pointer"
                        >
                          <i className="ri-check-line"></i>
                        </button>
                        <button
                          onClick={() => setSelectedTask(null)}
                          className="text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center cursor-pointer"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedTask(task.id)}
                        className="text-blue-600 hover:text-blue-900 whitespace-nowrap cursor-pointer"
                      >
                        Assign Task
                      </button>
                    )
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
