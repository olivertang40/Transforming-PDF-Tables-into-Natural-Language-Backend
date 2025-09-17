
'use client';

import { useState } from 'react';
import PDFViewer from '../../components/PDFViewer';
import ReviewPanel from '../../components/ReviewPanel';

export default function QADashboard() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks] = useState([
    {
      id: 1,
      taskNumber: 'QA-001',
      fileName: 'Annual Financial Report 2024.pdf',
      tableNumber: 'T-001',
      status: 'qa_pending',
      aiDraft: 'Based on the table content, operating revenue is $1,250,000, operating costs are $850,000, gross profit is $400,000. Net profit is $320,000, up 15.2% year-over-year.',
      humanEdit: 'According to financial statement analysis, annual operating revenue reached $1.25 million, operating costs were $850,000, achieving gross profit of $400,000, accounting for 32% of operating revenue. Net profit was $320,000, up 15.2% compared to the same period last year, showing good profitability and growth trend.',
      pageNumber: 3,
      annotator: 'John Smith',
      submittedAt: '2024-01-15 14:30'
    },
    {
      id: 2,
      taskNumber: 'QA-002',
      fileName: 'Product Specification Manual.pdf',
      tableNumber: 'T-003',
      status: 'qa_pending',
      aiDraft: 'Product technical specifications: Processor frequency 2.4GHz, Memory capacity 8GB, Storage space 256GB SSD, Display size 15.6 inches.',
      humanEdit: 'This product features a high-performance processor with a main frequency of 2.4GHz, equipped with 8GB high-speed memory, providing 256GB solid-state drive storage space to ensure fast read/write performance. The display uses a 15.6-inch HD screen, providing users with a clear visual experience. The overall configuration meets daily office and multimedia processing needs.',
      pageNumber: 2,
      annotator: 'Sarah Johnson',
      submittedAt: '2024-01-15 16:45'
    },
    {
      id: 3,
      taskNumber: 'QA-003',
      fileName: 'Contract Terms Document.pdf',
      tableNumber: 'T-004',
      status: 'qa_pending',
      aiDraft: 'Contract validity period from January 1, 2024 to December 31, 2025, contract amount $500,000, payment method installment.',
      humanEdit: 'This contract signing validity period is from January 1, 2024 to December 31, 2025, with a total contract amount of $500,000. Payment adopts installment method, specifically: 30% upon signing, 40% at project midpoint, remaining 30% upon project completion.',
      pageNumber: 1,
      annotator: 'Mike Wilson',
      submittedAt: '2024-01-15 18:20'
    }
  ]);

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task);
  };

  const handleReview = (taskId: number, result: 'pass' | 'fail', comment?: string) => {
    console.log('QA result:', taskId, result, comment);
    // In actual project, this would call API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">QA Workspace</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pending Review Tasks</h2>
                <div className="text-sm text-gray-600 mt-1">Total {tasks.length} tasks</div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskSelect(task)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedTask?.id === task.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {task.taskNumber}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 truncate">
                      {task.fileName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Table: {task.tableNumber}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                        Pending Review
                      </span>
                      <span className="text-xs text-gray-500">Page {task.pageNumber}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Annotator: {task.annotator}
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted: {task.submittedAt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedTask ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">PDF Preview</h3>
                    <div className="text-sm text-gray-600">
                      {selectedTask.fileName} - Page {selectedTask.pageNumber}
                    </div>
                  </div>
                  <PDFViewer 
                    fileName={selectedTask.fileName}
                    pageNumber={selectedTask.pageNumber}
                  />
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Review Panel</h3>
                    <div className="text-sm text-gray-600">
                      Task ID: {selectedTask.taskNumber} | Annotator: {selectedTask.annotator}
                    </div>
                  </div>
                  <ReviewPanel
                    task={selectedTask}
                    onReview={handleReview}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <i className="ri-shield-check-line text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a task to start review</h3>
                  <p className="text-gray-600">Choose a pending review task from the left task list</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
