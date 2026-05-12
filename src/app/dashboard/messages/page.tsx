'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Search, Mic, Square, Play, Pause, X, Trash2, ChevronLeft, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { messagesApi, adsApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

function getStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Handle full HTTP URLs - return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/storage/')) {
    return API_URL.replace('/api', '') + url;
  }
  if (url.startsWith('storage/')) {
    return API_URL.replace('/api', '') + '/' + url;
  }
  // Default: assume it's a filename
  return API_URL.replace('/api', '') + '/storage/' + url;
}

interface Conversation {
  id: number;
  sender_id?: number;
  receiver_id?: number;
  sender?: { id: number; name: string; avatar: string | null; avatar_url?: string | null; google_avatar?: string | null };
  receiver?: { id: number; name: string; avatar: string | null; avatar_url?: string | null; google_avatar?: string | null };
  participant?: {
    id: number;
    name: string;
    avatar: string | null;
    avatar_url?: string | null;
    is_online?: boolean;
  };
  ad?: {
    id: number;
    title: string;
    image?: string;
    images?: { url?: string; full_url?: string; full_thumbnail_url?: string; thumbnail_url?: string; thumbnail?: string; display_url?: string; is_primary?: boolean }[];
    price: number;
    slug: string;
    thumbnail?: string;
    thumbnail_url?: string;
    display_url?: string;
  };
  ad_id?: number;
  ad_slug?: string;
  last_message?: string;
  last_message_content?: string;
  latestMessage?: { content: string };
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
  content: string;
  message_type?: string;
  attachment_url?: string | null;
  audio_url?: string | null;
  is_read?: boolean;
  read_at?: string | null;
  created_at: string;
  duration?: number;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
  sender?: {
    id: number;
    name: string;
    avatar?: string | null;
    avatar_url?: string | null;
    google_avatar?: string | null;
  };
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
  const [adDetails, setAdDetails] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = user?.id;

  // WhatsApp-style Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [isSlideCancelling, setIsSlideCancelling] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  
  // Playback states
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<{ [key: number]: number }>({});
  const [playbackDuration, setPlaybackDuration] = useState<{ [key: number]: number }>({});
  const [playbackSpeed, setPlaybackSpeed] = useState<{ [key: number]: number }>({});
  const audioElementsRef = useRef<{ [key: number]: HTMLAudioElement }>({});
  
  // Long press for delete
  const [longPressMessageId, setLongPressMessageId] = useState<number | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Image fullscreen preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const MAX_RECORDING_DURATION = 60; // 60 seconds max
  const SLIDE_CANCEL_THRESHOLD = 100; // pixels to slide to cancel

  const handleNewMessage = useCallback((message: Message & { conversation_id: number }) => {
    if (!message || !message.conversation_id) return;
    
    // Check if message already exists in state to prevent duplicates
    setMessages((prev) => {
      const exists = prev.some(msg => msg.id === message.id || 
        (msg.id === message.id && msg.message_type === message.message_type));
      if (exists) return prev;
      
      if (selectedConversation && message.conversation_id === selectedConversation.id) {
        // Auto-mark as read if viewing the conversation
        return [...prev, { ...message, status: 'seen' as const, is_read: true, read_at: new Date().toISOString() }];
      }
      return prev;
    });
    
    setConversations((prev) => 
      prev.map(conv => 
        conv.id === message.conversation_id 
          ? { ...conv, last_message: message.content, unread: conv.unread ? conv.unread + 1 : 1 }
          : conv
      )
    );
  }, [selectedConversation]);

