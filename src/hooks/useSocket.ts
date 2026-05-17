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

const SOCKET_CONFIG = {
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5,
  timeout: 20000,
  forceNew: true,
  autoConnect: true,
  upgrade: true,
  rememberUpgrade: true,
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('authToken') || getCookie('token');
  } catch {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

let globalSocket: Socket | null = null;
let globalSocketUserId: number | null = null;
let globalSocketRefCount = 0;

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
  const userIdRef = useRef<number | null>(null);
  const registeredEvents = useRef<Set<string>>(new Set());

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
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const cleanupEvents = useCallback((socket: Socket) => {
    const events = [
      'connect', 'disconnect', 'connect_error', 'reconnect_attempt',
      'reconnect', 'reconnect_error', 'reconnect_failed',
      'usersOnline', 'newMessage', 'messageRead',
      'userTyping', 'userStoppedTyping', 'notification',
      'paymentCompleted', 'promotionActivated',
    ];
    for (const event of events) {
      socket.removeAllListeners(event);
    }
    registeredEvents.current.clear();
  }, []);

  const registerEvents = useCallback((socket: Socket) => {
    if (registeredEvents.current.has('connect')) return;

    socket.on('connect', () => {
      console.log(`[Socket] Connected: ${socket.id}`);
      setIsConnected(true);
      setSocketError(null);
      setReconnecting(false);
      setReconnectAttempt(0);
      if (userIdRef.current) {
        socket.emit('join', userIdRef.current);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${reason}`);
      setIsConnected(false);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setSocketError('Disconnected from server');
      }
    });

    socket.on('connect_error', (err) => {
      console.warn(`[Socket] Connection error: ${err.message}`);
      setSocketError(err.message);
      setIsConnected(false);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket] Reconnect attempt ${attempt}`);
      setReconnecting(true);
      setReconnectAttempt(attempt);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`[Socket] Reconnected after ${attempt} attempts`);
      setReconnecting(false);
      setReconnectAttempt(0);
      setSocketError(null);
      setIsConnected(true);
      if (userIdRef.current) {
        socket.emit('join', userIdRef.current);
      }
    });

    socket.on('reconnect_error', (err) => {
      console.warn(`[Socket] Reconnect error: ${err.message}`);
    });

    socket.on('reconnect_failed', () => {
      console.error(`[Socket] Reconnect failed`);
      setReconnecting(false);
      setSocketError('Connection lost');
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

    registeredEvents.current.add('connect');
  }, []);

  useEffect(() => {
    if (!userId) return;

    userIdRef.current = userId;

    if (globalSocket && globalSocketUserId === userId) {
      socketRef.current = globalSocket;
      registerEvents(globalSocket);
      setIsConnected(globalSocket.connected);
      globalSocketRefCount++;
      return () => {
        globalSocketRefCount--;
        if (globalSocketRefCount <= 0) {
          cleanupEvents(globalSocket!);
          globalSocket!.disconnect();
          globalSocket = null;
          globalSocketUserId = null;
          socketRef.current = null;
          setIsConnected(false);
          setSocketError(null);
          setReconnecting(false);
        }
      };
    }

    if (globalSocket) {
      cleanupEvents(globalSocket);
      globalSocket.disconnect();
      globalSocket = null;
      globalSocketUserId = null;
    }

    const socket = io(SOCKET_URL, {
      ...SOCKET_CONFIG,
      auth: { token: getAuthToken() },
    });

    globalSocket = socket;
    globalSocketUserId = userId;
    globalSocketRefCount = 1;
    socketRef.current = socket;

    registerEvents(socket);

    return () => {
      globalSocketRefCount--;
      if (globalSocketRefCount <= 0) {
        cleanupEvents(socket);
        socket.disconnect();
        globalSocket = null;
        globalSocketUserId = null;
        socketRef.current = null;
        setIsConnected(false);
        setSocketError(null);
        setReconnecting(false);
      }
    };
  }, [userId, cleanupEvents, registerEvents]);

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
    reconnecting,
    reconnectAttempt,
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
