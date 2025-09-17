'use client';

import { useState } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed';
  fileCount: number;
  completedFiles: number;
  createdAt: string;
}

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function ProjectSidebar({ 
  projects, 
  selectedProject, 
  onSelectProject,
  isCollapsed = false,
  onToggleCollapse
}: ProjectSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col">
        <button
          onClick={onToggleCollapse}
          className="p-3 hover:bg-gray-50 border-b border-gray-200 cursor-pointer"
        >
          <i className="ri-menu-unfold-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
        </button>
        
        <div className="flex-1 overflow-y-auto">
          {projects.slice(0, 5).map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`w-full p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                selectedProject?.id === project.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              title={project.name}
            >
              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center mx-auto">
                <span className="text-xs font-medium text-gray-600">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <i className="ri-menu-fold-line w-4 h-4 flex items-center justify-center text-gray-600"></i>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-1">
            {['all', 'active', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1 text-xs rounded-full cursor-pointer ${
                  statusFilter === status
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Completed'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredProjects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
              selectedProject?.id === project.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                project.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                {project.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'active' ? 'Active' : 'Completed'}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {project.description || 'No description'}
                </p>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{project.completedFiles}/{project.fileCount} files</span>
                    <span>{getProgressPercentage(project.completedFiles, project.fileCount)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(project.completedFiles, project.fileCount)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
        
        {filteredProjects.length === 0 && (
          <div className="p-8 text-center">
            <i className="ri-folder-open-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-2"></i>
            <p className="text-sm text-gray-500">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}