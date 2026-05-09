const { Server } = require('socket.io');
const http = require('http');

const onlineUsers = new Map();

const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle emit-notification endpoint
  if (req.method === 'POST' && req.url === '/emit-notification') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { userId, notification } = JSON.parse(body);
        if (io) {
          io.to(`user:${userId}`).emit('notification', notification);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', onlineUsers: onlineUsers.size }));
    return;
  }

  res.writeHead(200);
  res.end('Socket.IO server running');
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: false,
    allowedHeaders: ['*']
  },
  pingTimeout: 25000,
  pingInterval: 10000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectTimeout: 10000,
  maxHttpBufferSize: 1e6,
  httpCompression: {
    threshold: 512
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit('usersOnline', Array.from(onlineUsers.keys()));
    console.log(`User ${userId} joined`);
  });

  socket.on('joinConversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  socket.on('sendMessage', (data) => {
    const { conversationId, message, receiverId, senderId } = data;
    
    io.to(`conversation:${conversationId}`).emit('newMessage', message);
    
    if (onlineUsers.has(receiverId)) {
      io.to(onlineUsers.get(receiverId)).emit('newMessage', {
        ...message,
        isNotification: true
      });
    }
    
    console.log(`Message sent in conversation ${conversationId}`);
  });

  socket.on('typing', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation:${conversationId}`).emit('userTyping', { conversationId, userId });
  });

  socket.on('stopTyping', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation:${conversationId}`).emit('userStoppedTyping', { conversationId, userId });
  });

  socket.on('markRead', (data) => {
    const { conversationId, messageId, readerId } = data;
    socket.to(`conversation:${conversationId}`).emit('messageRead', { conversationId, messageId, readerId });
  });

  socket.on('notification', (data) => {
    const { userId, notification } = data;
    if (onlineUsers.has(userId)) {
      io.to(onlineUsers.get(userId)).emit('notification', notification);
    }
  });

  socket.on('paymentCompleted', (data) => {
    const { userId, payment } = data;
    if (onlineUsers.has(userId)) {
      io.to(onlineUsers.get(userId)).emit('paymentCompleted', payment);
    }
  });

  socket.on('promotionActivated', (data) => {
    const { userId, promotion } = data;
    if (onlineUsers.has(userId)) {
      io.to(onlineUsers.get(userId)).emit('promotionActivated', promotion);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('usersOnline', Array.from(onlineUsers.keys()));
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3006;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
