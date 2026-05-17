'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  MessageSquare,
  Loader2,
  Send,
  Eye,
  Users,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { messagesApi, adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Conversation {
  id: number;
  participants: {
    id: number;
    name: string;
    avatar: string | null;
    email: string;
  }[];
  last_message?: string;
  lastMessage?: string;
  ad_title?: string;
  ad?: {
    id: number;
    title: string;
    price: number;
    user_id: number;
  };
  unread_count?: number;
  unread?: number;
  updated_at?: string;
  time?: string;
  is_reported?: boolean;
  report_count?: number;
}

interface Message {
  id: number;
  sender_id: number;
  sender?: {
    id: number;
    name: string;
    avatar: string | null;
  };
  message: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

interface ChatStats {
  total_conversations: number;
  active_today: number;
  reported_count: number;
  messages_today: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'reported' | 'unread' | 'active'>('all');
  const [stats, setStats] = useState<ChatStats | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await messagesApi.getConversations().catch(() => ({ data: { data: [] } }));
      let data = res.data?.data || res.data || [];
      
      if (filter === 'reported') {
        data = data.filter((c: Conversation) => c.is_reported || (c.report_count || 0) > 0);
      } else if (filter === 'unread') {
        data = data.filter((c: Conversation) => (c.unread_count || c.unread || 0) > 0);
      }
      
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getDashboard().catch(() => ({ data: null }));
      if (res.data) {
        setStats({
          total_conversations: res.data.total_conversations || 0,
          active_today: res.data.active_today || 0,
          reported_count: res.data.reported_conversations || 0,
          messages_today: res.data.messages_today || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      const res = await messagesApi.getMessages(conversationId);
      setMessages(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      (conv.participants?.some(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) || false) ||
      (conv.ad_title || conv.ad?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 2) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAvatarUrl = (avatar: string | null): string | undefined => {
    if (!avatar) return undefined;
    if (avatar.startsWith('http')) return avatar;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${avatar}`;
  };

  const selectedConvData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Conversations</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.total_conversations || conversations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Today</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.active_today || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Reported Chats</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.reported_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Messages Today</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.messages_today || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-320px)]">
        {/* Conversations List */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col">
          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user or ad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setFilter('all'); fetchConversations(); }}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  filter === 'all' 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setFilter('unread'); fetchConversations(); }}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                  filter === 'unread' 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread
                {conversations.reduce((acc, c) => acc + (c.unread_count || c.unread || 0), 0) > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conversations.reduce((acc, c) => acc + (c.unread_count || c.unread || 0), 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setFilter('reported'); fetchConversations(); }}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  filter === 'reported' 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Reported
              </button>
              <button
                onClick={() => { fetchConversations(); fetchStats(); }}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-4 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations found</div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conv.id ? 'bg-sky-50' : ''
                  } ${(conv.is_reported || (conv.report_count || 0) > 0) ? 'bg-red-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      {conv.participants?.[0]?.avatar ? (
                        <Image 
                          src={getAvatarUrl(conv.participants[0].avatar) || ''} 
                          alt={conv.participants[0].name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {(conv.participants?.[0]?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {conv.participants?.map(p => p.name).join(' & ') || 'Unknown'}
                          </p>
                          {conv.is_reported || (conv.report_count || 0) > 0 ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : null}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTime(conv.updated_at) || conv.time || ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.ad_title || conv.ad?.title || 'Unknown Ad'}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {conv.last_message || conv.lastMessage || 'No messages'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {(conv.unread_count || conv.unread || 0) > 0 && (
                        <span className="w-5 h-5 bg-sky-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unread_count || conv.unread}
                        </span>
                      )}
                      {conv.ad?.price && (
                        <span className="text-xs font-medium text-sky-600">₦{conv.ad.price?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col">
          {loadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
            </div>
          ) : !selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg mb-1">Select a conversation</p>
                <p className="text-sm">Choose from the list to view messages</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p>No messages in this conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConvData?.participants?.map(p => p.name).join(' & ') || 'Conversation'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConvData?.ad_title || selectedConvData?.ad?.title || 'Unknown Ad'}
                      {selectedConvData?.ad?.price && ` - ₦${selectedConvData.ad.price?.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConvData?.is_reported || (selectedConvData?.report_count || 0) > 0 ? (
                      <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 text-sm rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        Reported
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 text-sm rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Clean
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isAdmin = msg.sender?.id === 0;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isAdmin
                          ? 'bg-sky-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {msg.message_type === 'image' && msg.attachment_url && (
                          <Image 
                            src={msg.attachment_url} 
                            alt="attachment" 
                            width={400}
                            height={300}
                            className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90 transition-opacity w-full h-auto"
                            onClick={() => { if (msg.attachment_url) setPreviewImage(msg.attachment_url); }}
                          />
                        )}
                        {msg.message_type === 'file' && msg.attachment_url && (
                          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-2">
                            <span className="underline">View attachment</span>
                          </a>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <div className={`flex items-center gap-2 mt-1 text-xs ${
                          isAdmin ? 'text-sky-200' : 'text-gray-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{new Date(msg.created_at).toLocaleString()}</span>
                          <span>• {msg.sender?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Info Footer */}
              <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                <span>
                  Participants: {selectedConvData?.participants?.map(p => p.email).join(', ') || 'N/A'}
                </span>
                <span>
                  Ad ID: {selectedConvData?.ad?.id || 'N/A'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative" style={{ maxHeight: '90vh', maxWidth: '90vw', width: '100%', height: '90vh' }}>
            <Image
              src={previewImage}
              alt="Fullscreen preview"
              fill
              sizes="90vw"
              className="object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
