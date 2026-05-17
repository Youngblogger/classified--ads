const { Server } = require('socket.io');
const http = require('http');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const PORT = parseInt(process.env.SOCKET_PORT, 10) || 3006;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;
const MAX_CONNECTIONS_PER_IP = parseInt(process.env.MAX_CONNECTIONS_PER_IP, 10) || 5;

const onlineUsers = new Map();
const ipConnections = new Map();
let io = null;

process.on('uncaughtException', (err) => {
  console.error(`[${timestamp()}] UNCAUGHT EXCEPTION:`, err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error(`[${timestamp()}] UNHANDLED REJECTION:`, reason);
});

function timestamp() {
  return new Date().toISOString();
}

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';
}

const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/emit-notification') {
    let body = '';
    let bytes = 0;
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > 65536) {
        req.destroy(new Error('Payload too large'));
        return;
      }
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { userId, notification } = JSON.parse(body);
        if (!userId || !notification) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing userId or notification' }));
          return;
        }
        if (io) {
          io.to(`user:${userId}`).emit('notification', notification);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      onlineUsers: onlineUsers.size,
      connections: io?.engine?.clientsCount || 0,
      memoryUsage: process.memoryUsage().rss,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Let Socket.IO handle its own requests
  if (req.url?.startsWith('/socket.io')) {
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO server running');
});

io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  connectTimeout: 15000,
  maxHttpBufferSize: 1e6,
  httpCompression: {
    threshold: 512,
  },
  allowEIO3: false,
  perMessageDeflate: {
    threshold: 1024,
  },
});

io.engine.on('connection', (socket) => {
  const clientIP = getClientIP(socket.request);
  const count = ipConnections.get(clientIP) || 0;
  if (count >= MAX_CONNECTIONS_PER_IP) {
    socket.close();
    return;
  }
  ipConnections.set(clientIP, count + 1);
  socket.on('close', () => {
    const c = ipConnections.get(clientIP) || 1;
    if (c <= 1) ipConnections.delete(clientIP);
    else ipConnections.set(clientIP, c - 1);
  });
});

io.on('connection', (socket) => {
  console.log(`[${timestamp()}] Socket connected: ${socket.id}`);

  const rateLimit = createRateLimiter();

  socket.on('join', (userId) => {
    if (!rateLimit(socket)) return;
    if (!userId || typeof userId !== 'number') return;

    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit('usersOnline', Array.from(onlineUsers.keys()));
    console.log(`[${timestamp()}] User ${userId} joined (socket ${socket.id})`);
  });

  socket.on('joinConversation', (conversationId) => {
    if (!rateLimit(socket)) return;
    if (!conversationId) return;
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leaveConversation', (conversationId) => {
    if (!conversationId) return;
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('sendMessage', (data) => {
    if (!rateLimit(socket)) return;
    const { conversationId, message, receiverId, senderId } = data || {};
    if (!conversationId || !message) return;

    io.to(`conversation:${conversationId}`).emit('newMessage', message);

    if (receiverId && onlineUsers.has(receiverId)) {
      io.to(onlineUsers.get(receiverId)).emit('newMessage', {
        ...message,
        isNotification: true,
      });
    }
  });

  socket.on('typing', (data) => {
    const { conversationId, userId } = data || {};
    if (!conversationId) return;
    socket.to(`conversation:${conversationId}`).emit('userTyping', { conversationId, userId });
  });

  socket.on('stopTyping', (data) => {
    const { conversationId, userId } = data || {};
    if (!conversationId) return;
    socket.to(`conversation:${conversationId}`).emit('userStoppedTyping', { conversationId, userId });
  });

  socket.on('markRead', (data) => {
    const { conversationId, messageId, readerId } = data || {};
    if (!conversationId) return;
    socket.to(`conversation:${conversationId}`).emit('messageRead', { conversationId, messageId, readerId });
  });

  socket.on('notification', (data) => {
    if (!rateLimit(socket)) return;
    const { userId, notification } = data || {};
    if (!userId || !notification) return;
    if (onlineUsers.has(userId)) {
      io.to(onlineUsers.get(userId)).emit('notification', notification);
    }
  });

  socket.on('paymentCompleted', (data) => {
    if (!rateLimit(socket)) return;
    const { userId, payment } = data || {};
    if (!userId || !payment) return;
    if (onlineUsers.has(userId)) {
      io.to(onlineUsers.get(userId)).emit('paymentCompleted', payment);
    }
  });

  socket.on('promotionActivated', (data) => {
    if (!rateLimit(socket)) return;
    const { userId, promotion } = data || {};
    if (!userId || !promotion) return;
    if (onlineUsers.has(userId)) {
      io.to(onlineUsers.get(userId)).emit('promotionActivated', promotion);
    }
  });

  socket.on('disconnect', (reason) => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('usersOnline', Array.from(onlineUsers.keys()));
    }
    console.log(`[${timestamp()}] Socket ${socket.id} disconnected (${reason})`);
    removeAllListeners(socket);
  });
});

function createRateLimiter() {
  const hits = new Map();
  return (socket) => {
    const now = Date.now();
    const key = socket.id;
    const windowStart = hits.get(key) || 0;
    if (now - windowStart < RATE_LIMIT_WINDOW) {
      return false;
    }
    hits.set(key, now);

    if (hits.size > 10000) {
      const cutoff = now - 60000;
      for (const [k, t] of hits) {
        if (t < cutoff) hits.delete(k);
      }
    }
    return true;
  };
}

function removeAllListeners(socket) {
  const events = [
    'join', 'joinConversation', 'leaveConversation', 'sendMessage',
    'typing', 'stopTyping', 'markRead', 'notification',
    'paymentCompleted', 'promotionActivated',
  ];
  for (const event of events) {
    socket.removeAllListeners(event);
  }
}

function startServer(port) {
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`[${timestamp()}] Socket.IO server running on port ${port} (${process.env.NODE_ENV})`);
    console.log(`[${timestamp()}] CORS origin: ${CORS_ORIGIN}`);
    console.log(`[${timestamp()}] Transports: websocket, polling`);
  });
}

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[${timestamp()}] Port ${PORT} is in use, trying port ${PORT + 1}...`);
    startServer(PORT + 1);
  } else {
    console.error(`[${timestamp()}] HTTP server error:`, err.message);
    process.exit(1);
  }
});

httpServer.on('listening', () => {
  const addr = httpServer.address();
  console.log(`[${timestamp()}] HTTP server listening on ${addr.address}:${addr.port}`);
});

function gracefulShutdown(signal) {
  console.log(`\n[${timestamp()}] ${signal} received. Shutting down gracefully...`);
  if (io) {
    io.close(() => {
      console.log(`[${timestamp()}] Socket.IO server closed`);
      httpServer.close(() => {
        console.log(`[${timestamp()}] HTTP server closed`);
        process.exit(0);
      });
    });
    setTimeout(() => {
      console.error(`[${timestamp()}] Forced shutdown after timeout`);
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer(PORT);
