# 🎬 iPad Show Control

Système complet de contrôle d'iPads pour spectacles en temps réel. Tous les iPads peuvent afficher des contenus contrôlés depuis un PC central, avec fallback automatique en cas de déconnexion.

## 🎯 Caractéristiques

### ⚡ Core Features
- ✅ **WebSocket temps réel** - Communication instantanée entre serveur et iPads
- ✅ **Scènes préprogrammées** - Déclenchez des configurations complexes en un clic
- ✅ **Contenu personnalisé** - Envoyez des images, vidéos, couleurs ou texte à chaque iPad
- ✅ **Fallback automatique** - Image de secours affichée en cas de perte de connexion
- ✅ **Service Worker** - Cache local pour résilience maximale
- ✅ **Extensible** - Structure modulaire facile à adapter

### 🚀 Advanced Features (NEW)
- ✅ **📊 Dashboard Monitoring** - Surveillance en temps réel des devices et timeline
- ✅ **📱 Mobile Admin** - Interface tactile optimisée pour smartphones/tablettes
- ✅ **✏️ Scene Editor** - Créer et éditer des scènes visuellement sans JSON
- ✅ **🎨 Scene Categorization** - Toutes les scènes organisées par catégorie
- ✅ **⌨️ Keyboard Shortcuts** - Raccourcis rapides (1-9, T, SPACE)
- ✅ **🧪 Test Sync** - Bouton pour tester la synchronisation automatiquement
 - ✅ **🔊 Audio Sync API** - REMOVED (audio synchronization functionality has been removed)
- ✅ **Admin Panel Enhanced** - Groupage par catégories et mise à jour en temps réel

## 📁 Structure du projet

```
/
├── server/
│   ├── index.js              # Serveur principal (Express + Socket.IO)
│   ├── config.js             # Configuration centralisée
│   ├── devices.json          # Configuration des devices
│   ├── scenes/               # Scènes JSON préprogrammées (13 scènes)
│   │   ├── scene_opening.json
│   │   ├── scene_transition_blue.json
│   │   ├── test_sync_red.json
│   │   ├── test_sync_green.json
│   │   ├── test_sync_blue.json
│   │   ├── test_sync_white.json
│   │   └── ...
│   ├── assets/               # Images, vidéos (à remplir)
│   └── public/               # Fichiers statiques servés
│       ├── index.html        # Page d'accueil avec liens
│       ├── display.html      # Page iPad (client display)
│       ├── admin.html        # Panel admin (catégories, raccourcis, test sync)
│       ├── mobile.html       # Admin mobile (NEW - interface tactile)
│       ├── dashboard.html    # Dashboard monitoring (NEW - stats temps réel)
│       ├── editor.html       # Scene editor (NEW - créer scènes visuellement)
│       ├── sw.js             # Service Worker
│       └── assets/           # Assets publics
│           └── fallback.svg  # Image de fallback
├── documentation/            # Documentation complète
│   ├── FEATURES_UPDATE.md    # Nouvelles fonctionnalités
│   ├── QUICK_REFERENCE.md    # Guide de référence rapide
│   └── IMPLEMENTATION_SUMMARY.md
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

### 🏠 Page d'accueil

Accédez à: **http://localhost:8080**

Vous trouverez des liens vers toutes les interfaces disponibles.

### 🎛️ Admin Panel (Desktop)

Accédez à: **http://localhost:8080/admin**

Fonctionnalités:
- ✅ Voir l'état de tous les devices (connecté/déconnecté)
- ✅ Scènes groupées par catégories
- ✅ Déclencher des scènes préprogrammées
- ✅ Envoyer du contenu personnalisé à des devices spécifiques
- ✅ Forcer le fallback sur tous les devices
- ✅ **Raccourcis clavier**: 1-9 (scènes), T (test sync), SPACE (fallback)

### 📱 Mobile Admin (NEW)

Accédez à: **http://localhost:8080/mobile** sur téléphone/tablette

Fonctionnalités:
- ✅ Interface tactile optimisée
- ✅ 3 tabs: Scenes, Devices, Control
- ✅ Déclenchement rapide de scènes
- ✅ Monitoring des devices
- ✅ Envoi de contenu personnalisé
- ✅ Bouton Emergency stop

### 📊 Dashboard Monitoring (NEW)

Accédez à: **http://localhost:8080/dashboard**

Fonctionnalités:
- ✅ Statistiques en temps réel (devices connectés, uptime, dernière scène)
- ✅ Timeline de connexion (60 secondes)
- ✅ Journal d'événements complet
- ✅ Export des données (JSON)
- ✅ Mise à jour automatique toutes les 5 secondes

### ✏️ Scene Editor (NEW)

Accédez à: **http://localhost:8080/editor**

Fonctionnalités:
- ✅ Créer de nouvelles scènes
- ✅ Éditer les scènes existantes
- ✅ Configurer le contenu par device
- ✅ Aperçu en temps réel
- ✅ Dupliquer/supprimer des scènes
- ✅ Exporter en JSON

### 📺 Sur les iPads (Display)

Accédez à:
- **iPad 1**: http://votre-pc:8080/display/1
- **iPad 2**: http://votre-pc:8080/display/2
- **iPad 3**: http://votre-pc:8080/display/3

Les iPads se mettent automatiquement en plein écran et affichent le contenu reçu du serveur.

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
  HOST: '0.0.0.0',              // Écoute sur toutes les interfaces
  PING_INTERVAL: 5000,           // Ping toutes les 5s
  FALLBACK_TIMEOUT: 30000,       // Fallback après 30s d'inactivité
};
```

