# 📁 Structure du projet

```
ipad/
│
├── 📄 package.json                 # Configuration npm + dépendances
├── 📄 README.md                    # Documentation complète
├── 📄 QUICKSTART.md                # Guide de démarrage 5 min
├── 📄 DEVELOPMENT.md               # Guide de développement
├── 📄 API.md                       # Documentation API REST + WebSocket
├── 📄 STRUCTURE.md                 # Ce fichier
│
├── 🚀 install.sh                   # Script d'installation
├── 🔧 setup-assets.sh              # Helper pour gérer les assets
│
├── 📦 server/                      # Serveur Node.js
│   ├── 📄 index.js                 # ⭐ FICHIER PRINCIPAL - Serveur Express + Socket.IO
│   ├── 📄 config.js                # Configuration centralisée
│   ├── 📄 devices.json             # Configuration des devices (à personnaliser)
│   │
│   ├── 📂 scenes/                  # Scènes préprogrammées (JSON)
│   │   ├── 📄 scene_opening.json           # Ouverture
│   │   ├── 📄 scene_transition_blue.json   # Transition bleue
│   │   ├── 📄 scene_trio_images.json       # Trois images
│   │   ├── 📄 scene_red_alert.json         # Alerte rouge
│   │   ├── 📄 scene_black_screen.json      # Écran noir
│   │   ├── 📄 scene_white_screen.json      # Écran blanc
│   │   └── ... (ajouter vos scènes ici)
│   │
│   ├── 📂 assets/                  # Assets statiques (images, vidéos)
│   │   └── (À remplir avec vos fichiers)
│   │
│   └── 📂 public/                  # Fichiers servis au navigateur
│       ├── 📄 index.html           # Page d'accueil
│       ├── 📄 display.html         # ⭐ Page iPad (affichage + WebSocket)
│       ├── 📄 admin.html           # ⭐ Panel admin (contrôle)
│       ├── 📄 sw.js               # Service Worker (cache + fallback)
│       │
│       └── 📂 assets/              # Assets publics (fallback, etc)
│           ├── 📄 fallback.svg     # Image fallback (pas de signal)
│           └── 📄 fallback.svg     # Alternative PNG du fallback
│
├── 📱 client-display/              # (Optionnel) Client iPad standalone
│   └── (Futures extensions)
│
└── 👨‍💼 admin/                       # (Optionnel) Admin panel standalone
    └── (Futures extensions)
```

## 📝 Description des fichiers clés

### Serveur

| Fichier | Rôle | Modifications |
|---------|------|---------------|
| `server/index.js` | Cœur du système | Ajouter des routes, des WebSocket handlers |
| `server/config.js` | Paramètres globaux | Modifier timeouts, ports |
| `server/devices.json` | Devices connectés | Ajouter/retirer des iPads |

### Front-end

| Fichier | Rôle | Modifications |
|---------|------|---------------|
| `server/public/display.html` | Client iPad | Modifier l'UI, ajouter des types de contenu |
| `server/public/admin.html` | Panel de contrôle | Ajouter des boutons, des widgets |
| `server/public/sw.js` | Cache et résilience | Modifier la stratégie de cache |

### Scènes

| Fichier | Contenu |
|---------|---------|
| `server/scenes/*.json` | Chaque scène est un fichier JSON indépendant |

---

## 🔄 Flux de données

```
┌─────────────────────────────────────────────────────────┐
│ SERVEUR (Node.js)                                       │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Express API                                       │   │
│ │ POST /api/scene/:id  ──┐                          │   │
│ │ POST /api/content    ──┼─→ State Management      │   │
│ │ GET  /api/devices    ──┤   devicesState[id]      │   │
│ │                        │                          │   │
│ └───────────────────────┼──────────────────────────┘   │
│                         │                              │
│         ┌───────────────┘                              │
│         │                                              │
│ ┌───────▼────────────────────────────────────────┐    │
│ │ Socket.IO (Broadcast)                         │    │
│ │ - Display rooms (display-1, display-2, etc)  │    │
│ │ - Admin room                                  │    │
│ └───────┬────────────────────────────────────────┘    │
│         │                                              │
└─────────┼──────────────────────────────────────────────┘
          │
  ┌───────┴──────────┬──────────────────┐
  │                  │                  │
  ▼                  ▼                  ▼
iPad 1           iPad 2              PC Admin
/display/1      /display/2          /admin
(WS)            (WS)                (WS)
```

---

## 🎯 Workflow typique

### 1. Démarrage

```bash
npm install    # 1 fois
npm start      # À chaque utilisation
```

### 2. Configuration

```
devices.json   # Définir les iPads
scenes/*.json  # Créer les scènes
```

### 3. Utilisation

```
PC Browser: http://localhost:5173/admin
             ↓
            (Cliquer sur scène)
             ↓
            WebSocket broadcast
             ↓
             iPads affichent le contenu
```

### 4. Extension

```
Ajouter une route API
    ↓
Appeler depuis admin.html
    ↓
Le serveur broadcast aux iPads
    ↓
Affichage mis à jour
```

---

## 📊 Tailles et chiffres

| Élément | Taille |
|---------|--------|
| `package.json` + `node_modules/` | ~200 MB |
| Code serveur (`server/`) | ~20 KB |
| Code client (`public/`) | ~50 KB (minifié: ~15 KB) |
| Service Worker | ~5 KB |
| Scène JSON | ~200 bytes |

---

## 🔗 Connectivité

| Composant | Connecté via |
|-----------|-------------|
| iPad → Serveur | **WebSocket** (Socket.IO) |
| Serveur → iPad | **WebSocket** (Socket.IO) |
| Admin → Serveur | **HTTP REST** + **WebSocket** |
| iPad → Assets | **HTTP** (fichiers statiques) |

---

## 📈 Évolutivité

### Ajouter un nouveau type de contenu

**Format JSON:**
```json
{
  "type": "mon_type",
  "propriete1": "valeur1"
}
```

**Server (index.js):**
```javascript
// Aucun changement nécessaire (envoie juste les données)
```

**Client (display.html):**
```javascript
case 'mon_type':
  this.displayMonType(data.propriete1);
  break;
```

**Admin (admin.html):**
```html
<option value="mon_type">Mon Type</option>
```

---

## 🔐 Sécurité

### Niveau 0 (Défaut - Réseau local uniquement)
- Pas d'authentification
- Suitable pour: Spectacles privés, événements

### Niveau 1 (Token simple)
- Ajouter un Bearer token
- See: [DEVELOPMENT.md - Authentification](DEVELOPMENT.md#-ajouter-une-authentification)

### Niveau 2 (Production)
- HTTPS/WSS
- JWT ou OAuth
- Rate limiting
- Audit logs

---

## 🚀 Déploiement

### Local (développement)
```bash
npm start
# Accessible à http://localhost:5173
```

### LAN (spectacle)
```bash
npm start
# Accessible à http://192.168.x.x:5173 depuis les iPads
```

### Production (Internet)
```bash
# Voir DEVELOPMENT.md - Déploiement custom
# Docker, Systemd, ou autre
```

---

## 📞 Support des navigateurs

| Navigateur | iPad | PC |
|-----------|------|-----|
| Safari | ✅ (iOS 12+) | ✅ |
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Edge | ✅ | ✅ |

---

**Fin de la documentation! 📚**
