
'use client';

import { useState } from 'react';
import ExportPanel from '../../components/ExportPanel';

export default function ExportPage() {
  const [exportLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 09:30:25',
      exportBy: 'Administrator',
      fileName: 'Annual Financial Report 2024.pdf',
      format: 'JSON',
      status: 'completed',
      downloadLink: '#'
    },
    {
      id: 2,
      timestamp: '2024-01-15 10:15:42',
      exportBy: 'Administrator',
      fileName: 'Product Specification Manual.pdf',
      format: 'TXT',
      status: 'completed',
      downloadLink: '#'
    },
    {
      id: 3,
      timestamp: '2024-01-15 11:22:18',
      exportBy: 'QA Specialist',
      fileName: 'Complete Project Data',
      format: 'JSON',
      status: 'completed',
      downloadLink: '#'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:45:33',
      exportBy: 'Administrator',
      fileName: 'Contract Terms Document.pdf',
      format: 'TXT',
      status: 'processing',
      downloadLink: null
    },
    {
      id: 5,
      timestamp: '2024-01-15 15:20:16',
      exportBy: 'QA Specialist',
      fileName: 'Technical Architecture Design.pdf',
      format: 'JSON',
      status: 'failed',
      downloadLink: null
    }
  ]);

  const [files] = useState([
    { id: 1, name: 'Annual Financial Report 2024.pdf', taskCount: 15, completedCount: 15 },
    { id: 2, name: 'Product Specification Manual.pdf', taskCount: 23, completedCount: 23 },
    { id: 3, name: 'Contract Terms Document.pdf', taskCount: 12, completedCount: 12 },
    { id: 4, name: 'Technical Architecture Design.pdf', taskCount: 18, completedCount: 18 }
  ]);

  const handleExport = (exportOptions: any) => {
    console.log('Execute export:', exportOptions);
    // In actual project, this would call export API
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ExportPanel files={files} onExport={handleExport} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Export Records</h2>
                <div className="text-sm text-gray-600 mt-1">
                  Total {exportLogs.length} records
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Export Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exported By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exportLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.exportBy}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {log.fileName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {log.format}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                            {getStatusText(log.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.downloadLink && log.status === 'completed' ? (
                            <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 whitespace-nowrap cursor-pointer">
                              <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
                              <span>Download</span>
                            </button>
                          ) : log.status === 'processing' ? (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <i className="ri-loader-4-line w-4 h-4 flex items-center justify-center animate-spin"></i>
                              <span>Processing</span>
                            </div>
                          ) : log.status === 'failed' ? (
                            <button className="text-red-600 hover:text-red-900 flex items-center space-x-1 whitespace-nowrap cursor-pointer">
                              <i className="ri-refresh-line w-4 h-4 flex items-center justify-center"></i>
                              <span>Retry</span>
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