## 📝 Format des scènes

Une scène est un fichier JSON dans `server/scenes/`. Toutes les scènes incluent maintenant un champ `category`:

```json
{
  "id": "ma_scene",
  "label": "Ma Scène",
  "category": "Contenu",
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

### Catégories disponibles

- `Début/Fin` - Scènes d'ouverture et fermeture
- `Contenu` - Images et vidéos
- `Transitions` - Effets de transition
- `Tests` - Tests de synchronisation
- `Autres` - Autres scènes

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

### 🔊 Audio Sync (NEW)

```http
POST /api/audio/sync
{
  "cueId": "cue_1",
  "startTime": timestamp,
  "duration": 30000
}
```

Synchronise l'audio sur tous les devices.

```http
POST /api/audio/cue
{
  "cueId": "cue_1",
  "deviceIds": ["1", "2", "3"],
  "audioUrl": "/assets/audio.mp3",
  "delay": 1000,
  "autoPlay": true
}
```

Envoie un cue audio à des devices spécifiques avec délai.

```http
POST /api/audio/stop
{
  "deviceIds": ["1", "2", "3"]
}
```

Arrête la lecture audio.

## 🔄 Communication WebSocket

Les clients iPad se connectent automatiquement au serveur via Socket.IO.

### Événements serveur → client

- `content-update` - Mise à jour du contenu
- `fallback` - Forcer l'affichage du fallback
- `pong` - Réponse au ping
- `audio-sync` - Synchronisation audio (NEW)
- `audio-cue` - Cue audio (NEW)
- `audio-stop` - Arrêt audio (NEW)

### Événements client → serveur

- `ping` - Vérifier la connexion
- `device-status-update` - Diffusé à tous les clients pour synchronisation (NEW)
- `scene-triggered` - Notifie le déclenchement d'une scène (NEW)

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
3. Vérifiez que le port 5173 n'est pas bloqué par le firewall
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

## 📖 Extensions possibles

- 🔌 Intégration avec des systèmes d'éclairage (DMX, OSC)
- 📹 Capture d'écran des displays (streaming)
- 💾 Logs persistants et historique
- 🎬 Timeline de scènes automatisée
- 🔐 Authentification utilisateur (JWT/OAuth)
- 📈 Statistiques et analytique avancée

## 📚 Documentation supplémentaire

Consultez les fichiers de documentation dans le dossier `/documentation`:

- **`FEATURES_UPDATE.md`** - Documentation complète des nouvelles fonctionnalités
- **`QUICK_REFERENCE.md`** - Guide de référence rapide (raccourcis, APIs, URLs)
- **`IMPLEMENTATION_SUMMARY.md`** - Résumé technique des implémentations

## ⌨️ Raccourcis Clavier (Admin Panel)

| Touche | Action |
|--------|--------|
| `1-9` | Déclenche les scènes 1-9 |
| `T` | Lance le test de synchronisation |
| `SPACE` | Fallback d'urgence (écran noir) |

## 🧪 Bouton Test Sync

Le bouton "🧪 Tester la synchronisation" déclenche automatiquement une séquence:
1. **Rouge** (2 secondes)
2. **Vert** (2 secondes)
3. **Bleu** (2 secondes)
4. **Blanc** (2 secondes)
5. **Noir** (2 secondes)

Utilisez ce test pour vérifier que tous les iPads sont synchronisés correctement.

## 📞 Support

Pour des questions ou bugs, consultez:
- Les logs du serveur: `npm run dev`
- Les DevTools de l'iPad (Chrome ou Safari)
- La console du navigateur admin
- La documentation dans `/documentation`

## 🎓 Tutoriels rapides

### Créer une nouvelle scène

1. Accédez à `http://localhost:8080/editor`
2. Cliquez sur "New Scene"
3. Remplissez les métadonnées (label, catégorie, description)
4. Sélectionnez les devices cibles
5. Choisissez le type de contenu (couleur, image, vidéo, texte)
6. Cliquez "Apply to Selected Devices"
7. Cliquez "Save"

### Tester une scène

1. Depuis l'Admin Panel: cliquez sur le bouton de la scène
2. Depuis le Mobile: tapez le bouton de la scène
3. Depuis le Dashboard: vérifiez les mises à jour en temps réel

### Utiliser les raccourcis clavier

- Appuyez sur **1** pour déclencher la 1ère scène
- Appuyez sur **T** pour lancer le test de sync
- Appuyez sur **SPACE** pour un fallback d'urgence

## 📄 Licence

À définir selon vos besoins.

---

**Bon spectacle! 🎭**
