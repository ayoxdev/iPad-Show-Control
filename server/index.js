import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, log } from './config.js';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialisation Express et Socket.IO
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  serveClient: true,  // Servir le client Socket.IO
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, config.PUBLIC_DIR)));

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Stocke l'état des devices et leur dernier contenu envoyé
 * Structure: {
 *   "1": { connected: true, lastContent: {...}, lastUpdate: timestamp },
 *   "2": { connected: false, lastContent: {...}, lastUpdate: timestamp }
 * }
 */
let devicesState = {};

// Server-wide state
let serverState = {
  lastScene: null,
  lastSceneTime: null,
  serverStartTime: Date.now(),
};


/**
 * Charger la config des devices
 */
function loadDevicesConfig() {
  try {
    const data = fs.readFileSync(path.join(__dirname, config.DEVICES_CONFIG), 'utf-8');
    const { devices } = JSON.parse(data);
    devices.forEach((device) => {
      devicesState[device.id] = {
        ...device,
        connected: false,
        lastContent: null,
        lastUpdate: null,
        sessionId: null,
        connectionTime: null, // timestamp when device first connected in this session
        ping: null, // latency in milliseconds
        pingTimestamp: null, // when the last ping was measured
      };
    });
    log('SERVER', 'Devices config loaded', devicesState);
  } catch (err) {
    console.error('❌ Error loading devices config:', err.message);
    process.exit(1);
  }
}

/**
 * Charger la liste des scènes disponibles
 */
