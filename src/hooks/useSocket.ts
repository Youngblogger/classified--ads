'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

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

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message);
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

    return () => {
      socket.disconnect();
    };
  }, [userId, onNewMessage, onUserTyping, onNotification, onPaymentCompleted, onPromotionActivated]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('joinConversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leaveConversation', conversationId);
  }, []);

  const sendMessage = useCallback((data: {
    conversationId: string;
    message: any;
    receiverId: number;
    senderId: number;
  }) => {
    socketRef.current?.emit('sendMessage', data);
  }, []);

  const sendTyping = useCallback((data: { conversationId: string; userId: number }) => {
    socketRef.current?.emit('typing', data);
  }, []);

  const stopTyping = useCallback((data: { conversationId: string; userId: number }) => {
    socketRef.current?.emit('stopTyping', data);
  }, []);

  const markRead = useCallback((data: { conversationId: string; messageId: number; readerId: number }) => {
    socketRef.current?.emit('markRead', data);
  }, []);

  const isUserOnline = useCallback((checkUserId: number) => {
    return onlineUsers.includes(checkUserId);
  }, [onlineUsers]);

  const emitNotification = useCallback((userId: number, notification: any) => {
    socketRef.current?.emit('notification', { userId, notification });
  }, []);

  const emitPaymentCompleted = useCallback((userId: number, payment: any) => {
    socketRef.current?.emit('paymentCompleted', { userId, payment });
  }, []);

  const emitPromotionActivated = useCallback((userId: number, promotion: any) => {
    socketRef.current?.emit('promotionActivated', { userId, promotion });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
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
