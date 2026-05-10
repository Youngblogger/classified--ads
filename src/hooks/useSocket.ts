'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3006';

interface UseSocketOptions {
  userId?: number | null;
  onNewMessage?: (message: any) => void;
  onMessageRead?: (data: { messageId: number; conversationId: number }) => void;
  onUserTyping?: (data: { conversationId: string; userId: number }) => void;
  onUserOffline?: (data: { conversationId: string; userId: number }) => void;
  onNotification?: (notification: any) => void;
  onPaymentCompleted?: (notification: any) => void;
  onPromotionActivated?: (notification: any) => void;
}

export function useSocket({
  userId,
  onNewMessage,
  onMessageRead,
  onUserTyping,
  onUserOffline,
  onNotification,
  onPaymentCompleted,
  onPromotionActivated,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef({
    onNewMessage,
    onMessageRead,
    onUserTyping,
    onNotification,
    onPaymentCompleted,
    onPromotionActivated,
  });
  callbacksRef.current = {
    onNewMessage,
    onMessageRead,
    onUserTyping,
    onNotification,
    onPaymentCompleted,
    onPromotionActivated,
  };
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['polling', 'websocket'],
        timeout: 5000,
        reconnection: false,
        forceBase64: false,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        setIsConnected(true);
        setSocketError(null);
        socket.emit('join', userId);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', () => {
        setSocketError('Socket unavailable');
        setIsConnected(false);
      });

      socket.on('usersOnline', (users: number[]) => {
        setOnlineUsers(users);
      });

      socket.on('newMessage', (message) => {
        callbacksRef.current.onNewMessage?.(message);
      });

      socket.on('messageRead', (data) => {
        callbacksRef.current.onMessageRead?.(data);
      });

      socket.on('userTyping', (data) => {
        callbacksRef.current.onUserTyping?.(data);
      });

      socket.on('userStoppedTyping', (data) => {
        callbacksRef.current.onUserTyping?.(data);
      });

      socket.on('notification', (notification) => {
        callbacksRef.current.onNotification?.(notification);
      });

      socket.on('paymentCompleted', (notification) => {
        callbacksRef.current.onPaymentCompleted?.(notification);
      });

      socket.on('promotionActivated', (notification) => {
        callbacksRef.current.onPromotionActivated?.(notification);
      });
    } catch {
      setSocketError('Socket not available');
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);

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