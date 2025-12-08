# 🔧 Guide de développement

Guide technique complet pour étendre et maintenir le système.

## 📋 Architecture globale

```
┌─────────────────────────────────────────────────────┐
│              SERVEUR (Node.js + Express)            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ Express Server                               │   │
│  │ - REST API (/api/*)                          │   │
│  │ - Fichiers statiques (/public/*)             │   │
│  └──────────────────────────────────────────────┘   │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ Socket.IO Server                             │   │
│  │ - Communication temps réel                   │   │
│  │ - Gestion des devices                        │   │
│  │ - Broadcast des scènes                       │   │
│  └──────────────────────────────────────────────┘   │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ State Management                             │   │
│  │ - devicesState: État de chaque device        │   │
│  │ - lastContent: Dernier contenu par device    │   │
│  │ - sessionId: ID Socket de chaque device      │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
         ↓                           ↓
    ┌────────────┐           ┌──────────────┐
    │ iPad 1     │           │ PC Admin     │
    │/display/1  │           │/admin        │
    │   (WS)     │           │   (WS)       │
    └────────────┘           └──────────────┘
```

## 🎯 Modules clés

### 1. `server/index.js` - Serveur principal

**Responsabilités:**
- Initialisation Express et Socket.IO
- REST API routing
- WebSocket event handling
- State management

**Points d'extension:**
- Ajouter des routes POST/GET dans la section "REST API ROUTES"
- Ajouter des events Socket.IO dans la section "WEBSOCKET HANDLERS"

**Exemple - Ajouter une route:**

```javascript
// Après la route /api/content/:deviceId/fallback
app.post('/api/custom-action', (req, res) => {
  const { data } = req.body;
  console.log('Action personnalisée:', data);
  
  // Faire quelque chose...
  io.emit('custom-event', { data });
  
  res.json({ success: true });
});
```

### 2. `server/config.js` - Configuration

Regroupe tous les paramètres pour éviter de les parser dans le code.

**À modifier pour:**
- Changer les ports ou hosts
- Modifier les timeouts
- Ajouter/retirer des assets

### 3. `public/display.html` - Client iPad

**Classe `DisplayClient`:**
- Gestion de la connexion WebSocket
- Affichage du contenu (image, vidéo, couleur, texte)
- Gestion du fallback avec timeout
- Fullscreen sur iOS

**Workflow:**
1. Connexion au serveur avec device ID
2. Écoute des événements `content-update`
3. Affichage dynamique du contenu
4. Timeout fallback si rien reçu pendant 30s

**Points d'extension:**
- Ajouter un nouveau type de contenu:

```javascript
// Dans onContentUpdate()
case 'animation':
  this.playAnimation(data.src);
  break;

// Nouvelle méthode
playAnimation(src) {
  const canvas = document.createElement('canvas');
  // Votre logique d'animation
  this.containerEl.appendChild(canvas);
}
```

### 4. `public/admin.html` - Panel admin

**Fonctionnalités:**
- Affichage liste devices
- Déclenchement scènes
- Envoi contenu personnalisé
- Aperçu en temps réel

**État global:**
```javascript
let state = {
  devices: {},              // État des devices du serveur
  scenes: [],               // Liste des scènes
  selectedDeviceIds: Set(), // Devices sélectionnés
  currentContent: {},       // Contenu édité
};
```

**Points d'extension:**
- Ajouter des widgets personnalisés:

```javascript
function sendRainbowContent() {
  const colors = ['#ff0000', '#00ff00', '#0000ff'];
  const deviceId = Array.from(state.selectedDeviceIds)[0];
  
  if (deviceId) {
    fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceIds: [deviceId],
        content: { type: 'color', value: colors[Math.floor(Math.random() * colors.length)] }
      })
    });
  }
}
```

### 5. `public/sw.js` - Service Worker

**Gère:**
- Cache des assets
- Fallback lors de perte réseau
- Stratégie "cache-first" pour images/vidéos

**Stratégies de cache:**
- `CACHE_ONLY`: Utiliser le cache uniquement
- `NETWORK_ONLY`: Réseau uniquement (pas de cache)
- `STALE_WHILE_REVALIDATE`: Cache d'abord, puis mise à jour en arrière-plan
- `CACHE_FIRST` (actuelle): Cache d'abord, réseau en fallback

**Modifier la stratégie:**

```javascript
// Changer à NETWORK_FIRST
return fetch(event.request)
  .then((response) => {
    // Mettre en cache
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(event.request, response.clone());
    });
    return response;
  })
  .catch(() => {
    // Fallback au cache
    return caches.match(event.request);
  });
```

## 🔄 Flux de données

### Envoi d'une scène

```
Admin Panel
    ↓
    POST /api/scene/scene_id
    ↓
    Server loads JSON
    ↓
    For each device in scene:
      - Update devicesState[deviceId].lastContent
      - Emit 'content-update' via Socket.IO to display-{deviceId} room
    ↓
    iPad receives 'content-update'
    ↓
    Display new content
```

### Reconnexion d'un iPad

```
iPad reconnects
    ↓
    Socket.io event 'connect'
    ↓
    Server receives connection with deviceId
    ↓
    Server updates devicesState[deviceId].connected = true
    ↓
    Server emits 'content-update' with lastContent if available
    ↓
    iPad receives and displays content
    ↓
    Admin is notified via 'device-status-update'
```

