# 🎨 Exemples avancés

Collection d'exemples pour étendre le système.

## 📚 Table des matières

1. [Créer une scène dynamique](#créer-une-scène-dynamique)
2. [Ajouter un nouveau type de contenu](#ajouter-un-nouveau-type-de-contenu)
3. [Intégration avec un système OSC](#intégration-avec-un-système-osc)
4. [Timeline et séquençage](#timeline-et-séquençage)
5. [Monitoring avancé](#monitoring-avancé)

---

## Créer une scène dynamique

### Générer une scène via JavaScript

Au lieu de fichiers JSON statiques, générer les scènes dynamiquement:

```javascript
// server/routes/dynamic-scenes.js
export function generateRainbowScene() {
  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
  
  const devices = {};
  [1, 2, 3].forEach((id, index) => {
    devices[id] = {
      type: 'color',
      value: colors[index % colors.length]
    };
  });
  
  return {
    id: 'rainbow_' + Date.now(),
    label: 'Arc-en-ciel',
    devices
  };
}

export function generateGradient(startColor, endColor, steps = 3) {
  // Interpoler entre deux couleurs
  const devices = {};
  [1, 2, 3].forEach((id, index) => {
    const ratio = index / (3 - 1);
    const color = interpolateColor(startColor, endColor, ratio);
    devices[id] = { type: 'color', value: color };
  });
  
  return {
    id: `gradient_${Date.now()}`,
    label: `Gradient ${startColor} → ${endColor}`,
    devices
  };
}

function interpolateColor(c1, c2, ratio) {
  // Convertir hex → RGB, interpoler, reconvertir en hex
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
```

### Utiliser dans le serveur

```javascript
// server/index.js
import { generateRainbowScene, generateGradient } from './routes/dynamic-scenes.js';

app.post('/api/dynamic/rainbow', (req, res) => {
  const scene = generateRainbowScene();
  
  // Broadcaster aux devices
  Object.entries(scene.devices).forEach(([deviceId, content]) => {
    io.to(`display-${deviceId}`).emit('content-update', {
      type: content.type,
      value: content.value,
      timestamp: Date.now(),
    });
  });
  
  res.json({ success: true, scene });
});

app.post('/api/dynamic/gradient', (req, res) => {
  const { startColor = '#ff0000', endColor = '#0000ff' } = req.body;
  const scene = generateGradient(startColor, endColor);
  // Même logique...
  res.json({ success: true, scene });
});
```

### Appeler depuis l'admin

```javascript
// admin.html - Ajouter un bouton
<button class="btn-primary" onclick="sendRainbow()">🌈 Rainbow Effect</button>

<script>
async function sendRainbow() {
  const res = await fetch('/api/dynamic/rainbow', { method: 'POST' });
  debug('✓ Rainbow effect sent');
}
</script>
```

---

## Ajouter un nouveau type de contenu

### Exemple: Afficher un PDF

#### 1. Server (index.js)

```javascript
// Aucun changement - le serveur envoie juste les données
```

#### 2. Client (display.html)

```javascript
// Dans la classe DisplayClient

onContentUpdate(data) {
  // ... code existant ...
  
  switch (data.type) {
    case 'pdf':
      this.displayPDF(data.src, data.page || 0);
      break;
    // ... autres types ...
  }
}

displayPDF(src, page = 0) {
  // Utiliser PDF.js
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.onload = () => {
    pdfjsLib.getDocument(src).promise.then(pdf => {
      return pdf.getPage(page + 1);
    }).then(page => {
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport });
      
      this.containerEl.innerHTML = '';
      this.containerEl.appendChild(canvas);
    });
  };
  document.head.appendChild(script);
}
```

#### 3. Admin (admin.html)

```html
<option value="pdf">PDF</option>

<script>
function updateContentType() {
  // ... code existant ...
  document.getElementById('pdfGroup').style.display = 
    type === 'pdf' ? 'flex' : 'none';
}
</script>

<!-- Ajouter dans le form -->
<div class="form-group" id="pdfGroup" style="display: none;">
  <label>URL du PDF</label>
  <input type="text" id="pdfUrl" placeholder="/assets/document.pdf" />
  <label>Page (0-indexed)</label>
  <input type="number" id="pdfPage" value="0" />
</div>
```

---

## Intégration avec un système OSC

### OSC (Open Sound Control) pour synchronisation avec la musique/lumières

#### Installation

```bash
npm install osc
```

#### Server (index.js)

```javascript
import * as osc from 'osc';
import dgram from 'dgram';

// Créer un serveur OSC
const oscServer = osc.udp.server({
  localAddress: '0.0.0.0',
  localPort: 9000,
});

oscServer.on('message', (msg) => {
  console.log('OSC reçu:', msg.address, msg.args);
  
  // Exemples:
  // /spectacle/scene 1 → Déclencher scène 1
  // /spectacle/color 255 0 0 → Envoyer couleur rouge
  
  if (msg.address === '/spectacle/scene') {
    const sceneId = msg.args[0].value;
    triggerScene(sceneId);
  }
  
  if (msg.address === '/spectacle/color') {
    const r = msg.args[0].value;
    const g = msg.args[1].value;
    const b = msg.args[2].value;
    const hex = rgbToHex(r, g, b);
    
    io.emit('content-update', {
      type: 'color',
      value: hex,
      timestamp: Date.now(),
    });
  }
});

oscServer.listen();
console.log('✓ OSC server listening on port 9000');

function rgbToHex(r, g, b) {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
```

#### Depuis un système de contrôle (Max/MSP, Pure Data, etc)

```
/spectacle/scene 1
/spectacle/color 255 100 50
```

---

## Timeline et séquençage

### Exécuter une séquence de scènes

```javascript
// server/routes/timeline.js

export class Timeline {
  constructor(io) {
    this.io = io;
    this.currentIndex = 0;
    this.scenes = [];
    this.playing = false;
  }

  addScene(sceneId, duration) {
    this.scenes.push({ sceneId, duration });
  }

  play() {
    if (this.playing) return;
    this.playing = true;
    this.currentIndex = 0;
    this.playNext();
  }

  playNext() {
    if (!this.playing || this.currentIndex >= this.scenes.length) {
      this.playing = false;
      return;
    }

    const { sceneId, duration } = this.scenes[this.currentIndex];
    this.io.emit('scene-trigger', { sceneId });

    console.log(`📺 Playing: ${sceneId} (${duration}ms)`);

    setTimeout(() => {
      this.currentIndex++;
      this.playNext();
    }, duration);
  }

  stop() {
    this.playing = false;
    this.currentIndex = 0;
  }
}
```

### Utilisation

```javascript
// server/index.js
import { Timeline } from './routes/timeline.js';

const timeline = new Timeline(io);

// Construire une timeline
timeline.addScene('scene_opening', 5000);     // 5s
timeline.addScene('scene_transition_blue', 8080); // 3s
timeline.addScene('scene_red_alert', 10000);  // 10s

app.post('/api/timeline/play', (req, res) => {
  timeline.play();
  res.json({ success: true });
});

app.post('/api/timeline/stop', (req, res) => {
  timeline.stop();
  res.json({ success: true });
});
```

---

## Monitoring avancé

### Dashboard en temps réel

```javascript
// server/index.js - Ajouter une route de monitoring

app.get('/api/monitor', (req, res) => {
  const devices = Object.values(devicesState);
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  const stats = {
    timestamp: Date.now(),
    uptime: Math.floor(uptime),
    devices: {
      total: devices.length,
      connected: devices.filter(d => d.connected).length,
      disconnected: devices.filter(d => !d.connected).length,
      list: devices.map(d => ({
        id: d.id,
        label: d.label,
        connected: d.connected,
        lastUpdate: d.lastUpdate,
        lastContent: d.lastContent ? d.lastContent.type : null
      }))
    },
    server: {
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB'
      },
      socketConnections: io.sockets.sockets.size
    }
  };
  
  res.json(stats);
});
```

### Monitoring page

```html
<!-- server/public/monitor.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Monitor</title>
  <style>
    body { font-family: monospace; background: #000; color: #0f0; }
    .stat { margin: 10px 0; }
    .connected { color: #0f0; }
    .disconnected { color: #f00; }
  </style>
</head>
<body>
  <h1>📊 Système Monitor</h1>
  <div id="stats"></div>
  
  <script>
    async function refresh() {
      const res = await fetch('/api/monitor');
      const stats = await res.json();
      
      let html = `
        <div class="stat">⏱ Uptime: ${stats.uptime}s</div>
        <div class="stat">📱 Devices: ${stats.devices.connected}/${stats.devices.total} connectés</div>
      `;
      
      stats.devices.list.forEach(d => {
        const status = d.connected ? 'connected' : 'disconnected';
        html += `
          <div class="stat ${status}">
            Device ${d.id}: ${d.label} ${d.connected ? '✓' : '✗'}
            (${d.lastContent || 'none'})
          </div>
        `;
      });
      
      document.getElementById('stats').innerHTML = html;
    }
    
    refresh();
    setInterval(refresh, 1000);
  </script>
</body>
</html>
```

---

## Contrôle via clavier (pour spectacles)

```javascript
// public/display.html - Ajouter pour contrôle au clavier

document.addEventListener('keydown', (e) => {
  // Raccourcis clavier pour commandes rapides
  
  if (e.key === '1') {
    // Scène 1
    fetch('/api/scene/scene_opening', { method: 'POST' });
  } else if (e.key === '2') {
    // Scène 2
    fetch('/api/scene/scene_transition_blue', { method: 'POST' });
  } else if (e.key === ' ') {
    // Fallback
    fetch('/api/all/fallback', { method: 'POST' });
  }
});
```

---

## WebHook pour intégration externe

```javascript
// server/index.js

// Webhook pour recevoir des commandes d'un système externe
app.post('/api/webhook', (req, res) => {
  const { action, data } = req.body;
  
  switch (action) {
    case 'trigger-scene':
      triggerScene(data.sceneId);
      res.json({ success: true });
      break;
    case 'send-content':
      // Envoyer du contenu personnalisé
      io.to(`display-${data.deviceId}`).emit('content-update', data.content);
      res.json({ success: true });
      break;
    default:
      res.status(400).json({ error: 'Unknown action' });
  }
});
```

### Appeler depuis un système externe

```bash
curl -X POST http://localhost:8080/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "trigger-scene",
    "data": { "sceneId": "scene_opening" }
  }'
```

---

## Enregistrement et replay

```javascript
// server/routes/recorder.js

export class EventRecorder {
  constructor() {
    this.recording = false;
    this.events = [];
    this.startTime = 0;
  }

  startRecording() {
    this.recording = true;
    this.events = [];
    this.startTime = Date.now();
  }

  recordEvent(type, data) {
    if (!this.recording) return;
    
    this.events.push({
      time: Date.now() - this.startTime,
      type,
      data
    });
  }

  stopRecording() {
    this.recording = false;
    return this.events;
  }

  replay(io) {
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex >= this.events.length) return;
      
      const { time, type, data } = this.events[currentIndex];
      
      setTimeout(() => {
        io.emit(type, data);
        currentIndex++;
        playNext();
      }, time - (this.events[currentIndex - 1]?.time || 0));
    };
    
    playNext();
  }
}
```

---

**Happy extending! 🚀**
