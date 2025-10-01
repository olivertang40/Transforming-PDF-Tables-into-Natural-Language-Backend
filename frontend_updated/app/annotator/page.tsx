'use client';

import { useState } from 'react';
import PDFViewer from '../../components/PDFViewer';
import DraftEditor from '../../components/DraftEditor';

export default function AnnotatorWorkspace() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tasks');

  // Annotator's task list
  const myTasks = [
    {
      id: 1,
      tableId: 'T001',
      fileName: 'Financial_Report_Q4_2024.pdf',
      pageNumber: 5,
      tableBbox: [100, 200, 400, 350],
      tableRows: 8,
      tableCols: 4,
      project: 'Financial Analysis Q4 2024',
      complexity: 'medium',
      priority: 'high',
      status: 'assigned',
      assignedAt: '2024-01-22 09:30',
      dueDate: '2024-01-25',
      aiDraftStatus: 'generated',
      aiDraft: 'This is a financial report table containing 8 rows and 4 columns of data. The table displays key financial indicators for Q4, including revenue, expenses, and profit. The first row contains headers including "Item", "Q3 Actual", "Q4 Budget", "Q4 Actual". Data shows Q4 actual revenue of $2,450,000, representing a 5.2% increase over budget.',
      hasFootnotes: true
    },
    {
      id: 2,
      tableId: 'T003',
      fileName: 'Product_Spec_v2.pdf',
      pageNumber: 3,
      tableBbox: [120, 180, 450, 320],
      tableRows: 6,
      tableCols: 3,
      project: 'Product Documentation Review',
      complexity: 'low',
      priority: 'medium',
      status: 'in_progress',
      assignedAt: '2024-01-21 14:15',
      dueDate: '2024-01-24',
      aiDraftStatus: 'generated',
      aiDraft: 'Product specification table with 6 rows and 3 columns structure. The table lists technical specification parameters including "Specification Item", "Standard Value", "Notes" columns. Covers hardware specifications including processor, memory, storage, and other technical details.',
      hasFootnotes: true
    },
    {
      id: 3,
      tableId: 'T006',
      fileName: 'Technical_Manual.pdf',
      pageNumber: 12,
      tableBbox: [90, 160, 480, 300],
      tableRows: 10,
      tableCols: 5,
      project: 'Technical Documentation',
      complexity: 'high',
      priority: 'medium',
      status: 'assigned',
      assignedAt: '2024-01-23 11:20',
      dueDate: '2024-01-26',
      aiDraftStatus: 'not_generated',
      aiDraft: '',
      hasFootnotes: false
    }
  ];

  const handleGenerateDraft = async (taskId: number) => {
    // Simulate AI draft generation
    const task = myTasks.find(t => t.id === taskId);
    if (task) {
      task.aiDraftStatus = 'generating';
      setTimeout(() => {
        task.aiDraftStatus = 'generated';
        task.aiDraft = 'This is system-generated AI draft content. The table contains technical specifications and parameter information that requires human review and refinement.';
      }, 3000);
    }
  };

  const handleSubmitTask = (taskId: number, editedContent: string) => {
    console.log('Submitting task:', taskId, editedContent);
    const task = myTasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'qa_pending';
    }
    setSelectedTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'qa_pending': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'qa_pending': return 'QA Pending';
      case 'completed': return 'Completed';
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

  const getAiDraftStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'not_generated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAiDraftStatusLabel = (status: string) => {
    switch (status) {
      case 'generated': return 'Generated';
      case 'generating': return 'Generating';
      case 'failed': return 'Failed';
      case 'not_generated': return 'Not Generated';
      default: return status;
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
                    Table Annotation - {selectedTask.tableId}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {selectedTask.fileName} • Page {selectedTask.pageNumber} • {selectedTask.tableRows}×{selectedTask.tableCols}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${getComplexityColor(selectedTask.complexity)}`}>
                  {getComplexityLabel(selectedTask.complexity)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getAiDraftStatusColor(selectedTask.aiDraftStatus)}`}>
                  AI Draft: {getAiDraftStatusLabel(selectedTask.aiDraftStatus)}
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

          {/* Draft Editor */}
          <div className="w-1/2">
            {selectedTask.aiDraftStatus === 'generated' ? (
              <DraftEditor
                taskId={selectedTask.id}
                aiDraft={selectedTask.aiDraft}
                onSubmit={handleSubmitTask}
                onRegenerateDraft={() => handleGenerateDraft(selectedTask.id)}
              />
            ) : selectedTask.aiDraftStatus === 'generating' ? (
              <div className="p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <i className="ri-loader-4-line w-8 h-8 flex items-center justify-center text-blue-600 mx-auto mb-4 animate-spin"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Generating AI Draft</h3>
                  <p className="text-gray-600">Please wait, the system is analyzing table content...</p>
                </div>
              </div>
            ) : (
              <div className="p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <i className="ri-magic-line w-8 h-8 flex items-center justify-center text-gray-400 mx-auto mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Draft Not Generated</h3>
                  <p className="text-gray-600 mb-4">Click the button below to generate AI draft, or start manual annotation</p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handleGenerateDraft(selectedTask.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-magic-line w-4 h-4 flex items-center justify-center"></i>
                      <span>Generate AI Draft</span>
                    </button>
                    <button className="text-gray-600 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap cursor-pointer">
                      Manual Annotation
                    </button>
                  </div>
                </div>
              </div>
            )}
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
              <h1 className="text-2xl font-bold text-gray-900">Annotator Workspace</h1>
              <p className="text-sm text-gray-600 mt-1">Manage and complete your assigned table annotation tasks</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-user-line w-4 h-4 flex items-center justify-center text-blue-500"></i>
                <span>Sarah Johnson</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-task-line w-4 h-4 flex items-center justify-center text-green-500"></i>
                <span>{myTasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length} Pending</span>
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
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-blue-600">
                  {myTasks.filter(t => t.status === 'assigned').length}
                </p>
              </div>
              <i className="ri-task-line w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-100 rounded-lg"></i>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {myTasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <i className="ri-play-circle-line w-8 h-8 flex items-center justify-center text-yellow-600 bg-yellow-100 rounded-lg"></i>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">QA Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {myTasks.filter(t => t.status === 'qa_pending').length}
                </p>
              </div>
              <i className="ri-eye-line w-8 h-8 flex items-center justify-center text-orange-600 bg-orange-100 rounded-lg"></i>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {myTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <i className="ri-check-circle-line w-8 h-8 flex items-center justify-center text-green-600 bg-green-100 rounded-lg"></i>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
            <p className="text-sm text-gray-600 mt-1">Click on a task to start annotation work</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Table Info</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">File/Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Table Structure</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Complexity/Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">AI Draft</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Assigned At</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm flex items-center space-x-2">
                          <span className="font-mono text-blue-600">{task.tableId}</span>
                          {task.hasFootnotes && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded">Footnotes</span>
                          )}
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
                        <div className="text-xs text-gray-500">
                          bbox: [{task.tableBbox.slice(0, 2).join(', ')}...]
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${getComplexityColor(task.complexity)}`}>
                          {getComplexityLabel(task.complexity)}
                        </span>
                        <i className={`ri-flag-line w-3 h-3 flex items-center justify-center ${getPriorityColor(task.priority)}`}></i>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getAiDraftStatusColor(task.aiDraftStatus)}`}>
                          {getAiDraftStatusLabel(task.aiDraftStatus)}
                        </span>
                        {task.aiDraftStatus === 'not_generated' && (
                          <button
                            onClick={() => handleGenerateDraft(task.id)}
                            className="text-blue-600 hover:text-blue-700 text-xs cursor-pointer"
                          >
                            Generate
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{task.assignedAt}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{task.dueDate}</span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 whitespace-nowrap cursor-pointer"
                      >
                        Start Annotation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {myTasks.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-task-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Tasks</h3>
            <p className="text-gray-600">Please wait for project managers to assign new annotation tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