function loadScenes() {
  try {
    const scenesDir = path.join(__dirname, config.SCENES_DIR);
    if (!fs.existsSync(scenesDir)) {
      fs.mkdirSync(scenesDir, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(scenesDir).filter((f) => f.endsWith('.json'));
    const scenes = files.map((file) => {
      const data = fs.readFileSync(path.join(scenesDir, file), 'utf-8');
      return JSON.parse(data);
    });

    log('SERVER', 'Scenes loaded', scenes.length);
    return scenes;
  } catch (err) {
    console.error('❌ Error loading scenes:', err.message);
    return [];
  }
}

/**
 * Safe write a scene JSON file to disk (write to temp then rename)
 * Returns the filename written or throws an error
 */
function writeSceneFile(scene) {
  if (!scene || !scene.id) throw new Error('Scene must have an id');

  const scenesDir = path.join(__dirname, config.SCENES_DIR);
  if (!fs.existsSync(scenesDir)) fs.mkdirSync(scenesDir, { recursive: true });

  // sanitize id for filename
  const safeId = String(scene.id).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const targetPath = path.join(scenesDir, `${safeId}.json`);
  const tmpPath = `${targetPath}.tmp`;

  // Write safely
  fs.writeFileSync(tmpPath, JSON.stringify(scene, null, 2), 'utf-8');
  fs.renameSync(tmpPath, targetPath);

  return targetPath;
}

// ============================================================================
// REST API ROUTES
// ============================================================================

/**
 * GET /api/devices - Retourne l'état de tous les devices avec uptime
 */
app.get('/api/devices', (req, res) => {
  // Calculate uptime for each device
  const devicesWithUptime = {};
  Object.entries(devicesState).forEach(([id, device]) => {
    devicesWithUptime[id] = {
      ...device,
      // connectedDuration: milliseconds this device has been connected (if connected)
      connectedDuration: device.isConnected && device.connectionTime
        ? Date.now() - device.connectionTime
        : 0,
    };
  });
  res.json(devicesWithUptime);
});

/**
 * GET /api/scenes - Retourne la liste des scènes disponibles
 */
app.get('/api/scenes', (req, res) => {
  const scenes = loadScenes();
  res.json(scenes);
});

/**
 * GET /api/status - return server state (last scene, server uptime etc.)
 */
app.get('/api/status', (req, res) => {
  res.json({
    ...serverState,
    // Calculate server uptime in milliseconds
    serverUptime: Date.now() - serverState.serverStartTime,
  });
});

/**
 * POST /api/scenes - Create a new scene (body: scene JSON)
 */
app.post('/api/scenes', (req, res) => {
  const scene = req.body;
  if (!scene || !scene.id) {
    return res.status(400).json({ error: 'Scene JSON with an "id" is required' });
  }

  try {
    // Check if already exists
    const scenes = loadScenes();
    if (scenes.find((s) => s.id === scene.id)) {
      return res.status(409).json({ error: 'Scene with this id already exists' });
    }

    writeSceneFile(scene);

    // Notify clients to refresh scenes
    io.emit('scenes-updated');

    res.status(201).json({ success: true, scene });
  } catch (err) {
    console.error('Error creating scene:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/scene/:sceneId - Update or create (upsert) a scene
 */
app.put('/api/scene/:sceneId', (req, res) => {
  const { sceneId } = req.params;
  const scene = req.body;

  if (!scene || !scene.id || scene.id !== sceneId) {
    return res.status(400).json({ error: 'Scene JSON with matching "id" is required' });
  }

  try {
    writeSceneFile(scene);
    io.emit('scenes-updated');
    res.json({ success: true, scene });
  } catch (err) {
    console.error('Error updating scene:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/scene/:sceneId - Delete a scene file
 */
app.delete('/api/scene/:sceneId', (req, res) => {
  const { sceneId } = req.params;
  try {
    const scenesDir = path.join(__dirname, config.SCENES_DIR);
    const safeId = String(sceneId).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const targetPath = path.join(scenesDir, `${safeId}.json`);

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      io.emit('scenes-updated');
      return res.json({ success: true });
    }

    res.status(404).json({ error: 'Scene not found' });
  } catch (err) {
    console.error('Error deleting scene:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scene/:sceneId - Déclenche une scène complète
 */
app.post('/api/scene/:sceneId', (req, res) => {
  const { sceneId } = req.params;
  const scenes = loadScenes();
  const scene = scenes.find((s) => s.id === sceneId);

  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }

  log('SERVER', 'Scene triggered', sceneId);

  // remember last scene on server state so clients that missed the event can fetch it
  serverState.lastScene = sceneId;
  serverState.lastSceneTime = Date.now();

  // Envoyer le contenu de chaque device and update server-side devicesState
  Object.entries(scene.devices).forEach(([deviceId, content]) => {
    const device = devicesState[deviceId];
    if (device) {
      devicesState[deviceId].lastContent = content;
      devicesState[deviceId].lastScene = sceneId;
      devicesState[deviceId].lastUpdate = Date.now();

      // Broadcaster via Socket.IO to the display
      io.to(`display-${deviceId}`).emit('content-update', {
        type: content.type,
        src: content.src,
        value: content.value,
        duration: content.duration || null,
        timestamp: Date.now(),
      });
    }
  });

  // Notify dashboards/admins that a scene was triggered (only to UI clients)
  io.to('ui').emit('scene-triggered', {
    sceneId,
    timestamp: Date.now(),
    deviceCount: Object.keys(scene.devices).length
  });

  // Emit updated device state so clients refresh their UI immediately
  io.to('ui').emit('device-status-update', devicesState);

  res.json({ success: true, scene });
});

/**
 * POST /api/content - Envoyer du contenu à des devices spécifiques
 */
app.post('/api/content', (req, res) => {
  const { deviceIds, content } = req.body;

  if (!deviceIds || !content) {
    return res.status(400).json({ error: 'Missing deviceIds or content' });
  }

  log('SERVER', 'Content sent to devices', deviceIds);

  const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];

  ids.forEach((deviceId) => {
    if (devicesState[deviceId]) {
      devicesState[deviceId].lastContent = content;
      devicesState[deviceId].lastUpdate = Date.now();

      io.to(`display-${deviceId}`).emit('content-update', {
        type: content.type,
        src: content.src,
        value: content.value,
        duration: content.duration || null,
        timestamp: Date.now(),
      });
    }
  });

  res.json({ success: true });
});

/**
 * POST /api/content/:deviceId/fallback - Forcer le fallback pour un device
 */
app.post('/api/content/:deviceId/fallback', (req, res) => {
  const { deviceId } = req.params;

  if (devicesState[deviceId]) {
    devicesState[deviceId].lastContent = null;
    devicesState[deviceId].lastUpdate = null;

    io.to(`display-${deviceId}`).emit('fallback');
    log('SERVER', 'Fallback triggered for device', deviceId);
  }

  res.json({ success: true });
});

/**
 * POST /api/all/fallback - Forcer le fallback pour TOUS les devices
 */
app.post('/api/all/fallback', (req, res) => {
  Object.keys(devicesState).forEach((deviceId) => {
    devicesState[deviceId].lastContent = null;
    devicesState[deviceId].lastUpdate = null;
    io.to(`display-${deviceId}`).emit('fallback');
  });

  log('SERVER', 'Fallback triggered for ALL devices');
  res.json({ success: true });
});

// ============================================================================
// WEBSOCKET HANDLERS
// ============================================================================

io.on('connection', (socket) => {
  const query = socket.handshake.query || {};
  const auth = socket.handshake.auth || {};
  const deviceId = query.deviceId || auth.deviceId || null;

  // Log handshake for debugging (concise)
  log('WEBSOCKET', `New socket connected`, { id: socket.id, deviceId, query, auth: !!Object.keys(auth).length });

  // If no deviceId provided, treat this as an admin/dashboard UI client
  if (!deviceId) {
    log('WEBSOCKET', `UI client connected (admin/dashboard)`, socket.id);

    // Join UI room so we can target broadcasts efficiently
    socket.join('ui');

    // Send current devices state and scenes list to the UI client
    socket.emit('device-status-update', devicesState);
    try {
      socket.emit('scenes-updated', loadScenes());
    } catch (e) {
      // ignore if scenes cannot be loaded right now
    }

    // Allow UI to ping
    socket.on('ping', () => socket.emit('pong'));

    // No further per-device state to manage for UI sockets
    return;
  }

  log('WEBSOCKET', `Device ${deviceId} connected`, socket.id);

  // Enregistrer la connexion
  if (devicesState[deviceId]) {
    devicesState[deviceId].isConnected = true;
    devicesState[deviceId].sessionId = socket.id;
    devicesState[deviceId].lastUpdate = Date.now();
    // Record when device connected (first time this session)
    if (!devicesState[deviceId].connectionTime) {
      devicesState[deviceId].connectionTime = Date.now();
    }

    // Rejoindre une room par device
    socket.join(`display-${deviceId}`);


    // Informer l'admin et dashboard du changement de statut (only UI room)
    io.to('ui').emit('device-status-update', devicesState);

    // Envoyer le dernier contenu si disponible
    if (devicesState[deviceId].lastContent) {
      socket.emit('content-update', {
        type: devicesState[deviceId].lastContent.type,
        src: devicesState[deviceId].lastContent.src,
        value: devicesState[deviceId].lastContent.value,
        duration: devicesState[deviceId].lastContent.duration || null,
        timestamp: devicesState[deviceId].lastUpdate,
      });
    }

    // Pong pour confirmer la connexion
    socket.emit('pong');
  }

  // Gérer les pings du client
    // Allow basic ping/pong
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle ping measurements from display clients (for latency tracking)
    // Expect a number (client timestamp). Compute server-side one-way latency
    // as Date.now() - ts and update device state; reply with a light 'pong-measure'
    socket.on('ping-measure', (clientTimestamp) => {
      if (devicesState[deviceId]) {
        const ts = Number(clientTimestamp) || 0;
        const now = Date.now();
        const ping = now - ts;
        devicesState[deviceId].ping = ping;
        devicesState[deviceId].pingTimestamp = now;
        log('WEBSOCKET', `Ping measured for device ${deviceId}: ${ping}ms`, { clientTimestamp: ts, serverTime: now });

        // Broadcast updated device state only to UIs
        io.to('ui').emit('device-status-update', devicesState);

        // Reply to emitter with a compact pong including server time
        socket.emit('pong-measure', { serverTime: now, ping });
      } else {
        // If device unknown, still respond so client can detect
        socket.emit('pong-measure', { serverTime: Date.now(), ping: null });
      }
    });

  // Déconnexion
  socket.on('disconnect', () => {
    log('WEBSOCKET', `Device ${deviceId} disconnected`, socket.id);

    if (devicesState[deviceId]) {
      devicesState[deviceId].isConnected = false;
      devicesState[deviceId].sessionId = null;

      // Informer l'admin et dashboard (only UI room)
      io.to('ui').emit('device-status-update', devicesState);
    }
  });
});

// ============================================================================
// ADMIN WEBSOCKET
// ============================================================================

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, config.PUBLIC_DIR, 'admin.html'));
});

app.get('/mobile', (req, res) => {
  res.sendFile(path.join(__dirname, config.PUBLIC_DIR, 'mobile.html'));
});

app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, config.PUBLIC_DIR, 'editor.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, config.PUBLIC_DIR, 'dashboard.html'));
});

app.get('/display/:id', (req, res) => {
  res.sendFile(path.join(__dirname, config.PUBLIC_DIR, 'display.html'));
});

// ============================================================================
// STARTUP
// ============================================================================

loadDevicesConfig();

// Obtenir l'IP locale du serveur
import os from 'os';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorer les IPs locales internes et IPv6
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

httpServer.listen(config.PORT, config.HOST, () => {
  const localIP = getLocalIP();
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🎬 iPad Show Control Server                           ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  📍 Serveur:                                           ║
║     http://localhost:${config.PORT}                    ║
║     http://${localIP}:${config.PORT}                   ║
║                                                        ║
║  🎛️  Admin Panel:                                      ║
║     http://${localIP}:${config.PORT}/admin             ║
║                                                        ║
║  📱 iPads (utilisez cette adresse):                    ║
║     http://${localIP}:${config.PORT}/display/1         ║
║     http://${localIP}:${config.PORT}/display/2         ║
║     http://${localIP}:${config.PORT}/display/3         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});
