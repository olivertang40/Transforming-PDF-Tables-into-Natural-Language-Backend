'use client';

import FileUpload from '../../components/FileUpload';
import TaskTable from '../../components/TaskTable';
import ProjectSelector from '../../components/ProjectSelector';
import ProjectSidebar from '../../components/ProjectSidebar';
import ProjectStats from '../../components/ProjectStats';
import { useState, useEffect } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed';
  fileCount: number;
  completedFiles: number;
  totalTasks: number;
  completedTasks: number;
  qaPendingTasks: number;
  createdAt: string;
}

interface Task {
  id: number;
  fileName: string;
  taskCount: number;
  completedCount: number;
  status: string;
  assignee: string;
  projectId: number;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'Financial Analysis Q4 2024',
      description: 'Quarterly financial report annotation and analysis',
      status: 'active',
      fileCount: 8,
      completedFiles: 3,
      totalTasks: 68,
      completedTasks: 54,
      qaPendingTasks: 8,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Product Documentation Review',
      description: 'Technical documentation annotation project',
      status: 'active',
      fileCount: 12,
      completedFiles: 9,
      totalTasks: 156,
      completedTasks: 142,
      qaPendingTasks: 5,
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      name: 'Legal Contract Analysis',
      description: 'Contract terms and conditions annotation',
      status: 'completed',
      fileCount: 6,
      completedFiles: 6,
      totalTasks: 48,
      completedTasks: 48,
      qaPendingTasks: 0,
      createdAt: '2023-12-20'
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [allTasks] = useState<Task[]>([
    {
      id: 1,
      fileName: 'Annual Financial Report 2024.pdf',
      taskCount: 15,
      completedCount: 8,
      status: 'in_progress',
      assignee: 'John Smith',
      projectId: 1
    },
    {
      id: 2,
      fileName: 'Product Specification Manual.pdf',
      taskCount: 23,
      completedCount: 23,
      status: 'qa_pending',
      assignee: 'Sarah Johnson',
      projectId: 2
    },
    {
      id: 3,
      fileName: 'Contract Terms Document.pdf',
      taskCount: 12,
      completedCount: 5,
      status: 'in_progress',
      assignee: 'Mike Wilson',
      projectId: 1
    },
    {
      id: 4,
      fileName: 'Technical Architecture Design.pdf',
      taskCount: 18,
      completedCount: 18,
      status: 'completed',
      assignee: 'Emily Davis',
      projectId: 2
    },
    {
      id: 5,
      fileName: 'Legal Agreement Template.pdf',
      taskCount: 8,
      completedCount: 8,
      status: 'completed',
      assignee: 'David Brown',
      projectId: 3
    }
  ]);

  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (selectedProject) {
      const projectTasks = allTasks.filter(task => task.projectId === selectedProject.id);
      setCurrentTasks(projectTasks);
    } else {
      setCurrentTasks([]);
    }
  }, [selectedProject, allTasks]);

  const handleCreateProject = (projectData: { name: string; description: string }) => {
    const newProject: Project = {
      id: projects.length + 1,
      name: projectData.name,
      description: projectData.description,
      status: 'active',
      fileCount: 0,
      completedFiles: 0,
      totalTasks: 0,
      completedTasks: 0,
      qaPendingTasks: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
  };

  const handleFileUpload = (file: File) => {
    if (!selectedProject) return;
    
    const newTask: Task = {
      id: allTasks.length + 1,
      fileName: file.name,
      taskCount: Math.floor(Math.random() * 20) + 5,
      completedCount: 0,
      status: 'pending',
      assignee: '',
      projectId: selectedProject.id
    };
    
    setCurrentTasks([...currentTasks, newTask]);
    
    // Update project stats
    setProjects(projects.map(p => 
      p.id === selectedProject.id 
        ? { ...p, fileCount: p.fileCount + 1, totalTasks: p.totalTasks + newTask.taskCount }
        : p
    ));
  };

  const handleAssignTask = (taskId: number, assignee: string) => {
    setCurrentTasks(currentTasks.map(task => 
      task.id === taskId 
        ? { ...task, assignee, status: 'in_progress' as const }
        : task
    ));
  };

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ProjectSidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="ri-folder-open-line w-16 h-16 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Project</h2>
            <p className="text-gray-600 mb-6">Choose a project from the sidebar to start managing files and tasks</p>
            <div className="flex justify-center">
              <ProjectSelector
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                onCreateProject={handleCreateProject}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProjectSidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <ProjectSelector
                  projects={projects}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                  onCreateProject={handleCreateProject}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <ProjectStats project={selectedProject} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h3>
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">File Management</h3>
                </div>
                {currentTasks.length > 0 ? (
                  <TaskTable 
                    tasks={currentTasks} 
                    onAssignTask={handleAssignTask}
                    showAssignActions={true}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <i className="ri-file-list-3-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-2"></i>
                    <p className="text-gray-500">No files in this project yet</p>
                    <p className="text-sm text-gray-400 mt-1">Upload PDF files to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}