'use client';

import { useState } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed';
  createdAt: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  onCreateProject: (project: { name: string; description: string }) => void;
}

export default function ProjectSelector({ 
  projects, 
  selectedProject, 
  onSelectProject, 
  onCreateProject 
}: ProjectSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim()
      });
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateModal(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <i className="ri-folder-3-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
            <span className="text-sm font-medium text-gray-900 truncate">
              {selectedProject ? selectedProject.name : 'Select Project'}
            </span>
          </div>
          <i className={`ri-arrow-down-s-line w-4 h-4 flex items-center justify-center text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2 border-b border-gray-100">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
              >
                <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
                <span>New Project</span>
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                    selectedProject?.id === project.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {project.description}
                      </div>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </div>
                </button>
              ))}
              
              {projects.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No projects found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter project description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg whitespace-nowrap cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}