const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const WATCHER_PORT = 3001;
const SERVER_SCRIPT = path.join(__dirname, 'server.js');

let serverProcess = null;
let serverStatus = 'stopped';
let serverPort = 3000;
let uptimeStart = null;

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.static(path.join(__dirname)));

function startServer() {
  if (serverProcess) return;
  serverStatus = 'starting';
  serverProcess = spawn('node', [SERVER_SCRIPT], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc']
  });

  serverProcess.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log('[server]', msg);
  });

  serverProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error('[server:err]', msg);
  });

  serverProcess.on('message', (msg) => {
    if (msg.type === 'started') {
      serverStatus = 'running';
      serverPort = msg.port || 3000;
      uptimeStart = Date.now();
      console.log(`Server started on port ${serverPort}`);
    }
  });

  serverProcess.on('exit', (code) => {
    serverProcess = null;
    serverStatus = 'stopped';
    uptimeStart = null;
    console.log(`Server exited with code ${code}`);
  });

  serverProcess.on('error', (err) => {
    serverProcess = null;
    serverStatus = 'stopped';
    uptimeStart = null;
    console.error('Failed to start server:', err.message);
  });
}

function stopServer() {
  if (!serverProcess) return;
  serverStatus = 'stopping';
  try {
    serverProcess.kill('SIGTERM');
  } catch (e) {
    serverProcess = null;
    serverStatus = 'stopped';
  }
}

app.get('/api/watcher/status', (req, res) => {
  res.json({
    serverStatus,
    port: serverPort,
    uptime: uptimeStart ? Math.floor((Date.now() - uptimeStart) / 1000) : 0,
    pid: serverProcess ? serverProcess.pid : null
  });
});

app.post('/api/watcher/start', (req, res) => {
  if (serverStatus === 'running') {
    return res.json({ status: 'already_running' });
  }
  startServer();
  res.json({ status: 'starting' });
});

app.post('/api/watcher/stop', (req, res) => {
  if (serverStatus === 'stopped') {
    return res.json({ status: 'already_stopped' });
  }
  stopServer();
  res.json({ status: 'stopping' });
});

app.post('/api/watcher/restart', (req, res) => {
  if (serverProcess) {
    serverProcess.on('exit', () => {
      setTimeout(startServer, 500);
    });
    stopServer();
  } else {
    startServer();
  }
  res.json({ status: 'restarting' });
});

app.listen(WATCHER_PORT, () => {
  console.log(`Watcher running at http://localhost:${WATCHER_PORT}`);
  // Auto-start the main server
  startServer();
});
