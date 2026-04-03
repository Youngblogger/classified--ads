'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Ban,
  Trash2,
  CheckCircle,
  UserCheck,
  UserX,
  Loader2,
  XCircle,
  Eye
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: { name: string } | null;
  status: string;
  verified: boolean;
  created_at: string;
  ads_count?: number;
  banned_at?: string | null;
  suspended_at?: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await adminApi.getUsers(params);
      setUsers(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      setActionLoading(userId);
      await adminApi.activateUser(userId);
      toast.success('User activated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to activate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (userId: number) => {
    try {
      setActionLoading(userId);
      await adminApi.suspendUser(userId);
      toast.success('User suspended');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async (userId: number) => {
    try {
      setActionLoading(userId);
      await adminApi.banUser(userId, 'Violation of terms');
      toast.success('User banned');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      setActionLoading(userId);
      await adminApi.deleteUser(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.status === 'banned' || user.banned_at) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Banned</span>;
    }
    if (user.status === 'suspended' || user.suspended_at) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Suspended</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedUsers.length} selected</span>
            <button className="px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100">
              <UserCheck className="w-4 h-4 inline mr-1" />
              Suspend
            </button>
            <button className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
              <UserX className="w-4 h-4 inline mr-1" />
              Ban
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Location</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ads</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 w-5 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-28 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-200 rounded"></div></td>
                    </tr>
                  ))}
                </>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            {user.verified && (
                              <CheckCircle className="w-4 h-4 text-sky-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.location?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.ads_count || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Suspend">
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : user.status === 'suspended' ? (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Activate">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : null}
                      {user.status !== 'banned' && (
                        <button 
                          onClick={() => handleBan(user.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                          title="Ban"
                          disabled={actionLoading === user.id}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                        title="Delete"
                        disabled={actionLoading === user.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
