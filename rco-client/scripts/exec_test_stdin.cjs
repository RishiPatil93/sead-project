#!/usr/bin/env node
const axios = require('axios');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

async function main() {
  const code = `s = input().strip()
print(int(s) * 2)`;

  try {
    const res = await axios.post(`${BASE}/api/execute`, { language: 'python', code, stdin: '21' }, { timeout: 120000 });
    console.log('status', res.status);
    console.log('body', res.data);
  } catch (err) {
    console.error('error', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

main();
