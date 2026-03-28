'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, Square, Play, Pause, Trash2, ImageIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useSocket } from '@/hooks/useSocket';
import { messagesApi } from '@/lib/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const BACKEND_URL = API_URL.replace('/api', '');

// Get image URL - handles all URL formats from backend
function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Handle blob URLs (temporary recordings)
  if (url.startsWith('blob:')) {
    return url;
  }
  // Handle full HTTP URLs - return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Handle /storage/ prefix
  if (url.startsWith('/storage/')) {
    return `${BACKEND_URL}${url}`;
  }
  // Handle storage/ prefix (without leading slash)
  if (url.startsWith('storage/')) {
    return `${BACKEND_URL}/${url}`;
  }
  // Default: assume it's a filename
  return `${BACKEND_URL}/storage/${url}`;
}

// Get audio URL - handles voice messages
function getAudioUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Handle blob URLs (temporary recordings)
  if (url.startsWith('blob:')) {
    return url;
  }
  // Return as-is for full URLs
  return url;
}

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

interface Message {
  id: number;
  conversation_id: number;
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
    google_avatar?: string | null;
    avatar_url?: string | null;
    full_avatar_url?: string | null;
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
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Process seller avatar URL
  const processedSellerAvatar = sellerAvatar ? getImageUrl(sellerAvatar) : null;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<{ [key: number]: number }>({});
  const [playbackDuration, setPlaybackDuration] = useState<{ [key: number]: number }>({});
  const [playbackSpeed, setPlaybackSpeed] = useState<{ [key: number]: number }>({});
  const audioElementsRef = useRef<{ [key: number]: HTMLAudioElement }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentUserId = user?.id;
  const MAX_RECORDING_DURATION = 60;

