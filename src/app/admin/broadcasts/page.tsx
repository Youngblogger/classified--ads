'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Send,
  Clock,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Broadcast {
  id: number;
  title: string;
  message: string;
  recipient_type: string;
  recipientGroup?: string;
  status: string;
  recipients_count?: number;
  sent_count?: number;
  read_count?: number;
  created_at?: string;
  sent_at?: string;
  scheduled_at?: string;
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipient_type: 'all'
  });

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getBroadcasts();
      setBroadcasts(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
      toast.error('Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await adminApi.createBroadcast({
        title: formData.title,
        message: formData.message,
        recipient_type: formData.recipient_type
      });
      toast.success('Broadcast sent successfully');
      setIsModalOpen(false);
      setFormData({ title: '', message: '', recipient_type: 'all' });
      fetchBroadcasts();
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    try {
      await adminApi.deleteBroadcast(id);
      toast.success('Broadcast deleted');
      fetchBroadcasts();
    } catch (error) {
      console.error('Failed to delete broadcast:', error);
      toast.error('Failed to delete broadcast');
    }
  };

  const filteredBroadcasts = broadcasts.filter(bc =>
    (bc.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRecipientIcon = (group: string) => {
    switch (group) {
      case 'verified': return UserCheck;
      case 'unverified': return UserX;
      default: return Users;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-amber-100 text-amber-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search broadcasts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          <Plus className="w-5 h-5" />
          New Broadcast
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-3 w-48 bg-gray-100 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-200 rounded"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredBroadcasts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No broadcasts found
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Recipients</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Sent/Read</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBroadcasts.map((broadcast) => {
                  const RecipientIcon = getRecipientIcon(broadcast.recipient_type || broadcast.recipientGroup || 'all');
                  return (
                    <tr key={broadcast.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{broadcast.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{broadcast.message}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <RecipientIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 capitalize">{broadcast.recipient_type || broadcast.recipientGroup || 'all'}</span>
                          <span className="text-xs text-gray-400">({broadcast.recipients_count || broadcast.sent_count || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(broadcast.status)}`}>
                          {broadcast.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {broadcast.recipients_count ? `${broadcast.read_count || 0}/${broadcast.recipients_count}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(broadcast.sent_at || broadcast.scheduled_at || broadcast.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleDelete(broadcast.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">New Broadcast</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSend} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Broadcast title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={4}
                  placeholder="Broadcast message..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <select
                  value={formData.recipient_type}
                  onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified Users</option>
                  <option value="unverified">Unverified Users</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
