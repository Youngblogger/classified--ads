'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Search, Send } from 'lucide-react';
import { messagesApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Conversation {
  id: number;
  participant: {
    id: number;
    name: string;
    avatar: string | null;
    is_online?: boolean;
  };
  ad: {
    id: number;
    title: string;
    image: string;
    price: number;
    slug: string;
  };
  last_message?: string;
  lastMessage?: string;
  unread_count?: number;
  unread?: number;
  updated_at?: string;
  time?: string;
  is_online?: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  message: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function MessagesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = user?.id;

  const handleNewMessage = useCallback((message: Message & { conversation_id: number }) => {
    if (!message || !message.conversation_id) return;
    if (selectedConversation && message.conversation_id === selectedConversation.id) {
      setMessages((prev) => [...prev, message]);
    }
    setConversations((prev) => 
      prev.map(conv => 
        conv.id === message.conversation_id 
          ? { ...conv, last_message: message.message, unread: conv.unread ? conv.unread + 1 : 1 }
          : conv
      )
    );
  }, [selectedConversation]);

  const socketHook = currentUserId ? useSocket({
    userId: currentUserId,
    onNewMessage: handleNewMessage as any,
  }) : { joinConversation: () => {}, leaveConversation: () => {}, sendMessage: () => {}, isUserOnline: () => false };

  const { joinConversation, leaveConversation, sendMessage, isUserOnline } = socketHook;

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedConversation) {
      joinConversation(selectedConversation.id.toString());
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);

      return () => {
        leaveConversation(selectedConversation.id.toString());
      };
    }
  }, [selectedConversation, joinConversation, leaveConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await messagesApi.getConversations();
      const data = res.data?.data || res.data || [];
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      const res = await messagesApi.getMessages(conversationId);
      const data = res.data?.data || res.data || [];
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markAsRead = async (conversationId: number) => {
    try {
      await messagesApi.markAsRead(conversationId);
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unread: 0, unread_count: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const res = await messagesApi.sendMessage(selectedConversation.id, messageInput.trim());
      const newMessage = res.data;
      
      sendMessage({
        conversationId: selectedConversation.id.toString(),
        message: newMessage,
        receiverId: selectedConversation.participant.id,
        senderId: currentUserId!,
      });

      setMessages(prev => [...prev, newMessage]);
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id ? { ...c, last_message: messageInput.trim() } : c
      ));
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    try {
      const res = await messagesApi.sendMessage(selectedConversation.id, 'Sent an attachment', file);
      const newMessage = res.data;

      sendMessage({
        conversationId: selectedConversation.id.toString(),
        message: newMessage,
        receiverId: selectedConversation.participant.id,
        senderId: currentUserId!,
      });

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.ad?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvatarUrl = (avatar: string | null): string => {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${avatar}`;
  };

  const isParticipantOnline = selectedConversation?.participant?.id 
    ? isUserOnline(selectedConversation.participant.id)
    : false;

  return (
    <div className="h-[calc(100vh-180px)] bg-white rounded-2xl shadow-card overflow-hidden flex">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations found</div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    {conv.participant?.avatar ? (
                      <Image
                        src={getAvatarUrl(conv.participant.avatar)}
                        alt={conv.participant.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-primary-100">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                  </div>
                  {(conv.is_online || conv.participant?.is_online) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">{conv.participant?.name || 'Unknown'}</p>
                    <span className="text-xs text-gray-400">{formatTime(conv.updated_at) || conv.time || ''}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.last_message || conv.lastMessage || ''}</p>
                </div>
                {(conv.unread || conv.unread_count || 0) > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unread || conv.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <button
              onClick={() => setSelectedConversation(null)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {selectedConversation.participant?.avatar ? (
                  <Image
                    src={getAvatarUrl(selectedConversation.participant.avatar)}
                    alt={selectedConversation.participant.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-primary-100 text-primary-600 font-semibold">
                    {selectedConversation.participant?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              {isParticipantOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{selectedConversation.participant?.name || 'Unknown'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{selectedConversation.ad?.title}</span>
                <span>•</span>
                <span className="font-medium text-primary-600">${selectedConversation.ad?.price}</span>
              </div>
            </div>
          </div>

          {/* Ad Preview */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
              {selectedConversation.ad?.image && (
                <Image
                  src={selectedConversation.ad.image}
                  alt={selectedConversation.ad.title}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{selectedConversation.ad?.title}</p>
              <p className="text-primary-600 font-semibold">${selectedConversation.ad?.price}</p>
            </div>
            <button 
              onClick={() => router.push(`/ad/${selectedConversation.ad?.slug}`)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              View Ad
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMessages ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      {msg.message_type === 'image' && msg.attachment_url && (
                        <img src={msg.attachment_url} alt="attachment" className="rounded-lg max-w-full mb-2" />
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,audio/*,.pdf,.doc,.docx"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">Select a conversation</p>
            <p className="text-sm">Choose from your existing conversations or start a new one</p>
          </div>
        </div>
      )}
    </div>
  );
}