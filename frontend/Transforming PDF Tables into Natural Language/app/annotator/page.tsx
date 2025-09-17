
'use client';

import { useState } from 'react';
import PDFViewer from '../../components/PDFViewer';
import DraftEditor from '../../components/DraftEditor';

export default function AnnotatorDashboard() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tasks] = useState([
    {
      id: 1,
      fileName: 'Annual Financial Report 2024.pdf',
      tableNumber: 'T-001',
      status: 'pending',
      aiDraft: 'Based on the table content, operating revenue is $1,250,000, operating costs are $850,000, gross profit is $400,000. Net profit is $320,000, up 15.2% year-over-year.',
      pageNumber: 3
    },
    {
      id: 2,
      fileName: 'Annual Financial Report 2024.pdf',
      tableNumber: 'T-002',
      status: 'pending',
      aiDraft: 'Cash flow statement shows operating cash inflow of $980,000, cash outflow of $720,000, net cash flow of $260,000.',
      pageNumber: 5
    },
    {
      id: 3,
      fileName: 'Product Specification Manual.pdf',
      tableNumber: 'T-003',
      status: 'pending',
      aiDraft: 'Product technical specifications: Processor frequency 2.4GHz, Memory capacity 8GB, Storage space 256GB SSD, Display size 15.6 inches.',
      pageNumber: 2
    },
    {
      id: 4,
      fileName: 'Contract Terms Document.pdf',
      tableNumber: 'T-004',
      status: 'pending',
      aiDraft: 'Contract validity period from January 1, 2024 to December 31, 2025, contract amount $500,000, payment method installment.',
      pageNumber: 1
    }
  ]);

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task);
  };

  const handleSubmitEdit = (taskId: number, editedContent: string) => {
    console.log('Submit edit task:', taskId, editedContent);
    // In actual project, this would call API
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Annotator Workspace</h1>
        </div>
      </div>

      <div className="max-w-full mx-auto py-8">
        <div className="flex h-[calc(100vh-160px)]">
          {/* Collapsible Task Sidebar */}
          <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-12' : 'w-80'} flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col mx-2">
              {isSidebarCollapsed ? (
                // Collapsed View
                <>
                  <div className="p-3 border-b border-gray-200">
                    <button
                      onClick={toggleSidebar}
                      className="w-full p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center justify-center"
                    >
                      <i className="ri-menu-unfold-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {tasks.slice(0, 8).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskSelect(task)}
                        className={`w-full p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                          selectedTask?.id === task.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        title={`${task.fileName} - ${task.tableNumber}`}
                      >
                        <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center mx-auto">
                          <span className="text-xs font-medium text-gray-600">
                            {task.tableNumber.split('-')[1]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                // Expanded View
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Pending Tasks</h2>
                        <div className="text-sm text-gray-600 mt-1">Total {tasks.length} tasks</div>
                      </div>
                      <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <i className="ri-menu-fold-line w-5 h-5 flex items-center justify-center text-gray-600"></i>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskSelect(task)}
                        className={`p-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedTask?.id === task.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-base truncate">
                          {task.fileName}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Table ID: {task.tableNumber}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            task.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {task.status === 'pending' ? 'Pending' : 'Completed'}
                          </span>
                          <span className="text-sm text-gray-500">Page {task.pageNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-4">
            {selectedTask ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">PDF Preview</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedTask.fileName} - Page {selectedTask.pageNumber}
                    </div>
                  </div>
                  <div className="flex-1">
                    <PDFViewer 
                      fileName={selectedTask.fileName}
                      pageNumber={selectedTask.pageNumber}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Edit Area</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      Table ID: {selectedTask.tableNumber}
                    </div>
                  </div>
                  <div className="flex-1">
                    <DraftEditor
                      taskId={selectedTask.id}
                      aiDraft={selectedTask.aiDraft}
                      onSubmit={handleSubmitEdit}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <i className="ri-file-text-line text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a task to start annotation</h3>
                  <p className="text-gray-600">Choose a pending task from the left task list</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