  // Handle message read receipt
  const handleMessageRead = useCallback((data: { messageId: number; conversationId: number }) => {
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === data.messageId 
          ? { ...msg, status: 'seen', is_read: true, read_at: new Date().toISOString() } 
          : msg
      )
    );
  }, []);

  const socket = useSocket({
    userId: currentUserId,
    onNewMessage: handleNewMessage as any,
    onMessageRead: handleMessageRead,
  });

  const { joinConversation, leaveConversation, sendMessage, isUserOnline, markRead } = socket;

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
      
      // Update all messages in this conversation to seen status
      setMessages(prev => prev.map(msg => ({
        ...msg,
        status: 'seen' as const,
        is_read: true,
        read_at: msg.read_at || new Date().toISOString()
      })));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
      joinConversation(String(selectedConversation.id));
      
      return () => {
        leaveConversation(String(selectedConversation.id));
      };
    } else {
      setMessages([]);
    }
  }, [selectedConversation, joinConversation, leaveConversation]);

  // WhatsApp-style Voice Recording Functions
  const startRecording = async () => {
    try {
      // Vibrate feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // iOS fallback
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
          ? 'audio/mp4' 
          : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());
        
        // Only save if not cancelled by slide
        if (!isSlideCancelling) {
          setRecordedBlob(blob);
          setRecordedAudioUrl(URL.createObjectURL(blob));
          setIsRecording(false);
        } else {
          setIsSlideCancelling(false);
        }
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start(100); // Capture data every 100ms
      setIsRecording(true);
      setRecordingDuration(0);
      recordingStartTimeRef.current = Date.now();

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          // Auto-stop at max duration
          if (newDuration >= MAX_RECORDING_DURATION) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Please allow microphone access to send voice notes');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Vibrate feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setRecordingDuration(0);
    setIsPlayingPreview(false);
    setSlideOffset(0);
    setUploadProgress(null);
  };

  const handleSlideCancel = (e: React.TouchEvent | React.MouseEvent) => {
    // Cancel recording if sliding left
    setIsSlideCancelling(true);
    cancelRecording();
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const playPreview = () => {
    if (!recordedAudioUrl) return;
    
    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      setIsPlayingPreview(false);
      return;
    }
    
    previewAudioRef.current = new Audio(recordedAudioUrl);
    previewAudioRef.current.play();
    setIsPlayingPreview(true);
    
    previewAudioRef.current.onended = () => {
      setIsPlayingPreview(false);
    };
  };

  const sendVoiceNote = async () => {
    if (!recordedBlob || !recordedAudioUrl || !selectedConversation) return;

    // Get the other user's ID (not the current user)
    let receiverId = selectedConversation.participant?.id;
    if (!receiverId) {
      if (selectedConversation.receiver_id !== currentUserId) {
        receiverId = selectedConversation.receiver_id;
      } else {
        receiverId = selectedConversation.sender_id;
      }
    }
    
    // Also try the receiver/sender objects
    if (!receiverId || receiverId === currentUserId) {
      receiverId = selectedConversation.receiver?.id;
    }
    if (!receiverId || receiverId === currentUserId) {
      receiverId = selectedConversation.sender?.id;
    }
    
    if (!receiverId || receiverId === currentUserId) {
      toast.error('Invalid receiver');
      return;
    }

    // Keep a reference to the audio URL for the optimistic message
    const audioUrlToSend = recordedAudioUrl;

    // Vibrate feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    try {
      // Create optimistic message
      const tempId = Date.now();
      const optimisticMessage: Message = {
        id: tempId,
        sender_id: currentUserId!,
        content: '',
        message_type: 'voice',
        attachment_url: audioUrlToSend,
        status: 'sending',
        created_at: new Date().toISOString(),
        duration: recordingDuration,
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Clear recording state AFTER adding optimistic message
      setRecordedBlob(null);
      setRecordedAudioUrl(null);
      setRecordingDuration(0);
      setIsPlayingPreview(false);
      // Don't revoke the URL yet - the optimistic message needs it

      // Send to backend
      const res = await messagesApi.sendVoiceMessage(
        selectedConversation.id, 
        recordedBlob, 
        recordingDuration,
        (progress) => setUploadProgress(progress)
      );
      
      const newMessage = res.data;
      
      // Now safely revoke the blob URL
      URL.revokeObjectURL(audioUrlToSend);
      
      // Update optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...newMessage, status: 'sent' } : msg
      ));

      sendMessage({
        conversationId: selectedConversation.id.toString(),
        message: newMessage,
        receiverId: receiverId,
        senderId: currentUserId!,
      });
      
      setUploadProgress(null);
    } catch (error) {
      console.error('Error sending voice note:', error);
      toast.error('Failed to send voice note. Tap to retry.');
      // Revoke URL on error too
      if (audioUrlToSend) {
        URL.revokeObjectURL(audioUrlToSend);
      }
    }
  };

  const playAudio = (msgId: number, url: string) => {
    
    // Stop any currently playing audio
    if (playingAudioId !== null && audioElementsRef.current[playingAudioId]) {
      audioElementsRef.current[playingAudioId].pause();
    }

    // If clicking the same audio, just stop it
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      setPlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
      return;
    }

    const audio = new Audio(url);
    audioElementsRef.current[msgId] = audio;
    setPlayingAudioId(msgId);

    // Apply playback speed
    const speed = playbackSpeed[msgId] || 1;
    audio.playbackRate = speed;

    audio.onloadedmetadata = () => {
      setPlaybackDuration(prev => ({ ...prev, [msgId]: audio.duration || 0 }));
    };

    audio.ontimeupdate = () => {
      if (!audio.duration || isNaN(audio.duration)) return;
      const progress = (audio.currentTime / audio.duration) * 100;
      if (isNaN(progress) || !isFinite(progress)) return;
      setPlaybackProgress(prev => ({ ...prev, [msgId]: progress }));
    };

    audio.onended = () => {
      setPlayingAudioId(null);
      setPlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
    };

    audio.onerror = (e) => {
      console.error('Audio error:', e);
      setPlayingAudioId(null);
      setPlaybackDuration(prev => ({ ...prev, [msgId]: 0 }));
      toast.error('Failed to play audio');
    };

    audio.play().catch(err => {
      console.error('Playback error:', err);
      setPlayingAudioId(null);
    });
  };

  const stopAudio = (msgId: number) => {
    if (audioElementsRef.current[msgId]) {
      audioElementsRef.current[msgId].pause();
      audioElementsRef.current[msgId].currentTime = 0;
      setPlayingAudioId(null);
      setPlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
    }
  };

  const seekAudio = (msgId: number, e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioElementsRef.current[msgId];
    const duration = playbackDuration[msgId];
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setPlaybackProgress(prev => ({ ...prev, [msgId]: percentage * 100 }));
  };

  const cyclePlaybackSpeed = (msgId: number) => {
    const speeds = [1, 1.5, 2];
    const currentSpeed = playbackSpeed[msgId] || 1;
    const currentIndex = speeds.indexOf(currentSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    setPlaybackSpeed(prev => ({ ...prev, [msgId]: nextSpeed }));
    
    if (audioElementsRef.current[msgId]) {
      audioElementsRef.current[msgId].playbackRate = nextSpeed;
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await messagesApi.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const startLongPress = (msgId: number, isMe: boolean) => {
    if (!isMe) return;
    longPressTimerRef.current = setTimeout(() => {
      setLongPressMessageId(msgId);
      // Show delete option
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    // Get the other user's ID (not the current user)
    let receiverId = selectedConversation.participant?.id;
    if (!receiverId) {
      if (selectedConversation.receiver_id !== currentUserId) {
        receiverId = selectedConversation.receiver_id;
      } else {
        receiverId = selectedConversation.sender_id;
      }
    }
    
    // Also try the receiver/sender objects
    if (!receiverId || receiverId === currentUserId) {
      receiverId = selectedConversation.receiver?.id;
    }
    if (!receiverId || receiverId === currentUserId) {
      receiverId = selectedConversation.sender?.id;
    }
    
    if (!receiverId || receiverId === currentUserId) {
      toast.error('Invalid receiver');
      return;
    }

    try {
      const res = await messagesApi.sendMessage(selectedConversation.id, messageInput.trim());
      const newMessage = res.data;
      
      sendMessage({
        conversationId: selectedConversation.id.toString(),
        message: newMessage,
        receiverId: receiverId,
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

    // Get the other user's ID (not the current user)
    let receiverId = selectedConversation.participant?.id;
    if (!receiverId) {
      if (selectedConversation.receiver_id !== currentUserId) {
        receiverId = selectedConversation.receiver_id;
      } else {
        receiverId = selectedConversation.sender_id;
      }
    }
    
    // Also try the receiver/sender objects
    if (!receiverId || receiverId === currentUserId) {
      receiverId = selectedConversation.receiver?.id;
    }
    if (!receiverId || receiverId === currentUserId) {
      receiverId = selectedConversation.sender?.id;
    }
    
    if (!receiverId || receiverId === currentUserId) {
      return;
    }

    try {
      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      const res = await messagesApi.sendMessage(selectedConversation.id, `Sent a ${messageType}`, file, messageType);
      const newMessage = res.data;

      sendMessage({
        conversationId: selectedConversation.id.toString(),
        message: newMessage,
        receiverId: receiverId,
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

  const otherUserId = selectedConversation?.sender?.id === currentUserId 
    ? selectedConversation?.receiver?.id 
    : selectedConversation?.sender?.id;
  const isParticipantOnline = otherUserId ? isUserOnline(otherUserId) : false;

  return (
    <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-180px)] bg-white md:rounded-2xl md:shadow-card overflow-hidden flex">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:border-primary-500"
            />
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
                    <div className="h-3 w-48 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations found</div>
          ) : (
            filteredConversations.map((conv) => {
              const otherUser = conv.sender?.id === currentUserId ? conv.receiver : conv.sender;
              const otherUserAvatar = otherUser?.avatar_url || otherUser?.avatar || otherUser?.google_avatar;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-3 sm:p-4 flex items-start gap-2 sm:gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden">
                      {otherUserAvatar ? (
                        <Image
                          src={getAvatarUrl(otherUserAvatar)}
                          alt={otherUser?.name || 'User'}
                          width={48}
                          height={48}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary-100">
                          <span className="text-primary-600 font-semibold text-sm sm:text-base">
                            {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    {conv.is_online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{otherUser?.name || 'Unknown'}</p>
                      <span className="text-[10px] sm:text-xs text-gray-400">{formatTime(conv.updated_at) || conv.time || ''}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {conv.last_message_content || conv.last_message || conv.latestMessage?.content || conv.lastMessage || ''}
                    </p>
                  </div>
                  {(conv.unread || conv.unread_count || 0) > 0 && (
                    <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-primary-600 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                      {conv.unread || conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-2 sm:p-4 border-b border-gray-200 flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSelectedConversation(null)}
              className="md:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {(() => {
              const otherUser = selectedConversation.sender?.id === currentUserId 
                ? selectedConversation.receiver 
                : selectedConversation.sender;
              const otherUserAvatar = otherUser?.avatar_url || otherUser?.avatar || otherUser?.google_avatar;
              
              return (
                <>
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden">
                      {otherUserAvatar ? (
                        <Image
                          src={getAvatarUrl(otherUserAvatar)}
                          alt={otherUser?.name || 'User'}
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary-100 text-primary-600 font-semibold text-sm sm:text-base">
                          {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    {selectedConversation.is_online && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{otherUser?.name || 'Unknown'}</p>
                    {selectedConversation.ad && (
                      <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <span className="truncate">{selectedConversation.ad.title}</span>
                        <span>•</span>
                        <span className="font-medium text-primary-600 whitespace-nowrap">₦{Number(selectedConversation.ad.price || 0).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Ad Preview */}
          {(() => {
            
            // Use adDetails if available, otherwise use conversation ad
            const ad = adDetails || selectedConversation.ad;
            const adAny = ad as any;
            
            // Get image from different sources with fallback
            let imageUrl = adAny?.image || adAny?.thumbnail || adAny?.thumbnail_url || adAny?.display_url;
            
            // Check images array
            if (!imageUrl && adAny?.images && Array.isArray(adAny.images) && adAny.images.length > 0) {
              const primaryImage = adAny.images.find((img: any) => img?.is_primary) || adAny.images[0];
              imageUrl = primaryImage?.full_url || primaryImage?.full_thumbnail_url || primaryImage?.url || primaryImage?.thumbnail_url || primaryImage?.thumbnail;
            }
            
            // Check if imageUrl is actually a user avatar (contains 'avatars')
            if (imageUrl && imageUrl.includes('avatars')) {
              imageUrl = undefined; // Reset to try other sources
            }
            
            // Get formatted URL or use placeholder
            const formattedUrl = getStorageUrl(imageUrl);
            const displayImageUrl = formattedUrl || '/placeholder-image.svg';
            
            const adTitle = selectedConversation.ad?.title || adDetails?.title || 'Ad Title';
            const adPrice = Number(selectedConversation.ad?.price || adDetails?.price || 0).toLocaleString();
            const adSlug = selectedConversation.ad?.slug || adDetails?.slug || (selectedConversation as any).ad_slug || '';
            
            return (
              <div className="p-2 sm:p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 sm:gap-3">
                {/* Ad Image - Fixed size with object-cover */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={displayImageUrl}
                    alt={adTitle}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      // Hide broken images
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Ad Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{adTitle}</p>
                  <p className="text-primary-600 font-semibold text-xs sm:text-sm">₦{adPrice}</p>
                </div>
                
                {/* View Ad Button */}
                <button 
                  onClick={() => router.push(`/ad/${adSlug}`)}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-600 text-white rounded-lg text-[10px] sm:text-xs font-medium hover:bg-primary-700 flex-shrink-0 whitespace-nowrap"
                >
                  View
                </button>
              </div>
            );
          })()}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
            {loadingMessages ? (
              <div className="flex flex-col gap-4 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                    <div className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-40'} bg-gray-200 rounded-2xl`}></div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = Number(msg.sender_id) === Number(currentUserId);
                const senderAvatar = msg.sender?.avatar_url || msg.sender?.avatar || msg.sender?.google_avatar;
                const isRead = msg.is_read || msg.read_at;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-1 sm:gap-2 group`}
                    onMouseDown={() => startLongPress(msg.id, isMe)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchStart={() => startLongPress(msg.id, isMe)}
                    onTouchEnd={cancelLongPress}
                  >
                    {!isMe && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {senderAvatar ? (
                          <Image src={getAvatarUrl(senderAvatar)} alt="" width={32} height={32} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-gray-500 font-medium">
                            {msg.sender?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Voice message - show if message_type is voice OR URL looks like audio */}
                    {(msg.message_type === 'voice' || (msg.attachment_url && msg.attachment_url.match(/\.(mp3|webm|wav|m4a)$/i))) && msg.attachment_url ? (
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                          isMe
                            ? 'bg-[#d9fdd0] text-gray-800 rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200 shadow-sm'
                        }`}
                        style={{ boxShadow: isMe ? 'none' : '0 1px 0.5px rgba(0,0,0,0.1)' }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Play button */}
                          <button
                            onClick={() => playingAudioId === msg.id ? stopAudio(msg.id) : playAudio(msg.id, msg.audio_url || msg.attachment_url || '')}
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              isMe 
                                ? 'bg-[#00a884] hover:bg-[#00897a] text-white' 
                                : 'bg-[#008069] hover:bg-[#00695c] text-white'
                            }`}
                          >
                            {playingAudioId === msg.id ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5 ml-0.5" />
                            )}
                          </button>
                          
                          {/* Waveform with progress */}
                          <div className="flex-1 flex items-center gap-[2px] h-10 cursor-pointer" onClick={(e) => seekAudio(msg.id, e)}>
                            {[...Array(30)].map((_, i) => {
                              const heights = [15, 30, 45, 60, 75, 90, 100, 90, 75, 60, 45, 30, 15, 25, 40, 55, 70, 85, 95, 80, 65, 50, 35, 20, 30, 45, 60, 75, 90, 70];
                              const baseHeight = heights[i % heights.length];
                              const progress = playbackProgress[msg.id] || 0;
                              const barProgress = (i / 30) * 100;
                              const isPlayed = barProgress <= progress;
                              
                              return (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all ${
                                    isPlayed 
                                      ? (isMe ? 'bg-[#00a884]' : 'bg-[#008069]') 
                                      : (isMe ? 'bg-[#9de9c8]' : 'bg-[#b0bec5]')
                                  }`}
                                  style={{ height: `${baseHeight}%` }}
                                />
                              );
                            })}
                          </div>
                          
                          {/* Speed control */}
                          <button
                            onClick={() => cyclePlaybackSpeed(msg.id)}
                            className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                              isMe ? 'text-[#00a884] hover:bg-[#00a884]/10' : 'text-[#008069] hover:bg-[#008069]/10'
                            }`}
                          >
                            {playbackSpeed[msg.id] || 1}x
                          </button>
                        </div>
                        
                        {/* Progress bar and time */}
                        <div className="flex items-center gap-2 mt-1 pl-1">
                          <div className="flex-1 h-1 bg-[#dcf8c6] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                isMe ? 'bg-[#00a884]' : 'bg-[#008069]'
                              }`}
                              style={{ width: `${playbackProgress[msg.id] || 0}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] ${isMe ? 'text-[#6ab383]' : 'text-gray-400'}`}>
                              {(() => {
                                const totalDuration = playbackDuration[msg.id] || msg.duration || 0;
                                const progress = playbackProgress[msg.id] || 0;
                                const remaining = totalDuration * (1 - progress / 100);
                                const safeRemaining = isNaN(remaining) || !isFinite(remaining) ? 0 : Math.max(0, remaining);
                                return formatDuration(Math.floor(safeRemaining));
                              })()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Time and status */}
                        <div className="flex items-center justify-end gap-1 mt-1 pr-1">
                          <span className={`text-[10px] ${isMe ? 'text-[#6ab383]' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <span className={`text-[10px] ${
                              msg.status === 'seen' || msg.is_read || msg.read_at ? 'text-[#53bdeb]' : 
                              msg.status === 'delivered' ? 'text-[#8696a0]' : 
                              'text-[#8696a0]'
                            }`}>
                              {msg.status === 'seen' || msg.is_read || msg.read_at ? '✓✓' : 
                               msg.status === 'delivered' ? '✓✓' : 
                               msg.status === 'sending' ? '○' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[75%] sm:max-w-[70%] px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl ${
                          isMe
                            ? 'bg-[#d9fdd0] text-gray-800 rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200 shadow-sm'
                        }`}
                        style={{ boxShadow: isMe ? 'none' : '0 1px 0.5px rgba(0,0,0,0.1)' }}
                      >
                        {/* Image - show if message_type is image OR if attachment URL looks like an image */}
                        {(msg.message_type === 'image' || (msg.attachment_url && !msg.attachment_url.match(/\.(mp3|webm|wav|m4a|pdf|doc|docx|xls|xlsx)$/i))) && msg.attachment_url && (
                          <div className="relative w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] mb-1 sm:mb-2">
                            <Image 
                              src={msg.attachment_url} 
                              alt="attachment" 
                              fill
                              sizes="(max-width: 640px) 150px, 200px"
                              className="rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => msg.attachment_url && setPreviewImage(msg.attachment_url)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }} 
                            />
                          </div>
                        )}
                        {/* File attachment - show if specifically marked as file */}
                        {msg.message_type === 'file' && msg.attachment_url && (
                          <a href={getStorageUrl(msg.attachment_url) || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm hover:underline mb-1 sm:mb-2">
                            📎 Download Attachment
                          </a>
                        )}
                        {/* Text content - show if there's no attachment or if it's a text-only message */}
                        {(!msg.attachment_url || msg.message_type === 'text') && msg.content && (
                          <p className="text-[13px] sm:text-[15px] leading-[17px] sm:leading-[19px]">{msg.content}</p>
                        )}
                        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {isMe && (
                            <span className={`text-[10px] ${
                              msg.status === 'seen' ? 'text-[#53bdeb]' : 
                              msg.status === 'delivered' || msg.is_read || msg.read_at ? 'text-[#8696a0]' : 
                              'text-[#8696a0]'
                            }`}>
                              {msg.status === 'seen' || msg.is_read || msg.read_at ? '✓✓' : '✓'}
                            </span>
                          )}
                          <span className={`text-[10px] ${isMe ? 'text-[#6ab383]' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {isMe && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-100 flex-shrink-0 overflow-hidden">
                        {user?.avatar_url || user?.google_avatar ? (
                          <Image src={getStorageUrl(user.avatar_url || user.google_avatar) || ''} alt="" width={32} height={32} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-primary-600 font-medium">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Long Press Delete Popup - WhatsApp style */}
          {longPressMessageId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setLongPressMessageId(null)}>
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    deleteMessage(longPressMessageId);
                    setLongPressMessageId(null);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Delete message</p>
                    <p className="text-sm text-gray-500">This message will be deleted for everyone</p>
                  </div>
                </button>
                <div className="h-[1px] bg-gray-200" />
                <button
                  onClick={() => setLongPressMessageId(null)}
                  className="w-full px-5 py-4 hover:bg-gray-50 transition-colors text-center font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Message Input - WhatsApp Style */}
          <form onSubmit={handleSendMessage} className="p-2 sm:p-3 border-t border-[#e9edef] bg-[#f0f2f5]">
            {/* Voice Note Preview */}
            {recordedAudioUrl && !isRecording && (
              <div className="flex items-center gap-2 mb-2 px-2 py-2 bg-[#dcf8c6] rounded-lg">
                <button
                  type="button"
                  onClick={playPreview}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center"
                >
                  {isPlayingPreview ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#00a884] rounded-full animate-pulse"
                        style={{ height: `${8 + (i % 5) * 2}px`, animationDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[#00a884] text-[10px] sm:text-xs font-medium">{formatDuration(recordingDuration)}</span>
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="p-1 sm:p-1.5 rounded-full hover:bg-[#00a884]/10"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-[#00a884]" />
                </button>
                <button
                  type="button"
                  onClick={sendVoiceNote}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#009977]"
                >
                  <SendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-end gap-1 sm:gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />
              
              {/* Attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 sm:p-2.5 text-[#54656f] hover:bg-[#dfe5e7] rounded-full transition-colors"
              >
                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              {/* Text input or Recording UI */}
              <div className="flex-1 bg-white rounded-[20px] px-3 sm:px-4 py-1.5 sm:py-2 flex items-center">
                {isRecording ? (
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[#54656f] font-medium text-xs sm:text-sm">{formatDuration(recordingDuration)}</span>
                    <div className="flex-1 h-5 sm:h-6 bg-[#dcf8c6] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00a884] transition-all"
                        style={{ width: `${(recordingDuration / MAX_RECORDING_DURATION) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-[10px] text-gray-400 hidden sm:inline">/{MAX_RECORDING_DURATION}s</span>
                    <button
                      type="button"
                      onMouseDown={handleSlideCancel}
                      onTouchStart={handleSlideCancel}
                      className="p-1 sm:p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Message"
                      className="flex-1 py-0.5 sm:py-1 bg-transparent text-[14px] sm:text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none"
                    />
                  </>
                )}
              </div>
              
              {/* Send or Mic button */}
              {messageInput.trim() ? (
                <button
                  type="submit"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#009977] transition-colors"
                >
                  <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={isRecording ? stopRecording : undefined}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  onTouchCancel={cancelRecording}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-[#00a884] text-white hover:bg-[#009977]'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              )}
            </div>
            
            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="mt-2 px-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00a884] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">Sending...</span>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50 px-4 py-6 sm:px-6 sm:py-8">
          {/* Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
            <svg className="w-full h-full text-primary-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 text-center">
            Welcome to iList Chat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 text-center max-w-xs sm:max-w-md mb-4 sm:mb-6 px-2">
            Connect with buyers and sellers directly. Your messages are private and secure.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-lg mb-4 sm:mb-6">
            <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-sm border border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-800">Private</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">End-to-end encrypted</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-sm border border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-800">Instant</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">Real-time delivery</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-sm border border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-800">Share</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">Photos & files</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 w-full max-w-lg">
            <p className="text-[10px] sm:text-xs font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Tips
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-1.5 text-[10px] sm:text-xs text-slate-600">
                <span className="text-primary-500 mt-0.5">1.</span>
                <span>Select a conversation from the list</span>
              </li>
              <li className="flex items-start gap-1.5 text-[10px] sm:text-xs text-slate-600">
                <span className="text-primary-500 mt-0.5">2.</span>
                <span>Tap mic icon for voice messages</span>
              </li>
              <li className="flex items-start gap-1.5 text-[10px] sm:text-xs text-slate-600">
                <span className="text-primary-500 mt-0.5">3.</span>
                <span>Tap image icon to share photos</span>
              </li>
            </ul>
          </div>
        </div>
      )}

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
          <div className="relative w-[90vw] h-[90vh]">
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