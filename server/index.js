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

// ============================================================================
// REST API ROUTES
// ============================================================================

/**
 * GET /api/devices - Retourne l'état de tous les devices
 */
app.get('/api/devices', (req, res) => {
  res.json(devicesState);
});

/**
 * GET /api/scenes - Retourne la liste des scènes disponibles
 */
app.get('/api/scenes', (req, res) => {
  const scenes = loadScenes();
  res.json(scenes);
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

  // Envoyer le contenu de chaque device
  Object.entries(scene.devices).forEach(([deviceId, content]) => {
    const device = devicesState[deviceId];
    if (device) {
      devicesState[deviceId].lastContent = content;
      devicesState[deviceId].lastUpdate = Date.now();

      // Broadcaster via Socket.IO
      io.to(`display-${deviceId}`).emit('content-update', {
        type: content.type,
        src: content.src,
        value: content.value,
        duration: content.duration || null,
        timestamp: Date.now(),
      });
    }
  });

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
  const query = socket.handshake.query;
  const deviceId = query.deviceId;

  if (!deviceId) {
    socket.disconnect();
    return;
  }

  log('WEBSOCKET', `Device ${deviceId} connected`, socket.id);

  // Enregistrer la connexion
  if (devicesState[deviceId]) {
    devicesState[deviceId].connected = true;
    devicesState[deviceId].sessionId = socket.id;

    // Rejoindre une room par device
    socket.join(`display-${deviceId}`);

    // Informer l'admin du changement de statut
    io.to('admin').emit('device-status-update', {
      deviceId,
      connected: true,
      label: devicesState[deviceId].label,
    });

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
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Déconnexion
  socket.on('disconnect', () => {
    log('WEBSOCKET', `Device ${deviceId} disconnected`, socket.id);

    if (devicesState[deviceId]) {
      devicesState[deviceId].connected = false;
      devicesState[deviceId].sessionId = null;

      // Informer l'admin
      io.to('admin').emit('device-status-update', {
        deviceId,
        connected: false,
        label: devicesState[deviceId].label,
      });
    }
  });
});

// ============================================================================
// ADMIN WEBSOCKET
// ============================================================================

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, config.PUBLIC_DIR, 'admin.html'));
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
