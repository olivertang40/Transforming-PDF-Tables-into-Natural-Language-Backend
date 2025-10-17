'use client';

import { useState } from 'react';

interface ReviewPanelProps {
  task: {
    id: number;
    aiDraft: string;
    humanEdit: string;
    taskNumber: string;
    annotator: string;
    submittedAt: string;
  };
  onReview: (taskId: number, result: 'pass' | 'fail', comment?: string) => void;
}

export default function ReviewPanel({ task, onReview }: ReviewPanelProps) {
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handlePass = () => {
    onReview(task.id, 'pass');
    setComment('');
    setShowCommentBox(false);
  };

  const handleReject = () => {
    if (comment.trim()) {
      onReview(task.id, 'fail', comment.trim());
      setComment('');
      setShowCommentBox(false);
    } else {
      setShowCommentBox(true);
    }
  };

  return (
    <div className="p-4 h-96 flex flex-col space-y-4">
      <div className="text-sm text-gray-600 pb-2 border-b">
        <div>Submitted: {task.submittedAt}</div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <h4 className="font-medium text-gray-900">AI Draft</h4>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700">
            {task.aiDraft}
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h4 className="font-medium text-gray-900">Human Edited Version</h4>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm text-gray-700">
            {task.humanEdit}
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div>Change Summary:</div>
          <div className="bg-yellow-50 p-2 rounded text-yellow-800">
            • Content is more detailed and professional
            • Added data analysis and interpretation
            • Improved accuracy of language expression
            • Enhanced content readability
          </div>
        </div>
      </div>

      {showCommentBox && (
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please specify the reason for rejection..."
            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={3}
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          QA Task: {task.taskNumber}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReject}
            className="flex items-center space-x-1 px-4 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg whitespace-nowrap cursor-pointer"
            aria-label="Reject this task"
          >
            <i className="ri-close-circle-line w-4 h-4 flex items-center justify-center"></i>
            <span>Reject</span>
          </button>
          
          <button
            onClick={handlePass}
            className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg whitespace-nowrap cursor-pointer"
            aria-label="Approve this task"
          >
            <i className="ri-check-circle-line w-4 h-4 flex items-center justify-center"></i>
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
}
