#!/usr/bin/env node
// Simple smoke-test: register/login, socket connect, join room, emit code, execute code
const axios = require('axios');
const io = require('socket.io-client');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForSocketConnect(socket, timeout = 10000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const t = setTimeout(() => {
      if (!settled) { settled = true; reject(new Error('socket connect timeout')); }
    }, timeout);
    socket.on('connect', () => { if (!settled) { settled = true; clearTimeout(t); resolve(); } });
    socket.on('connect_error', (err) => { if (!settled) { settled = true; clearTimeout(t); reject(err); } });
    socket.on('error', (err) => { if (!settled) { settled = true; clearTimeout(t); reject(err); } });
  });
}

async function main() {
  console.log('Smoke test starting...');
  try {
    // Health check
    let health;
    try {
      health = await axios.get(`${BASE}/api/health`);
      console.log('Server health:', JSON.stringify(health.data));
    } catch (err) {
      console.error('Cannot reach server at', BASE, '-', err.message || err);
      process.exit(2);
    }

    const unique = Date.now();
    const username = `smoke-${unique}`;
    const email = `smoke+${unique}@example.com`;
    const password = 'Password123!';

    let token = null;
    let user = null;

    // Try to register; if it fails, try login
    try {
      const regRes = await axios.post(`${BASE}/api/auth/register`, { username, email, password });
      token = regRes.data.token;
      user = regRes.data.user;
      console.log('Registered user:', user.username, 'id:', user.id);
    } catch (err) {
      console.warn('Register failed (maybe user exists):', err.response?.data || err.message || err);
      try {
        const loginRes = await axios.post(`${BASE}/api/auth/login`, { email, password });
        token = loginRes.data.token;
        user = loginRes.data.user;
        console.log('Logged in existing user:', user.username);
      } catch (loginErr) {
        console.error('Login failed:', loginErr.response?.data || loginErr.message || loginErr);
        process.exit(3);
      }
    }

    if (!token) { console.error('No token received'); process.exit(4); }

    // Connect socket.io with token in handshake
    console.log('Connecting socket with token...');
    const socket = io(BASE, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 2,
      timeout: 5000,
      autoConnect: true,
    });

    socket.on('connect_error', (err) => {
      console.error('socket connect_error:', err && err.message ? err.message : err);
    });

    await waitForSocketConnect(socket, 8000);
    console.log('Socket connected:', socket.id);

    const roomId = 'smoke-room';
    socket.emit('join-room', { roomId, user });

    socket.once('room-users', (users) => {
      console.log('room-users event received:', users.map(u => ({ id: u.id, username: u.username })));
    });

    await wait(500);
    const sampleCode = 'console.log("smoke test")';
    socket.emit('code-change', { roomId, code: sampleCode });
    console.log('Emitted code-change');

    // Call execution endpoint
    console.log('Calling /api/execute...');
    const execRes = await axios.post(`${BASE}/api/execute`, { language: 'javascript', code: sampleCode }, { timeout: 120000 }).catch(e => e.response || { status: 500, data: e.message });
    console.log('Execute response status:', execRes.status);
    console.log('Execute response body:', JSON.stringify(execRes.data, null, 2));

    // Cleanup
    socket.disconnect();
    console.log('Smoke test finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err && err.stack ? err.stack : err);
    process.exit(5);
  }
}

main();
