'use client';

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

interface ProjectStatsProps {
  project: Project;
}

export default function ProjectStats({ project }: ProjectStatsProps) {
  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const fileProgress = getProgressPercentage(project.completedFiles, project.fileCount);
  const taskProgress = getProgressPercentage(project.completedTasks, project.totalTasks);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
        </div>
        <span className={`px-3 py-1 text-sm rounded-full ${
          project.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {project.status === 'active' ? 'Active' : 'Completed'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{project.fileCount}</div>
          <div className="text-sm text-gray-600 mt-1">Total Files</div>
          <div className="text-xs text-blue-600 mt-2">
            {project.completedFiles} completed
          </div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{project.totalTasks}</div>
          <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
          <div className="text-xs text-green-600 mt-2">
            {project.completedTasks} completed
          </div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{project.qaPendingTasks}</div>
          <div className="text-sm text-gray-600 mt-1">QA Pending</div>
          <div className="text-xs text-orange-600 mt-2">
            awaiting review
          </div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{taskProgress}%</div>
          <div className="text-sm text-gray-600 mt-1">Overall Progress</div>
          <div className="text-xs text-purple-600 mt-2">
            tasks completed
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">File Progress</span>
            <span className="text-sm text-gray-600">{project.completedFiles}/{project.fileCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${fileProgress}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Task Progress</span>
            <span className="text-sm text-gray-600">{project.completedTasks}/{project.totalTasks}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${taskProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Created: {new Date(project.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}