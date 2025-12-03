# 🎬 iPad Show Control

Système complet de contrôle d'iPads pour spectacles en temps réel. Tous les iPads peuvent afficher des contenus contrôlés depuis un PC central, avec fallback automatique en cas de déconnexion.

## 🎯 Caractéristiques

- ✅ **WebSocket temps réel** - Communication instantanée entre serveur et iPads
- ✅ **Scènes préprogrammées** - Déclenchez des configurations complexes en un clic
- ✅ **Contenu personnalisé** - Envoyez des images, vidéos, couleurs ou texte à chaque iPad
- ✅ **Fallback automatique** - Image de secours affichée en cas de perte de connexion
- ✅ **Service Worker** - Cache local pour résilience maximale
- ✅ **Admin panel** - Interface élégante pour gérer tous les devices
- ✅ **Extensible** - Structure modulaire facile à adapter

## 📁 Structure du projet

```
/
├── server/
│   ├── index.js              # Serveur principal (Express + Socket.IO)
│   ├── config.js             # Configuration centralisée
│   ├── devices.json          # Configuration des devices
│   ├── scenes/               # Scènes JSON préprogrammées
│   │   ├── scene_opening.json
│   │   ├── scene_transition_blue.json
│   │   └── ...
│   ├── assets/               # Images, vidéos (à remplir)
│   └── public/               # Fichiers statiques servés
│       ├── index.html        # Page d'accueil
│       ├── display.html      # Page iPad
│       ├── admin.html        # Panel admin
│       ├── sw.js             # Service Worker
│       └── assets/           # Assets publics
│           └── fallback.svg  # Image de fallback
├── package.json              # Dépendances Node.js
└── README.md                 # Ce fichier
```

## 🚀 Installation et démarrage

### Prérequis

