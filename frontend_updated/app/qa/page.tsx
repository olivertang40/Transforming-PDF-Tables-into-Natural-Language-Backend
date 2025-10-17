
'use client';

import { useState } from 'react';
import PDFViewer from '../../components/PDFViewer';
import ReviewPanel from '../../components/ReviewPanel';

export default function QAWorkspace() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks] = useState([
    {
      id: 1,
      taskNumber: 'QA-001',
      tableId: 'T-001',
      fileName: 'Annual Financial Report 2024.pdf',
      status: 'qa_pending',
      aiDraft: 'Based on the table content, operating revenue is $1,250,000, operating costs are $850,000, gross profit is $400,000. Net profit is $320,000, up 15.2% year-over-year.',
      humanEdit: 'According to financial statement analysis, annual operating revenue reached $1.25 million, operating costs were $850,000, achieving gross profit of $400,000, accounting for 32% of operating revenue. Net profit was $320,000, up 15.2% compared to the same period last year, showing good profitability and growth trend.',
      pageNumber: 3,
      annotator: 'John Smith',
      submittedAt: '2024-01-15 14:30',
      project: 'Financial Analysis Q4 2024',
      complexity: 'medium',
      priority: 'high',
      tableRows: 8,
      tableCols: 4
    },
    {
      id: 2,
      taskNumber: 'QA-002',
      tableId: 'T-003',
      fileName: 'Product Specification Manual.pdf',
      status: 'qa_pending',
      aiDraft: 'Product technical specifications: Processor frequency 2.4GHz, Memory capacity 8GB, Storage space 256GB SSD, Display size 15.6 inches.',
      humanEdit: 'This product features a high-performance processor with a main frequency of 2.4GHz, equipped with 8GB high-speed memory, providing 256GB solid-state drive storage space to ensure fast read/write performance. The display uses a 15.6-inch HD screen, providing users with a clear visual experience. The overall configuration meets daily office and multimedia processing needs.',
      pageNumber: 2,
      annotator: 'Sarah Johnson',
      submittedAt: '2024-01-15 16:45',
      project: 'Product Documentation Review',
      complexity: 'low',
      priority: 'medium',
      tableRows: 6,
      tableCols: 3
    },
    {
      id: 3,
      taskNumber: 'QA-003',
      tableId: 'T-004',
      fileName: 'Contract Terms Document.pdf',
      status: 'qa_pending',
      aiDraft: 'Contract validity period from January 1, 2024 to December 31, 2025, contract amount $500,000, payment method installment.',
      humanEdit: 'This contract signing validity period is from January 1, 2024 to December 31, 2025, with a total contract amount of $500,000. Payment adopts installment method, specifically: 30% upon signing, 40% at project midpoint, remaining 30% upon project completion.',
      pageNumber: 1,
      annotator: 'Mike Wilson',
      submittedAt: '2024-01-15 18:20',
      project: 'Technical Documentation',
      complexity: 'high',
      priority: 'medium',
      tableRows: 10,
      tableCols: 5
    }
  ]);

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task);
  };

  const handleReview = (taskId: number, result: 'pass' | 'fail', comment?: string) => {
    console.log('QA result:', taskId, result, comment);
    // In actual project, this would call API
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = result === 'pass' ? 'completed' : 'rejected';
    }
    setSelectedTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qa_pending': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'qa_pending': return 'Pending Review';
      case 'completed': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'Complex';
      case 'medium': return 'Medium';
      case 'low': return 'Simple';
      default: return complexity;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (selectedTask) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-600 hover:text-gray-700 flex items-center space-x-2 cursor-pointer"
                >
                  <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
                  <span>Back to Task List</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    QA Review - {selectedTask.tableId}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {selectedTask.fileName} • Page {selectedTask.pageNumber} • {selectedTask.tableRows}×{selectedTask.tableCols}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(selectedTask.complexity)}`}>
                  {getComplexityLabel(selectedTask.complexity)}
                </span>
                <span className="text-sm text-gray-600">
                  Annotator: {selectedTask.annotator}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* PDF Viewer */}
          <div className="w-1/2 border-r border-gray-200">
            <PDFViewer 
              fileName={selectedTask.fileName} 
              pageNumber={selectedTask.pageNumber} 
            />
          </div>

          {/* Review Panel */}
          <div className="w-1/2">
            <ReviewPanel
              task={selectedTask}
              onReview={handleReview}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QA Workspace</h1>
              <p className="text-sm text-gray-600 mt-1">Review and approve annotated table content</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-user-line w-4 h-4 flex items-center justify-center text-blue-500"></i>
                <span>Emily Chen</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-eye-line w-4 h-4 flex items-center justify-center text-orange-500"></i>
                <span>{tasks.filter(t => t.status === 'qa_pending').length} Pending Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter(t => t.status === 'qa_pending').length}
                </p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center text-orange-600 bg-orange-100 rounded-lg">
                <i className="ri-eye-line"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center text-green-600 bg-green-100 rounded-lg">
                <i className="ri-check-circle-line"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center text-red-600 bg-red-100 rounded-lg">
                <i className="ri-close-circle-line"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Review Rate</p>
                <p className="text-2xl font-bold text-blue-600">85%</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-100 rounded-lg">
                <i className="ri-bar-chart-line"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Review Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">Click on a task to start QA review</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Table Info</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">File/Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Table Structure</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Complexity/Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Annotator</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted At</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm flex items-center space-x-2">
                          <span className="font-mono text-blue-600">{task.tableId}</span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded">{task.taskNumber}</span>
                        </div>
                        <div className="text-xs text-gray-500">Page {task.pageNumber}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm text-gray-900">{task.fileName}</div>
                        <div className="text-xs text-gray-500">{task.project}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{task.tableRows}×{task.tableCols}</div>
                        <div className="text-xs text-gray-500">rows × columns</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(task.complexity)}`}>
                          {getComplexityLabel(task.complexity)}
                        </span>
                        <i className={`ri-flag-line w-3 h-3 flex items-center justify-center ${getPriorityColor(task.priority)}`}></i>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{task.annotator}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{task.submittedAt}</span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 whitespace-nowrap cursor-pointer"
                      >
                        Start Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tasks.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-eye-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks for Review</h3>
            <p className="text-gray-600">All submitted tasks have been reviewed</p>
          </div>
        )}
      </div>
    </div>
  );
}
