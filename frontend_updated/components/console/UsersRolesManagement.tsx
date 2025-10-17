'use client';

import { useState } from 'react';

export default function UsersRolesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');

  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      organization: 'TechCorp Solutions',
      role: 'project-manager',
      lastActive: '2 hours ago',
      status: 'active',
      avatar: 'JS'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@datatech.com',
      organization: 'DataTech Corp',
      role: 'annotator',
      lastActive: '5 minutes ago',
      status: 'active',
      avatar: 'SJ'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@financeflow.com',
      organization: 'FinanceFlow Inc',
      role: 'qa',
      lastActive: '1 day ago',
      status: 'inactive',
      avatar: 'MW'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@techcorp.com',
      organization: 'TechCorp Solutions',
      role: 'org-admin',
      lastActive: '30 minutes ago',
      status: 'active',
      avatar: 'ED'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@datatech.com',
      organization: 'DataTech Corp',
      role: 'exporter',
      lastActive: '3 hours ago',
      status: 'suspended',
      avatar: 'DB'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesOrg = orgFilter === 'all' || user.organization === orgFilter;
    return matchesSearch && matchesRole && matchesOrg;
  });

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'system-admin': 'System Admin',
      'org-admin': 'Org Admin',
      'project-manager': 'Project Manager',
      'annotator': 'Annotator',
      'qa': 'QA Reviewer',
      'exporter': 'Data Exporter'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'system-admin': 'bg-purple-100 text-purple-800',
      'org-admin': 'bg-blue-100 text-blue-800',
      'project-manager': 'bg-green-100 text-green-800',
      'annotator': 'bg-yellow-100 text-yellow-800',
      'qa': 'bg-orange-100 text-orange-800',
      'exporter': 'bg-gray-100 text-gray-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Users & Roles Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage users across all organizations</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap cursor-pointer">
          <i className="ri-user-add-line w-4 h-4 flex items-center justify-center"></i>
          <span>Invite User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="system-admin">System Admin</option>
          <option value="org-admin">Org Admin</option>
          <option value="project-manager">Project Manager</option>
          <option value="annotator">Annotator</option>
          <option value="qa">QA Reviewer</option>
          <option value="exporter">Data Exporter</option>
        </select>
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Organizations</option>
          <option value="TechCorp Solutions">TechCorp Solutions</option>
          <option value="DataTech Corp">DataTech Corp</option>
          <option value="FinanceFlow Inc">FinanceFlow Inc</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Organization</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Active</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{user.avatar}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{user.organization}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{user.lastActive}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Active' : 
                       user.status === 'inactive' ? 'Inactive' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                        Edit Role
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer">
                        Reset Password
                      </button>
                      <button className={`text-sm cursor-pointer ${
                        user.status === 'suspended' 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-red-600 hover:text-red-700'
                      }`}>
                        {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <i className="ri-team-line w-12 h-12 flex items-center justify-center text-gray-300 mx-auto mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}