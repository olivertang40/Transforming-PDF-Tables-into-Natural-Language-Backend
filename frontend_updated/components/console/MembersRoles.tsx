
'use client';

import { useState } from 'react';

export default function MembersRoles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // 只显示项目经理角色的成员
  const members = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      role: 'project-manager',
      lastActive: '2小时前',
      status: 'active',
      joinedAt: '2024-01-15',
      projectsManaged: 3,
      tasksCompleted: 145
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@techcorp.com',
      role: 'project-manager',
      lastActive: '5分钟前',
      status: 'active',
      joinedAt: '2024-01-18',
      projectsManaged: 2,
      tasksCompleted: 89
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@techcorp.com',
      role: 'project-manager',
      lastActive: '1天前',
      status: 'inactive',
      joinedAt: '2024-01-10',
      projectsManaged: 1,
      tasksCompleted: 67
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@techcorp.com',
      role: 'project-manager',
      lastActive: '30分钟前',
      status: 'active',
      joinedAt: '2024-01-20',
      projectsManaged: 2,
      tasksCompleted: 123
    }
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">项目经理管理</h2>
          <p className="text-sm text-gray-600 mt-1">管理组织内的项目经理</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-user-add-line w-4 h-4 flex items-center justify-center"></i>
          <span>添加项目经理</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索项目经理..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">项目经理</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">管理项目</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">完成任务</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">最近活跃</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <i className="ri-folder-line w-4 h-4 flex items-center justify-center text-blue-500"></i>
                      <span className="text-sm font-medium text-gray-900">{member.projectsManaged} 个项目</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{member.tasksCompleted}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{member.lastActive}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status === 'active' ? '活跃' : '不活跃'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                        查看项目
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer">
                        编辑信息
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm cursor-pointer">
                        移除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMembers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <i className="ri-user-settings-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到项目经理</h3>
          <p className="text-gray-600">尝试调整搜索条件或添加新的项目经理</p>
        </div>
      )}

      {/* Add Project Manager Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加项目经理</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址 *
                </label>
                <input
                  type="email"
                  placeholder="输入邮箱地址"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <input
                  type="text"
                  placeholder="输入姓名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邀请消息 (可选)
                </label>
                <textarea
                  placeholder="添加个人化的邀请消息..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line w-4 h-4 flex items-center justify-center text-blue-500 mt-0.5"></i>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">项目经理权限说明：</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• 可以创建和管理自己的项目</li>
                      <li>• 可以上传文件和设置标注指南</li>
                      <li>• 可以查看项目进度和质量报告</li>
                      <li>• 无法分配任务给标注员（仅系统管理员可操作）</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap cursor-pointer"
              >
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
