'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3006';

interface UseSocketOptions {
  userId?: number | null;
  onNewMessage?: (message: any) => void;
  onUserTyping?: (data: { conversationId: string; userId: number }) => void;
  onUserOffline?: (data: { conversationId: string; userId: number }) => void;
  onNotification?: (notification: any) => void;
  onPaymentCompleted?: (notification: any) => void;
  onPromotionActivated?: (notification: any) => void;
}

export function useSocket({
  userId,
  onNewMessage,
  onUserTyping,
  onUserOffline,
  onNotification,
  onPaymentCompleted,
  onPromotionActivated,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Don't attempt connection if URL is localhost and we're not in development
    const isLocalhost = SOCKET_URL.includes('localhost');
    
    // Initialize socket connection
    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['polling', 'websocket'],
        timeout: 5000,
        reconnection: false, // Disable auto-reconnection to prevent repeated errors
        forceBase64: false,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        setSocketError(null);
        socket.emit('join', userId);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        // Silently handle connection errors - socket is optional
        console.log('Socket unavailable, using HTTP fallback');
        setSocketError('Socket unavailable');
        setIsConnected(false);
      });

      socket.on('usersOnline', (users: number[]) => {
        setOnlineUsers(users);
      });

      if (onNewMessage) {
        socket.on('newMessage', (message) => {
          onNewMessage(message);
        });
      }

      if (onUserTyping) {
        socket.on('userTyping', onUserTyping);
        socket.on('userStoppedTyping', onUserTyping);
      }

      if (onNotification) {
        socket.on('notification', onNotification);
      }

      if (onPaymentCompleted) {
        socket.on('paymentCompleted', onPaymentCompleted);
      }

      if (onPromotionActivated) {
        socket.on('promotionActivated', onPromotionActivated);
      }
    } catch (error) {
      console.log('Socket initialization skipped');
      setSocketError('Socket not available');
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, onNewMessage, onUserTyping, onNotification, onPaymentCompleted, onPromotionActivated]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinConversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveConversation', conversationId);
    }
  }, []);

  const sendMessage = useCallback((data: {
    conversationId: string;
    message: any;
    receiverId: number;
    senderId: number;
  }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', data);
    }
  }, []);

  const sendTyping = useCallback((data: { conversationId: string; userId: number }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', data);
    }
  }, []);

  const stopTyping = useCallback((data: { conversationId: string; userId: number }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stopTyping', data);
    }
  }, []);

  const markRead = useCallback((data: { conversationId: string; messageId: number; readerId: number }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markRead', data);
    }
  }, []);

  const isUserOnline = useCallback((checkUserId: number) => {
    return onlineUsers.includes(checkUserId);
  }, [onlineUsers]);

  const emitNotification = useCallback((userId: number, notification: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('notification', { userId, notification });
    }
  }, []);

  const emitPaymentCompleted = useCallback((userId: number, payment: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('paymentCompleted', { userId, payment });
    }
  }, []);

  const emitPromotionActivated = useCallback((userId: number, promotion: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('promotionActivated', { userId, promotion });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    socketError,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    stopTyping,
    markRead,
    isUserOnline,
    emitNotification,
    emitPaymentCompleted,
    emitPromotionActivated,
  };
}