  const handleNewMessage = useCallback((message: Message) => {
    if (!message || !message.conversation_id) return;
    
    // Check if message already exists to prevent duplicates
    setMessages((prev) => {
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) return prev;
      
      if (conversationId && message.conversation_id === conversationId) {
        return [...prev, message];
      }
      return prev;
    });
    setIsTyping(false);
  }, [conversationId]);

  const handleTyping = useCallback((data: { conversationId: string; userId: number }) => {
    if (data.conversationId === conversationId?.toString() && data.userId !== currentUserId) {
      setIsTyping(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => setIsTyping(false), 3000);
      setTypingTimeout(timeout);
    }
  }, [conversationId, currentUserId, typingTimeout]);

  const { joinConversation, leaveConversation, sendMessage, sendTyping } = useSocket({
    userId: currentUserId,
    onNewMessage: handleNewMessage,
    onUserTyping: handleTyping,
  });

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !user || !adId || !sellerId) return;
    
    // Prevent messaging yourself
    if (sellerId === user.id) {
      console.warn('Cannot message yourself');
      return;
    }

    const initConversation = async () => {
      // Don't reinitialize if we already have one
      if (conversationId) return;
      
      setConversationLoading(true);
      try {
        console.log('Initializing conversation with seller:', sellerId, 'ad:', adId);
        
        // Use POST /messages endpoint which creates conversation (without auto-message)
        const response = await messagesApi.sendMessageNew(
          sellerId,
          adId,
          ''
        );
        console.log('Conversation initialized:', response.data);
        setConversationId(response.data.conversation_id);
      } catch (error: any) {
        console.error('Error creating conversation:', error);
        console.error('Error response data:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to start conversation');
      } finally {
        setConversationLoading(false);
      }
    };

    initConversation();
  }, [isOpen, isAuthenticated, user, adId, sellerId, conversationId]);

  useEffect(() => {
    if (!conversationId || !isOpen) return;

    joinConversation(conversationId.toString());
    fetchMessages();

    return () => {
      leaveConversation(conversationId.toString());
    };
  }, [conversationId, isOpen, joinConversation, leaveConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const response = await messagesApi.getMessages(conversationId);
      setMessages(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      if (navigator.vibrate) navigator.vibrate(50);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());
        setRecordedBlob(blob);
        setRecordedAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_RECORDING_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Please allow microphone access');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (navigator.vibrate) navigator.vibrate(50);
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setRecordingDuration(0);
    setIsPlayingPreview(false);
  };

  const playPreview = () => {
    if (!recordedAudioUrl) return;
    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
      return;
    }
    previewAudioRef.current = new Audio(recordedAudioUrl);
    previewAudioRef.current.play();
    setIsPlayingPreview(true);
    previewAudioRef.current.onended = () => setIsPlayingPreview(false);
  };

  const sendVoiceNote = async () => {
    if (!recordedBlob || !recordedAudioUrl) {
      toast.error('No recording to send');
      return;
    }

    // Keep a reference to the audio URL for the optimistic message
    const audioUrlToSend = recordedAudioUrl;

    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId || -1,
      sender_id: currentUserId!,
      content: '',
      message_type: 'voice',
      attachment_url: audioUrlToSend,
      status: 'sending',
      created_at: new Date().toISOString(),
      duration: recordingDuration,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    
    // Keep duration before clearing state
    const durationToSend = recordingDuration;
    
    // Clear the recording state AFTER adding the optimistic message
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setRecordingDuration(0);
    setIsPlayingPreview(false);
    // Note: Don't revoke the URL yet - the optimistic message needs it

    try {
      // Create a proper File object with extension based on MIME type
      let extension = 'webm';
      const mimeType = recordedBlob.type;
      if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
        extension = 'm4a';
      } else if (mimeType.includes('wav')) {
        extension = 'wav';
      }
      const audioFile = new File([recordedBlob], `voice_${Date.now()}.${extension}`, { type: mimeType });
      
      const response = await messagesApi.sendMessageNew(
        sellerId,
        adId,
        '',
        'voice',
        audioFile,
        durationToSend
      );

      // Now we can safely revoke the blob URL since the message is sent
      URL.revokeObjectURL(audioUrlToSend);

      // Update conversation ID if new
      if (!conversationId && response.data.conversation_id) {
        setConversationId(response.data.conversation_id);
      }

      // Debug log
      console.log('Voice message response:', response.data);

      // Update optimistic message - ensure voice type and audio_url are preserved
      setMessages(prev => prev.map(msg => msg.id === tempId ? { 
        ...response.data, 
        status: 'sent',
        message_type: response.data.message_type || 'voice',
        audio_url: response.data.audio_url || response.data.attachment_url,
        attachment_url: response.data.attachment_url || response.data.audio_url
      } : msg));

      const convIdForSocket = response.data.conversation_id?.toString() || conversationId?.toString() || '-1';
      sendMessage({
        conversationId: convIdForSocket,
        message: response.data,
        receiverId: sellerId,
        senderId: currentUserId!,
      });
    } catch (error: any) {
      console.error('Error sending voice note:', error);
      toast.error(error.response?.data?.message || 'Failed to send voice note');
      // Revoke URL on error too
      URL.revokeObjectURL(audioUrlToSend);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const playAudio = (msgId: number, url: string) => {
    if (playingAudioId !== null && audioElementsRef.current[playingAudioId]) {
      audioElementsRef.current[playingAudioId].pause();
    }

    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      setPlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
      return;
    }

    const audio = new Audio(url);
    audioElementsRef.current[msgId] = audio;
    setPlayingAudioId(msgId);

    const speed = playbackSpeed[msgId] || 1;
    audio.playbackRate = speed;

    audio.onloadedmetadata = () => setPlaybackDuration(prev => ({ ...prev, [msgId]: audio.duration || 0 }));
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
    audio.onerror = () => {
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
    audio.currentTime = percentage * duration;
    setPlaybackProgress(prev => ({ ...prev, [msgId]: percentage * 100 }));
  };

  const cyclePlaybackSpeed = (msgId: number) => {
    const speeds = [1, 1.5, 2];
    const currentSpeed = playbackSpeed[msgId] || 1;
    const currentIndex = speeds.indexOf(currentSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(prev => ({ ...prev, [msgId]: nextSpeed }));
    if (audioElementsRef.current[msgId]) audioElementsRef.current[msgId].playbackRate = nextSpeed;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Prevent messaging yourself
    if (sellerId === currentUserId) {
      toast.error('Cannot message yourself');
      return;
    }

    const tempId = Date.now();
    const tempConversationId = conversationId || -1; // Temporary ID for optimistic message
    
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: tempConversationId,
      sender_id: currentUserId!,
      content: newMessage.trim(),
      message_type: 'text',
      status: 'sending',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    // Stop typing indicator
    if (typingTimeout) clearTimeout(typingTimeout);
    setIsTyping(false);

    try {
      // Use POST /messages which creates conversation and sends message
      const response = await messagesApi.sendMessageNew(
        sellerId,
        adId,
        newMessage.trim()
      );

      console.log('Message sent:', response.data);
      
      // Update conversation ID if this was a new conversation
      if (!conversationId && response.data.conversation_id) {
        setConversationId(response.data.conversation_id);
      }

      // Update message with real data
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...response.data, status: 'sent' } : msg
      ));

      // Send socket notification
      const convIdForSocket = response.data.conversation_id?.toString() || conversationId?.toString() || '-1';
      sendMessage({
        conversationId: convIdForSocket,
        message: response.data,
        receiverId: sellerId,
        senderId: currentUserId!,
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await messagesApi.sendMessageNew(
        sellerId,
        adId,
        '',
        'image',
        file
      );

      // Update conversation ID if new
      if (!conversationId && response.data.conversation_id) {
        setConversationId(response.data.conversation_id);
      }

      // Ensure message_type and attachment_url are preserved
      const newMessage = {
        ...response.data,
        message_type: response.data.message_type || 'image',
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (conversationId && currentUserId) {
      sendTyping?.({ conversationId: conversationId.toString(), userId: currentUserId });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[#efeae2] rounded-t-2xl sm:rounded-2xl w-full h-[85vh] sm:h-[600px] sm:w-[90%] md:w-[500px] lg:w-[550px] max-w-[500px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#f0f2f5] px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-[#d1d7db]">
          <button onClick={onClose} className="p-1.5 sm:p-1 hover:bg-[#d1d7db] rounded-full transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#54656f]" />
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#dcf8c6] overflow-hidden flex items-center justify-center flex-shrink-0">
            {processedSellerAvatar ? (
              <img src={processedSellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#54656f] font-medium text-sm sm:text-base">{sellerName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#111b21] text-sm sm:text-base truncate">{sellerName}</h3>
            <p className="text-xs text-[#667781] truncate">Ad: {adTitle}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 sm:space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-[#667781]">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = Number(msg.sender_id) === Number(currentUserId);
              console.log('Debug - msg.sender_id:', msg.sender_id, 'currentUserId:', currentUserId, 'isMe:', isMe);
              const senderAvatar = getImageUrl(msg.sender?.full_avatar_url || msg.sender?.avatar_url || msg.sender?.avatar || msg.sender?.google_avatar);

              // Determine message type based on message_type field or content
              const isVoiceMessage = msg.message_type === 'voice' || (msg.audio_url || msg.attachment_url)?.includes('.mp3') || (msg.audio_url || msg.attachment_url)?.includes('.webm');
              const isImageMessage = msg.message_type === 'image' || msg.attachment_url?.match(/\.(jpg|jpeg|png|gif|webp|svg)/i);
              const hasAttachment = msg.attachment_url || msg.audio_url;
              const showImage = isImageMessage && hasAttachment;
              const showVoice = isVoiceMessage && hasAttachment && !showImage;
              
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      {senderAvatar ? (
                        <img src={senderAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium">
                          {msg.sender?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Voice message - show if message_type is voice OR URL looks like audio */}
                  {(msg.message_type === 'voice' || (msg.attachment_url && msg.attachment_url.match(/\.(mp3|webm|wav|m4a)$/i))) && msg.attachment_url ? (
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${isMe ? 'bg-[#d9fdd0] text-gray-800 rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => playingAudioId === msg.id ? stopAudio(msg.id) : playAudio(msg.id, msg.audio_url || msg.attachment_url || '')}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${isMe ? 'bg-[#00a884] text-white' : 'bg-[#008069] text-white'}`}
                        >
                          {playingAudioId === msg.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>

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
                                className={`w-1 rounded-full ${isPlayed ? (isMe ? 'bg-[#00a884]' : 'bg-[#008069]') : (isMe ? 'bg-[#9de9c8]' : 'bg-[#b0bec5]')}`}
                                style={{ height: `${baseHeight}%` }}
                              />
                            );
                          })}
                        </div>

                        <button
                          onClick={() => cyclePlaybackSpeed(msg.id)}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isMe ? 'text-[#00a884]' : 'text-[#008069]'}`}
                        >
                          {playbackSpeed[msg.id] || 1}x
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-[#667781]">
                        <span>{(() => {
                          const totalDuration = playbackDuration[msg.id] || msg.duration || 0;
                          const progress = playbackProgress[msg.id] || 0;
                          const remaining = totalDuration * (1 - progress / 100);
                          const safeRemaining = isNaN(remaining) || !isFinite(remaining) ? 0 : Math.max(0, remaining);
                          return formatDuration(Math.floor(safeRemaining));
                        })()}</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <span className="text-[#53bdeb]">{msg.status === 'seen' ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${isMe ? 'bg-[#d9fdd0] text-gray-800 rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'}`}>
                      {/* Image - show if message_type is image OR if attachment URL looks like an image */}
                      {(msg.message_type === 'image' || (msg.attachment_url && !msg.attachment_url.match(/\.(mp3|webm|wav|m4a|pdf|doc|docx|xls|xlsx)$/i))) && msg.attachment_url && (
                        <img 
                          src={msg.attachment_url} 
                          alt="" 
                          className="rounded-lg w-[200px] object-cover mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => msg.attachment_url && setPreviewImage(msg.attachment_url)}
                          onError={(e) => {
                            console.log('Image load error:', msg.attachment_url);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      {/* Text content - hide if there's an attachment */}
                      {!msg.attachment_url && msg.content && (
                        <p className="text-[15px] leading-[19px]">{msg.content}</p>
                      )}
                      <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] ${isMe ? 'text-[#6ab383]' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <span className="text-[10px] text-[#53bdeb]">{msg.status === 'seen' ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  )}

                  {isMe && (
                    <div className="w-8 h-8 rounded-full bg-[#dcf8c6] flex-shrink-0 overflow-hidden">
                      {user?.full_avatar_url || user?.avatar_url || user?.google_avatar ? (
                        <img src={getImageUrl(user.full_avatar_url || user.avatar_url || user.google_avatar || '') || ''} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#00a884] font-medium">
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {processedSellerAvatar ? (
                  <img src={processedSellerAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium">
                    {sellerName[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-200">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-xs text-[#667781] mt-1">Typing...</p>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="flex justify-end">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#d9fdd0] rounded-2xl rounded-br-sm">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[#54656f] font-medium">{formatDuration(recordingDuration)}</span>
                <div className="flex-1 h-1 bg-[#00a884] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00a884]" style={{ width: `${(recordingDuration / MAX_RECORDING_DURATION) * 100}%` }} />
                </div>
              </div>
            </div>
          )}

          {recordedAudioUrl && !isRecording && (
            <div className="flex justify-end">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#dcf8c6] rounded-2xl rounded-br-sm border border-[#00a884] max-w-[85%] sm:max-w-[75%]">
                <button onClick={playPreview} className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center flex-shrink-0">
                  {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#00a884] font-medium truncate">Voice message</p>
                  <p className="text-xs text-[#00a884]">{formatDuration(recordingDuration)}</p>
                </div>
                <button onClick={sendVoiceNote} className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#009977] flex-shrink-0">
                  <SendIcon className="w-4 h-4" />
                </button>
                <button onClick={cancelRecording} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="px-3 py-2 bg-[#f0f2f5] border-t border-[#d1d7db]">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            <button
              onClick={() => {
                setNewMessage("Is this still available?");
                inputRef?.current?.focus();
              }}
              className="flex-shrink-0 px-3 py-1.5 text-sm bg-white border border-[#00a884] text-[#00a884] rounded-full hover:bg-[#dcf8c6] transition-colors whitespace-nowrap"
            >
              Is this still available?
            </button>
            <button
              onClick={() => {
                setNewMessage("What is your last price?");
                inputRef?.current?.focus();
              }}
              className="flex-shrink-0 px-3 py-1.5 text-sm bg-white border border-[#00a884] text-[#00a884] rounded-full hover:bg-[#dcf8c6] transition-colors whitespace-nowrap"
            >
              What is your last price?
            </button>
            <button
              onClick={() => {
                setNewMessage("Where is the exact location?");
                inputRef?.current?.focus();
              }}
              className="flex-shrink-0 px-3 py-1.5 text-sm bg-white border border-[#00a884] text-[#00a884] rounded-full hover:bg-[#dcf8c6] transition-colors whitespace-nowrap"
            >
              Where is the exact location?
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-2 sm:p-3 bg-[#f0f2f5] border-t border-[#d1d7db]">
          <div className="flex items-end gap-1 sm:gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />

            <button onClick={() => fileInputRef.current?.click()} className="p-2 sm:p-2.5 text-[#54656f] hover:bg-[#dfe5e7] rounded-full transition-colors flex-shrink-0">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex-1 bg-white rounded-[20px] px-3 sm:px-4 py-1.5 sm:py-2 flex items-center min-w-0">
              {isRecording ? (
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="text-[#54656f] font-medium text-sm">{formatDuration(recordingDuration)}</span>
                  <div className="flex-1 h-5 sm:h-6 bg-[#dcf8c6] rounded-full overflow-hidden min-w-[50px]">
                    <div className="h-full bg-[#00a884] transition-all" style={{ width: `${(recordingDuration / MAX_RECORDING_DURATION) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 hidden sm:inline">/{MAX_RECORDING_DURATION}s</span>
                  <button onClick={cancelRecording} className="p-1 text-red-500 hover:bg-red-50 rounded-full flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Message"
                  className="flex-1 py-1 bg-transparent text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none min-w-0"
                />
              )}
            </div>

            {newMessage.trim() ? (
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#009977] transition-colors shadow-md flex-shrink-0"
              >
                <SendIcon className="w-5 h-5" />
              </button>
              ) : (
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={isRecording ? stopRecording : undefined}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                onTouchCancel={cancelRecording}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-md flex-shrink-0 ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#00a884] text-white hover:bg-[#009977]'
                }`}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