## 🧪 Testing

### Test manuel d'une route API

```bash
# Récupérer les devices
curl http://localhost:5173/api/devices

# Récupérer les scènes
curl http://localhost:5173/api/scenes

# Déclencher une scène
curl -X POST http://localhost:5173/api/scene/scene_opening

# Envoyer du contenu
curl -X POST http://localhost:5173/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "deviceIds": [1],
    "content": {"type": "color", "value": "#ff0000"}
  }'
```

### Test WebSocket

```bash
# Installer wscat
npm install -g wscat

# Se connecter comme device
wscat -c "ws://localhost:5173?deviceId=1"

# Maintenant vous pouvez émettre des événements
> {"emit": "ping"}
```

## 📊 Monitoring

### Logs serveur

Activez les logs en mode dev:

```bash
DEBUG=true npm run dev
```

### Logs client (iPad)

Ouvrez les DevTools sur l'iPad:
- **Safari**: Menu Développement → Afficher la console Web
- Consultez les erreurs et la connexion WebSocket

### Vérifier les connexions actives

```bash
# Sur le serveur, ajouter à index.js
app.get('/api/debug/connections', (req, res) => {
  const activeSockets = [];
  io.sockets.sockets.forEach((socket) => {
    activeSockets.push({
      id: socket.id,
      deviceId: socket.handshake.query.deviceId,
      rooms: Array.from(socket.rooms),
    });
  });
  res.json(activeSockets);
});
```

## 🛠️ Modifications courantes

### Ajouter un nouveau device

1. **Éditer `server/devices.json`:**

```json
{
  "devices": [
    { "id": 1, "label": "iPad Gauche" },
    { "id": 4, "label": "iPad Nouveau" }
  ]
}
```

2. **Redémarrer le serveur**

3. **Accéder sur l'iPad:** http://votre-ip:5173/display/4

### Ajouter une scène

1. **Créer `server/scenes/ma_scene.json`:**

```json
{
  "id": "ma_scene",
  "label": "Ma Scène",
  "devices": {
    "1": { "type": "color", "value": "#000000" }
  }
}
```

2. **Actualiser le panel admin** (ou redémarrer)

### Ajouter un asset (image/vidéo)

1. **Placer le fichier dans `server/public/assets/`**

2. **Créer une scène qui l'utilise:**

```json
{
  "id": "scene_with_image",
  "label": "Avec Image",
  "devices": {
    "1": {
      "type": "image",
      "src": "/assets/mon-image.jpg"
    }
  }
}
```

3. **Ou l'envoyer via l'admin panel**

### Modifier le timeout fallback

Dans `server/config.js`:

```javascript
export const config = {
  // ...
  FALLBACK_TIMEOUT: 51730, // Augmenter à 60 secondes
};
```

Et dans `public/display.html`:

```javascript
this.FALLBACK_TIMEOUT = 51730; // Doit correspondre
```

## 🔐 Ajouter une authentification

Exemple simple avec token:

```javascript
// server/index.js - Avant la déclaration d'Express
const ADMIN_TOKEN = 'my-secret-token-123';

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Appliquer au routes sensibles
app.post('/api/scene/:sceneId', authenticateToken, (req, res) => {
  // ...
});

app.post('/api/content', authenticateToken, (req, res) => {
  // ...
});
```

Depuis l'admin, ajouter le header:

```javascript
const token = prompt('Entrez le token:');
fetch('/api/content', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* ... */ })
});
```

## 📦 Déploiement custom

### Docker

Créer `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5173
CMD ["npm", "start"]
```

```bash
docker build -t ipad-spectacle .
docker run -p 5173:5173 ipad-spectacle
```

### Systemd (Linux)

Créer `/etc/systemd/system/spectacle.service`:

```ini
[Unit]
Description=iPad Show Control
After=network.target

[Service]
Type=simple
User=spectacle
WorkingDirectory=/opt/spectacle
ExecStart=/usr/bin/node server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable spectacle
sudo systemctl start spectacle
```

## 🚀 Performance

### Optimisations recommandées

1. **Compresser les images**
   ```bash
   # macOS avec imagemagick
   convert image.jpg -quality 85 -resize 1920x1080 image-optimized.jpg
   ```

2. **Pré-charger les assets**
   ```javascript
   // Dans display.html
   const preload = ['image1.jpg', 'image2.jpg'];
   preload.forEach(src => {
     const img = new Image();
     img.src = `/assets/${src}`;
   });
   ```

3. **Utiliser gzip**
   ```javascript
   // server/index.js
   import compression from 'compression';
   app.use(compression());
   ```

4. **Limiter la taille des payloads**
   ```javascript
   app.use(express.json({ limit: '50mb' }));
   ```

## 📝 Checklist de déploiement

- [ ] Changer les IDs des devices si nécessaire
- [ ] Tester toutes les scènes sur le matériel réel
- [ ] Configurer les timeouts pour votre contexte
- [ ] Ajouter une authentification si sur internet
- [ ] Configurer les CORS si nécessaire
- [ ] Mettre en place les logs/monitoring
- [ ] Tester la reconnexion des iPads
- [ ] Vérifier le fallback fonctionne
- [ ] Optimiser les images/vidéos
- [ ] Documenter les scènes personnalisées

---

**Happy coding! 🚀**
