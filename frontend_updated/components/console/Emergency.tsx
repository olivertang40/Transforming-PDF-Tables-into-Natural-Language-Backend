'use client';

import { useState } from 'react';

export default function Emergency() {
  const [actionType, setActionType] = useState('task');
  const [targetId, setTargetId] = useState('');
  const [emergencyAction, setEmergencyAction] = useState('unlock');
  const [confirmationText, setConfirmationText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const recentEmergencyActions = [
    {
      id: 1,
      timestamp: '2024-01-22 14:30:25',
      operator: 'System Admin',
      action: 'Task Unlocked',
      target: 'Task #4521',
      reason: 'Annotator unavailable due to emergency',
      status: 'completed'
    },
    {
      id: 2,
      timestamp: '2024-01-21 09:15:42',
      operator: 'System Admin',
      action: 'User Account Unlocked',
      target: 'john.smith@techcorp.com',
      reason: 'Account locked due to system error',
      status: 'completed'
    },
    {
      id: 3,
      timestamp: '2024-01-20 16:45:18',
      operator: 'System Admin',
      action: 'Task Reassigned',
      target: 'Task #3892',
      reason: 'Critical deadline approaching',
      status: 'completed'
    }
  ];

  const handleEmergencyAction = () => {
    if (!targetId.trim()) {
      alert('Please enter a valid Task ID or User ID');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeEmergencyAction = () => {
    if (confirmationText !== 'CONFIRM') {
      alert('Please type CONFIRM to proceed');
      return;
    }
    
    // Execute emergency action
    console.log('Emergency action executed:', {
      actionType,
      targetId,
      emergencyAction,
      timestamp: new Date().toISOString()
    });
    
    setShowConfirmModal(false);
    setTargetId('');
    setConfirmationText('');
    
    // Show success message
    alert('Emergency action completed successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <i className="ri-alarm-warning-line w-6 h-6 flex items-center justify-center text-red-600 mt-0.5"></i>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Emergency Management</h3>
            <p className="text-sm text-red-700 mt-1">
              Use this section only for critical situations that require immediate intervention. 
              All emergency actions are logged and audited.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Action Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Emergency Action</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="task"
                    checked={actionType === 'task'}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Task</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="user"
                    checked={actionType === 'user'}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">User</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'task' ? 'Task ID' : 'User ID / Email'}
              </label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder={actionType === 'task' ? 'Enter Task ID (e.g., #4521)' : 'Enter User ID or Email'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Action
              </label>
              <select
                value={emergencyAction}
                onChange={(e) => setEmergencyAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {actionType === 'task' ? (
                  <>
                    <option value="unlock">Unlock Task</option>
                    <option value="reassign">Force Reassign</option>
                    <option value="close">Close Task</option>
                  </>
                ) : (
                  <>
                    <option value="unlock">Unlock Account</option>
                    <option value="reset">Reset Password</option>
                    <option value="suspend">Emergency Suspend</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Emergency Action *
              </label>
              <textarea
                placeholder="Provide detailed reason for this emergency action..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <button
              onClick={handleEmergencyAction}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium whitespace-nowrap cursor-pointer"
            >
              Execute Emergency Action
            </button>
          </div>
        </div>

        {/* Recent Emergency Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Emergency Actions</h3>
          
          <div className="space-y-4">
            {recentEmergencyActions.map((action) => (
              <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <i className="ri-alarm-warning-line w-4 h-4 flex items-center justify-center text-red-500"></i>
                    <span className="font-medium text-gray-900">{action.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">{action.timestamp}</span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium text-gray-900">{action.target}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Operator:</span>
                    <span className="text-gray-900">{action.operator}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600">Reason:</span>
                    <p className="text-gray-900 mt-1">{action.reason}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {action.status}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 text-xs cursor-pointer">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex items-center space-x-3 mb-4">
              <i className="ri-alarm-warning-line w-8 h-8 flex items-center justify-center text-red-500"></i>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Emergency Action</h3>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                You are about to execute an emergency action that cannot be undone:
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <div><strong>Action:</strong> {emergencyAction}</div>
                <div><strong>Target:</strong> {targetId}</div>
                <div><strong>Type:</strong> {actionType}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "CONFIRM" to proceed:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="CONFIRM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmationText('');
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeEmergencyAction}
                disabled={confirmationText !== 'CONFIRM'}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg whitespace-nowrap cursor-pointer"
              >
                Execute Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}