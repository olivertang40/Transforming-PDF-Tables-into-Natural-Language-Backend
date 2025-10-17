
'use client';

import { useState } from 'react';

interface File {
  id: number;
  name: string;
  taskCount: number;
  completedCount: number;
}

interface ExportPanelProps {
  files: File[];
  onExport: (options: {
    scope: 'single' | 'project';
    format: 'json' | 'txt';
    selectedFiles: number[];
  }) => void;
}

export default function ExportPanel({ files, onExport }: ExportPanelProps) {
  const [exportScope, setExportScope] = useState<'single' | 'project'>('single');
  const [exportFormat, setExportFormat] = useState<'json' | 'txt'>('json');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

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
    onExport({
      scope: exportScope,
      format: exportFormat,
      selectedFiles: exportScope === 'single' ? selectedFiles : []
    });
  };

  const isExportDisabled = exportScope === 'single' && selectedFiles.length === 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Export Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Export Scope
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
              <span className="ml-2 text-sm text-gray-700">Individual Files</span>
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
              <span className="ml-2 text-sm text-gray-700">Entire Project</span>
            </label>
          </div>
        </div>

        {exportScope === 'single' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900">
                Select Files
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {selectedFiles.length === files.length ? 'Deselect All' : 'Select All'}
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
                      {file.completedCount}/{file.taskCount} completed
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Export Format
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
              <span className="ml-2 text-sm text-gray-700">JSON Format</span>
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
              <span className="ml-2 text-sm text-gray-700">TXT Format</span>
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
            <span>Start Export</span>
          </button>
          
          {isExportDisabled && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Please select at least one file to export
            </p>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <i className="ri-information-line w-4 h-4 flex items-center justify-center text-blue-600 mt-0.5"></i>
            <div className="text-xs text-blue-800">
              <div className="font-medium mb-1">Export Notes:</div>
              <ul className="space-y-1">
                <li>• JSON format includes complete structured data</li>
                <li>• TXT format is plain text for easy reading</li>
                <li>• Only QA-approved content will be exported</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
