# 🔌 API Reference

Documentation complète des endpoints REST et WebSocket.

## Base URL

```
http://localhost:8080
```

ou

```
http://votre-ip:8080
```

---

## 📊 REST API

### Devices

#### `GET /api/devices`

Retourne l'état de tous les devices connectés au serveur.

**Response:**

```json
{
  "1": {
    "id": 1,
    "label": "iPad Gauche",
    "description": "Écran gauche de la scène",
    "connected": true,
    "lastContent": {
      "type": "color",
      "value": "#0052a3"
    },
    "lastUpdate": 1701604200000,
    "sessionId": "socket-id-123"
  },
  "2": {
    "id": 2,
    "label": "iPad Centre",
    "connected": false,
    "lastContent": null,
    "lastUpdate": null,
    "sessionId": null
  }
}
```

**Exemple cURL:**

```bash
curl http://localhost:8080/api/devices | jq
```

---

### Scènes

#### `GET /api/scenes`

Retourne la liste de toutes les scènes disponibles.

**Response:**

```json
[
  {
    "id": "scene_opening",
    "label": "Ouverture du spectacle",
    "description": "Scène d'ouverture",
    "devices": {
      "1": { "type": "text", "value": "🎬\nSpectacle" },
      "2": { "type": "color", "value": "#1a1a1a" },
      "3": { "type": "text", "value": "▶\nCommence" }
    }
  },
  {
    "id": "scene_transition_blue",
    "label": "Transition Bleue",
    "devices": {
      "1": { "type": "color", "value": "#0052a3" },
      "2": { "type": "color", "value": "#0052a3" },
      "3": { "type": "color", "value": "#0052a3" }
    }
  }
]
```

**Exemple cURL:**

```bash
curl http://localhost:8080/api/scenes | jq
```

---

#### `POST /api/scene/:sceneId`

Déclenche une scène complète. Envoie le contenu de chaque device défini dans la scène.

**Parameters:**

- `sceneId` (string, required): ID de la scène (ex: `scene_opening`)

**Request:**

```bash
curl -X POST http://localhost:8080/api/scene/scene_opening
```

**Response:**

```json
{
  "success": true,
  "scene": {
    "id": "scene_opening",
    "label": "Ouverture du spectacle",
    "devices": { ... }
  }
}
```

**Comportement:**

1. Charge le fichier JSON de la scène
2. Valide chaque device défini
3. Envoie le contenu via WebSocket à chaque device
4. Met à jour `devicesState[deviceId].lastContent`
5. Valide que la scène existe (404 sinon)

---

### Contenu personnalisé

#### `POST /api/content`

Envoie du contenu personnalisé à des devices spécifiques.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "deviceIds": [1, 2],
  "content": {
    "type": "image",
    "src": "/assets/custom.png"
  }
}
```

**Parameters:**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `deviceIds` | array[int] | IDs des devices cibles (ex: `[1]` ou `[1, 2]`) |
| `content.type` | string | Type de contenu: `image`, `video`, `color`, `text` |
| `content.src` | string | (image/video) URL du fichier |
| `content.value` | string | (color) Code hex (ex: `#ff0000`), (text) Texte à afficher |
| `content.duration` | int | (optionnel, video) Durée en ms |

**Response:**

```json
{
  "success": true
}
```

**Exemple - Envoyer une image:**

```bash
curl -X POST http://localhost:8080/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "deviceIds": [1],
    "content": {
      "type": "image",
      "src": "/assets/image1.jpg"
    }
  }'
```

**Exemple - Envoyer du texte à tous les devices:**

```bash
curl -X POST http://localhost:8080/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "deviceIds": [1, 2, 3],
    "content": {
      "type": "text",
      "value": "Acte 2 - Commencer!"
    }
  }'
```

**Exemple - Envoyer une couleur:**

```bash
curl -X POST http://localhost:8080/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "deviceIds": [2],
    "content": {
      "type": "color",
      "value": "#ff0000"
    }
  }'
```

---

### Fallback

#### `POST /api/content/:deviceId/fallback`

Force le fallback (image de secours) sur un device spécifique.

**Parameters:**

- `deviceId` (int, required): ID du device

**Request:**

```bash
curl -X POST http://localhost:8080/api/content/1/fallback
```

**Response:**

```json
{
  "success": true
}
```

**Comportement:**

1. Réinitialise `devicesState[deviceId].lastContent`
2. Réinitialise `devicesState[deviceId].lastUpdate`
3. Envoie l'événement `fallback` au device via WebSocket
4. Le client affiche l'image `/assets/fallback.svg` ou `/assets/fallback.svg`

---

#### `POST /api/all/fallback`

Force le fallback sur **TOUS** les devices.

**Request:**

```bash
curl -X POST http://localhost:8080/api/all/fallback
```

**Response:**

