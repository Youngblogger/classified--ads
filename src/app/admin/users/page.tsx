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
  Eye,
  Shield,
  AlertTriangle,
  User
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar?: string | null;
  full_avatar_url?: string | null;
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
  const [showSuspended, setShowSuspended] = useState(false);
  const [showBanned, setShowBanned] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'ban' | null>(null);
  const [selectedUserForAction, setSelectedUserForAction] = useState<User | null>(null);

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
      setShowSuspended(false);
      setSelectedUserForAction(null);
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
      setShowBanned(false);
      setSelectedUserForAction(null);
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
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>;
  };

  const truncateEmail = (email: string, maxLength: number = 20) => {
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + '...';
  };

  const getUserInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  const getAvatarUrl = (user: User) => {
    return user.full_avatar_url || user.avatar || null;
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor user accounts</p>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2.5 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActionType('suspend');
                setShowSuspended(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <UserX className="w-4 h-4" />
              Suspend User
            </button>
            <button
              onClick={() => {
                setActionType('ban');
                setShowBanned(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
            >
              <Shield className="w-4 h-4" />
              Ban User
            </button>
          </div>
        </div>

        {/* Selected Users Count */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">{selectedUsers.length} user(s) selected</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100">
                Bulk Suspend
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                Bulk Ban
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ads</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4"><div className="h-5 w-5 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-28 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-8 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-8 w-20 bg-gray-200 rounded ml-auto"></div></td>
                    </tr>
                  ))}
                </>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <User className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const avatarUrl = getAvatarUrl(user);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={user.name}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center ring-2 ring-gray-100">
                              <span className="text-white text-sm font-semibold">
                                {getUserInitials(user.name)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                              {user.verified && (
                                <CheckCircle className="w-4 h-4 text-sky-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-[180px]" title={user.email}>
                          {truncateEmail(user.email)}
                        </p>
                        <p className="text-xs text-gray-500">{user.phone || 'No phone'}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{user.location?.name || 'N/A'}</td>
                      <td className="px-4 py-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 font-medium">{user.ads_count || 0}</td>
                      <td className="px-4 py-4 text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button 
                              onClick={() => {
                                setSelectedUserForAction(user);
                                setActionType('suspend');
                                setShowSuspended(true);
                              }}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                              title="Suspend"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (user.status === 'suspended' || user.suspended_at) ? (
                            <button 
                              onClick={() => handleActivate(user.id)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                              title="Activate"
                              disabled={actionLoading === user.id}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          ) : null}
                          {user.status !== 'banned' && (
                            <button 
                              onClick={() => {
                                setSelectedUserForAction(user);
                                setActionType('ban');
                                setShowBanned(true);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Ban"
                              disabled={actionLoading === user.id}
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(user.id)} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Delete"
                            disabled={actionLoading === user.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
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

      {/* Suspend Confirmation Modal */}
      {showSuspended && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowSuspended(false); setSelectedUserForAction(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Suspend User</h3>
                  <p className="text-sm text-gray-500">
                    {selectedUserForAction ? `Suspending ${selectedUserForAction.name}` : 'Bulk suspend selected users'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                This user will not be able to log in or use their account until you activate them again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowSuspended(false); setSelectedUserForAction(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedUserForAction ? handleSuspend(selectedUserForAction.id) : null}
                  disabled={actionLoading !== null}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                  Suspend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {showBanned && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowBanned(false); setSelectedUserForAction(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ban User</h3>
                  <p className="text-sm text-gray-500">
                    {selectedUserForAction ? `Banning ${selectedUserForAction.name}` : 'Bulk ban selected users'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This action will permanently ban this user from the platform. They will not be able to create new accounts.
              </p>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 mb-6">
                <p className="text-xs text-red-700">
                  This action cannot be undone. The user will be permanently removed from the platform.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowBanned(false); setSelectedUserForAction(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedUserForAction ? handleBan(selectedUserForAction.id) : null}
                  disabled={actionLoading !== null}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Ban User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
