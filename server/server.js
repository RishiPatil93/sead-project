require('dotenv').config();
// Fix: Node.js v17+ changed DNS resolution order; force system resolver for Atlas SRV
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// JDoodle credentials (for code execution)
const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID || '';
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '';

// Rate limiter for auth routes (prevent brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for code execution (prevent abuse/cost explosion)
const executeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 executions per minute
  message: { success: false, message: 'Rate limit exceeded. Please wait before running more code.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route imports
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const snippetRoutes = require('./routes/snippets.routes');

// Middleware imports
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Express Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── DB Readiness Gate ─────────────────────────────────────────
// This MUST come before route registration.
// Returns 503 on any /api/auth or /api/rooms request while DB
// is still spinning up, so the client gets a clean JSON error
// instead of a 502 Bad Gateway.
let dbReady = false;

app.use(['/api/auth', '/api/rooms'], (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      success: false,
      message: 'Server is starting up — database not ready yet. Please retry in a few seconds.',
    });
  }
  next();
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/snippets', snippetRoutes);

// Code execution proxy endpoint (forwards to JDoodle API)
app.post('/api/execute', executeLimiter, async (req, res) => {
  try {
    const { language, code, stdin } = req.body || {};

    if (!language || !code) {
      return res.status(400).json({ success: false, message: 'Missing required fields: language and code' });
    }

    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
      return res.status(500).json({ success: false, message: 'JDoodle credentials not configured. Set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in the server environment.' });
    }

    // Validate and sanitize stdin - ensure it's a safe string if provided
    const safeStdin = (typeof stdin === 'string' && stdin.length > 0 && stdin.length <= 10000)
      ? stdin.slice(0, 10000)
      : '';

    // Map our editor language keys to JDoodle language names
    const langMap = {
      javascript: 'nodejs',
      python: 'python3',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      typescript: 'nodejs',
      go: 'go',
      rust: 'rust',
    };

    const jdLanguage = langMap[language] || language;

    const payload = {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      language: jdLanguage,
      versionIndex: '0',
    };

    if (safeStdin) {
      payload.stdin = safeStdin;
    }

    const axiosConfig = {
      timeout: 60000,
      validateStatus: () => true,
    };

    const jdResp = await axios.post('https://api.jdoodle.com/v1/execute', payload, axiosConfig);

    if (!jdResp || !jdResp.data) {
      console.error('[Execute] JDoodle returned empty response');
      return res.status(502).json({ success: false, message: 'JDoodle returned an empty response' });
    }

    const output = typeof jdResp.data.output === 'string' ? jdResp.data.output : '';
    const error = jdResp.data.error || '';
    const statusCode = jdResp.data.statusCode || jdResp.status;

    if (jdResp.status >= 200 && jdResp.status < 300 && !error) {
      return res.json({ success: true, output, stderr: '' });
    }

    // Authentication / access errors
    if (jdResp.status === 401 || jdResp.status === 403 || statusCode === '429') {
      const msg = statusCode === '429'
        ? 'JDoodle rate limit exceeded. Please wait a moment before running again.'
        : 'JDoodle authentication failed — check JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in your server environment.';
      return res.status(502).json({ success: false, message: msg, output });
    }

    // Forward error payload from JDoodle for debugging
    const errorMsg = error || jdResp.data.message || `JDoodle returned status ${jdResp.status}`;
    return res.status(502).json({ success: false, message: errorMsg, output });
  } catch (err) {
    console.error('[Execute] Error calling JDoodle API:', err.response?.data || err.message || err);

    const errorMessage = err.response?.data?.error
      || err.response?.data?.message
      || err.message
      || 'Execution failed due to an unexpected error';

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: typeof err.message === 'string' ? err.message : String(err),
    });
  }
});

