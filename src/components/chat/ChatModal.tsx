'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Paperclip, Image, MoreVertical, Phone, Video, Flag, UserPlus, UserMinus, Check, CheckCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useSocket } from '@/hooks/useSocket';
import { getAuthToken } from '@/lib/cookies';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  message_type: string;
  attachment_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: number;
  adTitle: string;
  sellerId: number;
  sellerName: string;
  sellerAvatar?: string;
  conversationId?: number;
}

export default function ChatModal({
  isOpen,
  onClose,
  adId,
  adTitle,
  sellerId,
  sellerName,
  sellerAvatar,
  conversationId: initialConversationId,
}: ChatModalProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [conversationId, setConversationId] = useState<number | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = user?.id;

  const handleNewMessage = useCallback((message: Message) => {
    if (message.conversation_id === conversationId) {
      setMessages((prev) => [...prev, message]);
    }
  }, [conversationId]);

  const handleStopTyping = useCallback((data: { conversationId: string; userId: number }) => {
    if (parseInt(data.conversationId) === conversationId) {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    }
  }, [conversationId]);

  const handleTypingEvent = useCallback((data: { conversationId: string; userId: number }) => {
    if (parseInt(data.conversationId) === conversationId && data.userId !== currentUserId) {
      setTypingUsers((prev) => [...prev, data.userId]);
    }
  }, [conversationId, currentUserId]);

  const { joinConversation, leaveConversation, sendMessage, sendTyping, stopTyping, isUserOnline } = useSocket({
    userId: currentUserId,
    onNewMessage: handleNewMessage,
    onUserTyping: handleTypingEvent,
    onUserOffline: handleStopTyping,
  });

  // Create or get conversation
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !adId || !sellerId) return;

    const initConversation = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(
          `${API_URL}/messages/conversation/get-or-create?receiver_id=${sellerId}&ad_id=${adId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setConversationId(response.data.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    };

    if (!conversationId) {
      initConversation();
    }
  }, [isOpen, isAuthenticated, adId, sellerId, conversationId]);

  // Join conversation room and fetch messages
  useEffect(() => {
    if (!conversationId || !isOpen) return;

    joinConversation(conversationId.toString());
    fetchMessages();

    return () => {
      leaveConversation(conversationId.toString());
    };
  }, [conversationId, isOpen, joinConversation, leaveConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_URL}/messages/${conversationId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || isBlocked) return;

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/messages`,
        {
          receiver_id: sellerId,
          ad_id: adId,
          message: newMessage.trim(),
          message_type: 'text',
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      // Send via socket for real-time
      sendMessage({
        conversationId: conversationId.toString(),
        message: response.data,
        receiverId: sellerId,
        senderId: currentUserId!,
      });

      setNewMessage('');
      stopTyping({ conversationId: conversationId.toString(), userId: currentUserId! });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('receiver_id', sellerId.toString());
    formData.append('ad_id', adId.toString());
    formData.append('message', 'Sent an attachment');

    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_URL}/messages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      sendMessage({
        conversationId: conversationId.toString(),
        message: response.data,
        receiverId: sellerId,
        senderId: currentUserId!,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleTyping = () => {
    if (!conversationId || !currentUserId) return;
    
    if (!isTyping) {
      setIsTyping(true);
      sendTyping({ conversationId: conversationId.toString(), userId: currentUserId });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping({ conversationId: conversationId.toString(), userId: currentUserId });
    }, 2000);
  };

  const handleBlockUser = async () => {
    try {
      const token = getAuthToken();
      await axios.post(`${API_URL}/messages/block/${sellerId}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setIsBlocked(true);
      setShowActions(false);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleReport = async () => {
    if (!conversationId) return;
    
    const reason = prompt('Please provide a reason for reporting this conversation:');
    if (!reason) return;

    try {
      const token = getAuthToken();
      await axios.post(`${API_URL}/messages/report/${conversationId}`, { reason }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      alert('Conversation reported successfully');
      setShowActions(false);
    } catch (error) {
      console.error('Error reporting conversation:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  const isSellerOnline = isUserOnline(sellerId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[90vh] md:h-[600px] flex flex-col max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative">
              {sellerAvatar ? (
                <img src={sellerAvatar} alt={sellerName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">{sellerName[0]}</span>
                </div>
              )}
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isSellerOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-dark">{sellerName}</h3>
              <p className="text-xs text-gray-500">{isSellerOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Actions Dropdown */}
        {showActions && (
          <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border py-2 z-10">
            <button onClick={handleBlockUser} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full">
              <UserMinus className="w-4 h-4" />
              <span>Block User</span>
            </button>
            <button onClick={handleReport} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-red-500">
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
        )}

        {/* Ad Reference */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <p className="text-sm text-gray-500">Discussing:</p>
          <p className="font-medium text-dark truncate">{adTitle}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
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
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                    {msg.message_type === 'image' && msg.attachment_url && (
                      <img src={msg.attachment_url} alt=" attachment" className="rounded-lg max-w-full" />
                    )}
                    {msg.message_type === 'file' && msg.attachment_url && (
                      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">Attachment</span>
                      </a>
                    )}
                    {msg.message && (
                      <div className={`px-4 py-2 rounded-2xl ${
                        isMe 
                          ? 'bg-primary-600 text-white rounded-br-sm' 
                          : 'bg-gray-100 text-dark rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                    )}
                    <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isMe ? 'justify-end' : ''}`}>
                      <span>{formatTime(msg.created_at)}</span>
                      {isMe && (
                        <span>
                          {msg.is_read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Blocked State */}
        {isBlocked && (
          <div className="p-4 bg-red-50 text-red-600 text-center">
            You have blocked this user. Unblock to send messages.
          </div>
        )}

        {/* Input */}
        {!isBlocked && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,audio/*,.pdf,.doc,.docx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {/* Quick Reply Buttons */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-2 px-2">
                <button
                  onClick={() => setNewMessage("Is this still available?")}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  Is this still available?
                </button>
                <button
                  onClick={() => setNewMessage("What is your last price?")}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  What is your last price?
                </button>
                <button
                  onClick={() => setNewMessage("What condition is this item in?")}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  What condition is this item?
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
