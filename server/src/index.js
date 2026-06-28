const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const { v4: uuid } = require('uuid');

const app    = express();
const server = http.createServer(app);

const JWT_SECRET        = 'chat_secret_dev_key';
const JWT_REFRESH_SECRET = 'chat_refresh_secret_dev';

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

// ── In-memory store ───────────────────────────────────────────────────
const users = [
  { id: '1', username: 'alice',   password: 'alice123',   avatar: 'A', color: '#6366f1' },
  { id: '2', username: 'bob',     password: 'bob123',     avatar: 'B', color: '#f59e0b' },
  { id: '3', username: 'charlie', password: 'charlie123', avatar: 'C', color: '#10b981' },
];

const rooms = [
  { id: 'general',   name: '# general',   description: 'General discussion' },
  { id: 'tech',      name: '# tech',      description: 'Tech talk'          },
  { id: 'random',    name: '# random',    description: 'Off-topic chat'     },
];

// roomId → Message[]
const messages = { general: [], tech: [], random: [] };

// socketId → { userId, username }
const onlineUsers = new Map();

// ── JWT helpers ───────────────────────────────────────────────────────
function signAccess(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '15m' });
}
function signRefresh(user) {
  return jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// ── REST: Auth ────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const { password: _, ...safeUser } = user;
  res.json({
    accessToken:  signAccess(user),
    refreshToken: signRefresh(user),
    user: safeUser,
  });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user    = users.find(u => u.id === payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ accessToken: signAccess(user) });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

app.get('/api/rooms', (req, res) => res.json(rooms));

// ── Socket.io ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: 'http://localhost:4200', credentials: true },
});

// Auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.data.userId   = payload.sub;
    socket.data.username = payload.username;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const { userId, username } = socket.data;
  const user = users.find(u => u.id === userId);
  onlineUsers.set(socket.id, { userId, username });

  console.log(`[+] ${username} connected (${socket.id})`);
  io.emit('online_users', [...onlineUsers.values()].map(u => u.userId));

  // Join room
  socket.on('join_room', (roomId) => {
    socket.rooms.forEach(r => { if (r !== socket.id) socket.leave(r); });
    socket.join(roomId);
    socket.emit('room_history', { roomId, messages: messages[roomId] ?? [] });
  });

  // Send message
  socket.on('send_message', ({ roomId, text }) => {
    const msg = {
      id:        uuid(),
      roomId,
      userId,
      username,
      avatar:    user?.avatar ?? username[0].toUpperCase(),
      color:     user?.color ?? '#6366f1',
      text,
      timestamp: new Date().toISOString(),
      readBy:    [userId],
    };
    if (!messages[roomId]) messages[roomId] = [];
    messages[roomId].push(msg);
    io.to(roomId).emit('new_message', msg);
  });

  // Typing indicator
  socket.on('typing_start', (roomId) => {
    socket.to(roomId).emit('user_typing', { userId, username });
  });
  socket.on('typing_stop', (roomId) => {
    socket.to(roomId).emit('user_stop_typing', { userId });
  });

  // Read receipt
  socket.on('mark_read', ({ roomId, messageId }) => {
    const msg = (messages[roomId] ?? []).find(m => m.id === messageId);
    if (msg && !msg.readBy.includes(userId)) {
      msg.readBy.push(userId);
      io.to(roomId).emit('message_read', { messageId, userId });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    console.log(`[-] ${username} disconnected`);
    io.emit('online_users', [...onlineUsers.values()].map(u => u.userId));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Chat server running on http://localhost:${PORT}`));
