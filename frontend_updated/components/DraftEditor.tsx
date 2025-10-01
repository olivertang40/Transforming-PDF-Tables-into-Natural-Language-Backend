
'use client';

import { useState } from 'react';

interface DraftEditorProps {
  taskId: number;
  aiDraft: string;
  onSubmit: (taskId: number, editedContent: string) => void;
  onRegenerateDraft?: () => void;
}

export default function DraftEditor({ taskId, aiDraft, onSubmit, onRegenerateDraft }: DraftEditorProps) {
  const [editedContent, setEditedContent] = useState(aiDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      console.log('Draft saved');
    }, 1000);
  };

  const handleSubmit = () => {
    onSubmit(taskId, editedContent);
  };

  const handleRegenerate = () => {
    if (onRegenerateDraft) {
      setIsRegenerating(true);
      onRegenerateDraft();
      // Reset regenerating state after a delay
      setTimeout(() => {
        setIsRegenerating(false);
      }, 3000);
    }
  };

  const wordCount = editedContent.length;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-medium text-gray-900">AI Generated Draft</h4>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Read Only</span>
            {onRegenerateDraft && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {isRegenerating ? (
                  <>
                    <i className="ri-loader-4-line w-4 h-4 flex items-center justify-center animate-spin"></i>
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-refresh-line w-4 h-4 flex items-center justify-center"></i>
                    <span>Regenerate</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 max-h-32 overflow-y-auto">
          {aiDraft}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-medium text-gray-900">Human Edited Version</h4>
          <span className="text-sm text-gray-500">{wordCount} characters</span>
        </div>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="flex-1 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[300px]"
          placeholder="Edit and refine the AI-generated content here..."
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <i className="ri-information-line w-5 h-5 flex items-center justify-center"></i>
          <span>Click submit after editing to enter QA process</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {isSaving ? (
              <>
                <i className="ri-loader-4-line w-5 h-5 flex items-center justify-center animate-spin"></i>
                <span>Saving</span>
              </>
            ) : (
              <>
                <i className="ri-save-line w-5 h-5 flex items-center justify-center"></i>
                <span>Save Draft</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap cursor-pointer"
          >
            <i className="ri-send-plane-line w-5 h-5 flex items-center justify-center"></i>
            <span>Submit for QA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