- Node.js 16+ (https://nodejs.org)
- npm (inclus avec Node.js)

### Étapes

1. **Installer les dépendances**

```bash
npm install
```

2. **Démarrer le serveur**

```bash
npm start
```

Le serveur démarre sur `http://localhost:8080`

3. **Mode développement** (avec auto-reload)

```bash
npm run dev
```

## 📱 Utilisation

### Sur votre PC (Admin Panel)

Accédez à: **http://localhost:8080/admin**

Vous pouvez:
- Voir l'état de tous les devices (connecté/déconnecté)
- Déclencher des scènes préprogrammées
- Envoyer du contenu personnalisé à des devices spécifiques
- Forcer le fallback sur tous les devices

### Sur les iPads (Display)

Accédez à:
- **iPad 1**: http://votre-pc:8080/display/1
- **iPad 2**: http://votre-pc:8080/display/2
- **iPad 3**: http://votre-pc:8080/display/3

Les iPads se mettent automatiquement en plein écran et affichent le contenu reçu du serveur.

### Page d'accueil

Accédez à: **http://localhost:8080** pour voir les accès rapides

## ⚙️ Configuration

### Ajouter/modifier les devices

Éditez `server/devices.json`:

```json
{
  "devices": [
    { "id": 1, "label": "iPad Gauche" },
    { "id": 2, "label": "iPad Centre" },
    { "id": 3, "label": "iPad Droite" },
    { "id": 4, "label": "iPad Supplémentaire" }
  ]
}
```

### Timeout et timeouts

Dans `server/config.js`:

```javascript
export const config = {
  PORT: 8080,                    // Port du serveur
  PING_INTERVAL: 5000,           // Ping toutes les 5s
  CONNECTION_TIMEOUT: 80800,     // Timeout connexion après 30s
  FALLBACK_TIMEOUT: 80800,       // Fallback après 30s d'inactivité
};
```

## 📝 Format des scènes

Une scène est un fichier JSON dans `server/scenes/`:

```json
{
  "id": "ma_scene",
  "label": "Ma Scène",
  "description": "Description optionnelle",
  "devices": {
    "1": {
      "type": "image",
      "src": "/assets/image1.png"
    },
    "2": {
      "type": "video",
      "src": "/assets/video.mp4",
      "duration": 10000
    },
    "3": {
      "type": "color",
      "value": "#ff0000"
    }
  }
}
```

### Types de contenu supportés

| Type | Propriétés | Exemple |
|------|-----------|---------|
| `image` | `src` | `{ "type": "image", "src": "/assets/bg.png" }` |
| `video` | `src`, `duration` (optionnel) | `{ "type": "video", "src": "/assets/video.mp4" }` |
| `color` | `value` (hex) | `{ "type": "color", "value": "#0052a3" }` |
| `text` | `value` | `{ "type": "text", "value": "Bonjour!" }` |

## 🔌 API REST

### Devices

```http
GET /api/devices
```

Retourne l'état de tous les devices.

### Scènes

```http
GET /api/scenes
```

Retourne la liste de toutes les scènes disponibles.

```http
POST /api/scene/:sceneId
```

Déclenche une scène pour tous les devices associés.

### Contenu personnalisé

```http
POST /api/content
Content-Type: application/json

{
  "deviceIds": [1, 2],
  "content": {
    "type": "image",
    "src": "/assets/custom.png"
  }
}
```

Envoie du contenu personnalisé à des devices spécifiques.

### Fallback

```http
POST /api/content/:deviceId/fallback
```

Force le fallback pour un device spécifique.

```http
POST /api/all/fallback
```

Force le fallback pour tous les devices.

## 🔄 Communication WebSocket

Les clients iPad se connectent automatiquement au serveur via Socket.IO.

### Événements serveur → client

- `content-update` - Mise à jour du contenu
- `fallback` - Forcer l'affichage du fallback
- `pong` - Réponse au ping

### Événements client → serveur

- `ping` - Vérifier la connexion

## 💾 Cache et persistance

Le **Service Worker** (`public/sw.js`) gère:
- Cache des assets statiques
- Fallback lors de perte réseau
- Préchargement des images fréquemment utilisées

Pour forcer une mise à jour du cache, modifiez `CACHE_NAME` dans `sw.js`:

```javascript
const CACHE_NAME = 'ipad-display-v2'; // Incrémentez la version
```

## 🛡️ Résilience et fallback

Le système implémente plusieurs niveaux de résilience:

1. **WebSocket avec reconnexion automatique** - Le client tente de se reconnecter automatiquement
2. **Timeout fallback** (30s) - Si aucun contenu n'est reçu pendant 30s, affiche le fallback
3. **Fallback image locale** - Stockée en cache via Service Worker
4. **Synchronisation à la reconnexion** - Les iPads récupèrent le dernier contenu envoyé après reconnexion

## 📤 Déploiement

### Sur un réseau local

1. Trouvez l'IP de votre PC:
   - **macOS**: `ifconfig | grep "inet "`
   - **Windows**: `ipconfig`
   - **Linux**: `ip addr`

2. Sur les iPads, accédez à `http://votre-ip:8080/display/1` etc.

### Production

Pour déployer en production:

1. Installez PM2 (process manager):
   ```bash
   npm install -g pm2
   ```

2. Lancez avec PM2:
   ```bash
   pm2 start server/index.js --name "spectacle"
   ```

3. Configurez nginx ou un reverse proxy pour HTTPS si nécessaire.

## 🎨 Personnalisation

### Ajouter des scènes

1. Créez un fichier `server/scenes/ma_scene.json`
2. Définissez la structure selon le format JSON
3. Les scènes se rechargent automatiquement

### Modifier le style du display

Éditez les CSS dans `public/display.html` section `<style>`.

### Modifier le panel admin

Éditez `public/admin.html` pour personnaliser l'interface.

## 🐛 Dépannage

### Les iPads ne se connectent pas

1. Vérifiez que le PC et les iPads sont sur le même réseau
2. Testez: `ping votre-ip-pc` depuis l'iPad
3. Vérifiez que le port 8080 n'est pas bloqué par le firewall
4. Essayez `npm run dev` et vérifiez les logs

### WebSocket n'établit pas la connexion

1. Vérifiez le protocol (ws vs wss)
2. Les navigateurs iOS récents peuvent nécessiter HTTPS
3. Testez avec `curl` depuis le PC:
   ```bash
   curl http://localhost:8080/api/devices
   ```

### Fallback ne s'affiche pas

1. Vérifiez que `/assets/fallback.svg` existe
2. Vérifiez les logs du Service Worker (DevTools → Application)
3. Forcez un rechargement du cache dans config.js

### Scènes ne se chargent pas

1. Vérifiez que les fichiers JSON sont dans `server/scenes/`
2. Testez: `curl http://localhost:8080/api/scenes`
3. Vérifiez la syntaxe JSON (utilisez un validateur online)

## 📚 Exemples d'utilisation

### Créer une scène avec images

```json
{
  "id": "scene_gallery",
  "label": "Galerie",
  "devices": {
    "1": { "type": "image", "src": "/assets/img1.jpg" },
    "2": { "type": "image", "src": "/assets/img2.jpg" },
    "3": { "type": "image", "src": "/assets/img3.jpg" }
  }
}
```

### Déclencher une scène depuis curl

```bash
curl -X POST http://localhost:8080/api/scene/scene_gallery
```

### Envoyer du contenu personnalisé

```bash
curl -X POST http://localhost:8080/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "deviceIds": [1, 2],
    "content": {
      "type": "text",
      "value": "Bienvenue!"
    }
  }'
```

## 🔐 Sécurité

⚠️ **Important**: Ce système est conçu pour un réseau local fermé (spectacle).

Pour utiliser en production ou sur internet:

1. Ajoutez une authentification (JWT, OAuth)
2. Utilisez HTTPS/WSS
3. Validez toutes les entrées (scènes, URLs)
4. Limitez les requêtes API (rate limiting)
5. Enregistrez les actions (audit logs)

Exemple d'ajout d'authentification:

```javascript
// server/index.js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!isValidToken(token)) {
    next(new Error('Unauthorized'));
  } else {
    next();
  }
});
```

## 📖 Extensions prévues

- 🔌 Intégration avec des systèmes d'éclairage (DMX, OSC)
- 📊 Dashboard de monitoring avancé
- 🔊 Synchronisation audio
- 🎨 Éditeur visuel de scènes
- 🌐 Support mobile admin (Android, iOS)
- 💾 Logs persistants et historique
- 🎬 Timeline de scènes automatisée

## 📞 Support

Pour des questions ou bugs, consultez:
- Les logs du serveur: `npm run dev`
- Les DevTools de l'iPad (Chrome ou Safari)
- La console du navigateur admin

---

**Bon spectacle! 🎭**