// Health Check (always responds — no DB dependency)
app.get('/api/health', (req, res) => {
  console.log('JDoodle ID:', process.env.JDOODLE_CLIENT_ID ? 'Loaded' : 'Missing');
  res.json({
    status: 'OK',
    message: 'RCO-IDE Server is running',
    dbReady,
    // Whether code execution is available (JDoodle credentials present)
    executionEnabled: Boolean(JDOODLE_CLIENT_ID && JDOODLE_CLIENT_SECRET),
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use(errorHandler);

// ── Socket.io ─────────────────────────────────────────────────
const roomUsers = {}; // mapped by roomId

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    
    // Initialize room if missing
    if (!roomUsers[roomId]) roomUsers[roomId] = [];
    
    // Prevent duplicate entries for same user
    let existingUser = roomUsers[roomId].find(u => u.id === user.id);
    if (existingUser) {
      existingUser.socketId = socket.id; // update socket id if reconnected
    } else {
      roomUsers[roomId].push({ ...user, socketId: socket.id });
    }

    console.log(`[Socket] ${user?.username} joined room: ${roomId}`);
    
    // Broadcast active users to everyone in the room
    io.to(roomId).emit('room-users', roomUsers[roomId]);

    // Fast-boot P2P Code Sync: ask the oldest user in the room to send code to the new guy
    const peers = roomUsers[roomId].filter(u => u.socketId !== socket.id);
    if (peers.length > 0) {
      io.to(peers[0].socketId).emit('request-first-sync', { targetSocketId: socket.id });
    }
  });

  // Peer-to-peer sync response
  socket.on('first-sync-response', ({ targetSocketId, code }) => {
    // Send it directly only to the new user who requested it
    io.to(targetSocketId).emit('code-change', code);
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-change', code);
  });

  socket.on('cursor-change', ({ roomId, cursor }) => {
    socket.to(roomId).emit('cursor-change', cursor);
  });

  socket.on('snapshot-saved', ({ roomId }) => {
    socket.to(roomId).emit('snapshot-saved');
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomUsers[roomId]) {
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        io.to(roomId).emit('room-users', roomUsers[roomId]);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Socket authentication middleware: validate JWT sent in handshake auth
io.use((socket, next) => {
  try {
    const token = socket.handshake?.auth?.token ||
      (socket.handshake?.headers?.authorization ? socket.handshake.headers.authorization.split(' ')[1] : null);
    if (!token) {
      const e = new Error('Unauthorized');
      e.data = { message: 'No token provided' };
      return next(e);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user id to socket for later use
    socket.userId = decoded.id;
    return next();
  } catch (err) {
    const e = new Error('Unauthorized');
    e.data = { message: 'Invalid token' };
    return next(e);
  }
});

// ── Startup ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Start HTTP server FIRST — always available for health checks
server.listen(PORT, () => {
  console.log(`[Server] RCO-IDE backend running on http://localhost:${PORT}`);
  console.log('[Server] Connecting to database...');
  connectDB();
});

async function connectDB() {
  const mongoUri = (process.env.MONGO_URI || '').trim();

  // If MONGO_URI is missing or contains obvious placeholders, skip the primary Atlas SRV lookup
  // This avoids noisy DNS errors when the repo .env still has example placeholders.
  if (!mongoUri || /<.*>|YOUR_CLUSTER/.test(mongoUri)) {
    console.warn('[MongoDB] MONGO_URI appears missing or contains placeholders; skipping primary connection and using in-memory fallback.');
  } else {
    try {
      await mongoose.connect(mongoUri);
      dbReady = true;
      console.log('[MongoDB] ✓ Connected successfully to DB');
      return;
    } catch (err) {
      console.warn(`[MongoDB] Primary URI failed: ${err.message}`);
      console.warn('[MongoDB] Trying in-memory fallback…');
    }
  }

  // 2. In-memory MongoDB fallback (first run may download binary — takes 1-3 min)
  try {
    process.env.MONGOMS_SPAWN_TIMEOUT    = '180000';
    process.env.MONGOMS_STARTUP_TIMEOUT  = '180000';
    process.env.MONGOMS_DOWNLOAD_TIMEOUT = '300000';

    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('[MongoDB] Starting in-memory MongoDB (first-run download may take 1-3 min)...');

    const mongoServer = await MongoMemoryServer.create({
      instance: { 
        dbName: 'rco-ide',
      },
    });

    await mongoose.connect(mongoServer.getUri());
    dbReady = true;
    console.log('[MongoDB] ✓ Connected to IN-MEMORY database');
  } catch (memErr) {
    console.error('[MongoDB] ✗ Memory server failed:', memErr.message);
    console.error('No database available. API routes that require the database will return 503 until the database is available.');
    // Do NOT enable mock UI mode. Keep dbReady=false so the DB readiness gate returns 503.
  }
}

