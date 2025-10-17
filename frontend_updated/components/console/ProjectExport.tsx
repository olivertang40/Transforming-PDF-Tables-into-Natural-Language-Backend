
'use client';

import { useState } from 'react';

export default function ProjectExport() {
  const [exportScope, setExportScope] = useState<'single' | 'project'>('single');
  const [exportFormat, setExportFormat] = useState<'json' | 'txt'>('json');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  const files = [
    { id: 1, name: 'Annual Financial Report 2024.pdf', taskCount: 15, completedCount: 15 },
    { id: 2, name: 'Quarterly Analysis Q4.pdf', taskCount: 12, completedCount: 12 },
    { id: 3, name: 'Budget Planning Document.pdf', taskCount: 8, completedCount: 8 },
    { id: 4, name: 'Investment Portfolio Review.pdf', taskCount: 18, completedCount: 16 },
    { id: 5, name: 'Risk Assessment Report.pdf', taskCount: 10, completedCount: 7 }
  ];

  const exportLogs = [
    {
      id: 1,
      timestamp: '2024-01-22 14:30:25',
      fileName: 'Annual Financial Report 2024.pdf',
      format: 'JSON',
      status: 'completed',
      downloadLink: '#'
    },
    {
      id: 2,
      timestamp: '2024-01-22 13:15:42',
      fileName: 'Complete Project Data',
      format: 'TXT',
      status: 'completed',
      downloadLink: '#'
    },
    {
      id: 3,
      timestamp: '2024-01-22 11:22:18',
      fileName: 'Quarterly Analysis Q4.pdf',
      format: 'JSON',
      status: 'processing',
      downloadLink: null
    },
    {
      id: 4,
      timestamp: '2024-01-21 16:45:33',
      fileName: 'Budget Planning Document.pdf',
      format: 'TXT',
      status: 'failed',
      downloadLink: null
    }
  ];

  const handleFileSelection = (fileId: number) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleExport = () => {
    console.log('Execute export:', {
      scope: exportScope,
      format: exportFormat,
      selectedFiles: exportScope === 'single' ? selectedFiles : []
    });
  };

  const isExportDisabled = exportScope === 'single' && selectedFiles.length === 0;

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
        return '已完成';
      case 'processing':
        return '处理中';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">数据导出</h2>
        <p className="text-sm text-gray-600 mt-1">导出项目文件和数据，支持多种格式</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Settings Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">导出设置</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  导出范围
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="single"
                      checked={exportScope === 'single'}
                      onChange={(e) => setExportScope(e.target.value as 'single')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">单个文件</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="project"
                      checked={exportScope === 'project'}
                      onChange={(e) => setExportScope(e.target.value as 'project')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">整个项目</span>
                  </label>
                </div>
              </div>

              {exportScope === 'single' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-900">
                      选择文件
                    </label>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      {selectedFiles.length === files.length ? '取消全选' : '全选'}
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {files.map((file) => (
                      <label
                        key={file.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleFileSelection(file.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {file.completedCount}/{file.taskCount} 已完成
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  导出格式
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={(e) => setExportFormat(e.target.value as 'json')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">JSON 格式</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="txt"
                      checked={exportFormat === 'txt'}
                      onChange={(e) => setExportFormat(e.target.value as 'txt')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">TXT 格式</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <button
                  onClick={handleExport}
                  disabled={isExportDisabled}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
                  <span>开始导出</span>
                </button>
                
                {isExportDisabled && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    请至少选择一个文件进行导出
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line w-4 h-4 flex items-center justify-center text-blue-600 mt-0.5"></i>
                  <div className="text-xs text-blue-800">
                    <div className="font-medium mb-1">导出说明：</div>
                    <ul className="space-y-1">
                      <li>• JSON格式包含完整的结构化数据</li>
                      <li>• TXT格式为纯文本，便于阅读</li>
                      <li>• 仅导出已通过QA审核的内容</li>
                      <li>• 项目经理只能导出自己项目的数据</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">导出记录</h3>
              <div className="text-sm text-gray-600 mt-1">
                共 {exportLogs.length} 条记录
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      导出时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      格式
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exportLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.timestamp}
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
                            <span>下载</span>
                          </button>
                        ) : log.status === 'processing' ? (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <i className="ri-loader-4-line w-4 h-4 flex items-center justify-center animate-spin"></i>
                            <span>处理中</span>
                          </div>
                        ) : log.status === 'failed' ? (
                          <button className="text-red-600 hover:text-red-900 flex items-center space-x-1 whitespace-nowrap cursor-pointer">
                            <i className="ri-refresh-line w-4 h-4 flex items-center justify-center"></i>
                            <span>重试</span>
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

            {exportLogs.length === 0 && (
              <div className="p-8 text-center">
                <i className="ri-download-cloud-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无导出记录</h3>
                <p className="text-gray-600">开始导出数据后，记录将显示在这里</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