```json
{
  "success": true
}
```

**Comportement:**

Identique à `/api/content/:deviceId/fallback` mais pour tous les devices.

---

## 🔌 WebSocket (Socket.IO)

Les clients iPad se connectent via WebSocket automatiquement.

### Connexion client

```javascript
// Dans public/display.html, le client se connecte automatiquement
const socket = io(window.location.origin, {
  query: { deviceId: 1 },
  reconnection: true,
  transports: ['websocket', 'polling'],
});
```

### Événements serveur → client

#### `content-update`

Envoyé quand le serveur veut mettre à jour le contenu d'un device.

**Data:**

```javascript
{
  type: 'image',           // 'image', 'video', 'color', 'text'
  src: '/assets/image.png', // (image/video) URL du fichier
  value: '#ff0000',        // (color/text) Valeur
  duration: null,          // (video) Durée en ms (optionnel)
  timestamp: 1701604200000 // Timestamp serveur
}
```

**Exemple:**

```javascript
socket.on('content-update', (data) => {
  console.log('Nouveau contenu:', data);
  // Le client affiche le contenu
});
```

---

#### `fallback`

Sent quand le serveur demande l'affichage du fallback.

**Example:**

```javascript
socket.on('fallback', () => {
  console.log('Afficher le fallback');
  displayImage('/assets/fallback.svg');
});
```

---

#### `pong`

Réponse à un `ping` du client (pour vérifier la connexion).

**Example:**

```javascript
socket.on('pong', () => {
  console.log('Connexion active ✓');
});
```

---

### Événements client → serveur

#### `ping`

Le client envoie pour vérifier que le serveur est connecté.

**Example:**

```javascript
socket.emit('ping');
// Le serveur répond avec 'pong'
```

---

## 🔑 Authentication (Optionnel)

Le système est ouvert par défaut. Pour ajouter une authentification:

### Exemple avec Bearer Token

**Server:**

```javascript
// server/index.js
const ADMIN_TOKEN = 'my-secret-token-123';

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Appliquer au routes sensibles
app.post('/api/scene/:sceneId', authenticateToken, (req, res) => { ... });
app.post('/api/content', authenticateToken, (req, res) => { ... });
```

**Client:**

```javascript
// admin.html
async function sendToSelected() {
  const token = 'my-secret-token-123';
  
  const res = await fetch('/api/content', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      deviceIds: Array.from(state.selectedDeviceIds),
      content: state.currentContent
    })
  });
}
```

---

## ⚙️ Status Codes

| Code | Signification |
|------|---------------|
| `200` | OK - Requête réussie |
| `201` | Created - Ressource créée |
| `400` | Bad Request - Paramètres invalides |
| `401` | Unauthorized - Token invalide ou manquant |
| `404` | Not Found - Scène ou device non trouvé |
| `500` | Internal Server Error - Erreur serveur |

---

## 📈 Rate Limiting (Optionnel)

Pour éviter les abus, ajouter un rate limiter:

```bash
npm install express-rate-limit
```

```javascript
// server/index.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requêtes par IP
});

app.use('/api/', limiter);
```

---

## 🧪 Testing

### Avec curl

```bash
# Lister les devices
curl http://localhost:8080/api/devices | jq

# Lister les scènes
curl http://localhost:8080/api/scenes | jq '.[] | {id, label}'

# Déclencher une scène
curl -X POST http://localhost:8080/api/scene/scene_opening

# Envoyer du contenu
curl -X POST http://localhost:8080/api/content \
  -H "Content-Type: application/json" \
  -d '{"deviceIds":[1],"content":{"type":"color","value":"#ff0000"}}'
```

### Avec Python

```python
import requests

# Déclencher une scène
response = requests.post('http://localhost:8080/api/scene/scene_opening')
print(response.json())

# Envoyer du contenu
payload = {
  'deviceIds': [1, 2],
  'content': {
    'type': 'text',
    'value': 'Bonjour!'
  }
}
requests.post('http://localhost:8080/api/content', json=payload)
```

### Avec JavaScript (Fetch)

```javascript
// Récupérer les devices
fetch('/api/devices')
  .then(r => r.json())
  .then(devices => console.log(devices))

// Déclencher une scène
fetch('/api/scene/scene_opening', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## 📋 Checklist d'intégration

- [ ] GET /api/devices teste et retourne les états
- [ ] GET /api/scenes teste et retourne les scènes
- [ ] POST /api/scene/:sceneId fonctionne
- [ ] POST /api/content envoie du contenu
- [ ] POST /api/content/:deviceId/fallback force le fallback
- [ ] WebSocket se connecte automatiquement
- [ ] Reconnexion fonctionne après déconnexion
- [ ] Service Worker cache les assets
- [ ] Fallback s'affiche après 30s d'inactivité

---

**Happy API! 🚀**
