# 🎬 iPad Show Control - Système complet

> Contrôlez plusieurs iPads en temps réel pour vos spectacles

## 🚀 Démarrage ultra-rapide (2 min)

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur
npm start

# 3. Accéder à l'interface
# PC (Admin):  http://localhost:8080/admin
# iPad 1:      http://votre-ip:8080/display/1
```

✅ C'est fait! Allez déclencher une scène 🎉

---

## 📚 Documentation

Commencez par l'un de ces fichiers:

| Document | Durée | Contenu |
|----------|-------|---------|
| **[QUICKSTART.md](QUICKSTART.md)** | 5 min | Démarrage rapide avec exemples |
| **[README.md](README.md)** | 20 min | Documentation complète |
| **[API.md](API.md)** | 15 min | Référence API REST + WebSocket |
| **[DEVELOPMENT.md](DEVELOPMENT.md)** | 30 min | Guide de développement |
| **[EXAMPLES.md](EXAMPLES.md)** | 20 min | Exemples avancés |
| **[STRUCTURE.md](STRUCTURE.md)** | 10 min | Vue d'ensemble du projet |
| **[SUMMARY.md](SUMMARY.md)** | 5 min | Résumé de ce qui a été créé |

---

## ✨ Fonctionnalités

- 🎨 **Affichage dynamique**: Images, vidéos, couleurs, texte
- ⚡ **Temps réel**: WebSocket avec reconnexion auto
- 🎬 **Scènes préprogrammées**: Déclenchez avec un clic
- 📱 **Multi-iPad**: Contrôlez 1 ou 100 iPads
- 🛡️ **Résilience**: Fallback automatique en cas de déconnexion
- 💾 **Cache intelligent**: Service Worker pour offline-first
- 📊 **Admin panel**: Interface complète et intuitive

---

## 🎯 En 30 secondes

1. **Admin Panel** (http://localhost:8080/admin)
   - Liste des iPads
   - Boutons pour déclencher les scènes
   - Envoi de contenu en direct

2. **Display (iPad)** (http://localhost:8080/display/1)
   - Page plein écran
   - Affiche le contenu reçu
   - Se reconnecte automatiquement

3. **Déclencher une scène**
   - Admin Panel → "Transition Bleue"
   - Les iPads affichent un écran bleu ✓

---

## 🔧 Configuration

### Ajouter des devices

Éditez `server/devices.json`:

```json
{
  "devices": [
    { "id": 1, "label": "iPad Gauche" },
    { "id": 2, "label": "iPad Centre" },
    { "id": 3, "label": "iPad Droite" }
  ]
}
```

### Créer une scène

Créez `server/scenes/ma_scene.json`:

```json
{
  "id": "ma_scene",
  "label": "Ma Scène",
  "devices": {
    "1": { "type": "text", "value": "Bonjour!" },
    "2": { "type": "color", "value": "#ff0000" },
    "3": { "type": "image", "src": "/assets/img.png" }
  }
}
```

### Ajouter un asset

Placez votre fichier dans `server/public/assets/` et créez une scène qui l'utilise.

---

## 🌐 Accès en réseau local

```bash
# Trouver votre IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Sur les iPads, accédez à:
http://192.168.x.x:8080/display/1
```

---

## 📊 Architecture

```
Serveur (Node.js + Express + Socket.IO)
    ↓
    ├─ Admin Panel (http://localhost:8080/admin)
    ├─ Display 1   (http://localhost:8080/display/1)
    ├─ Display 2   (http://localhost:8080/display/2)
    └─ Display 3   (http://localhost:8080/display/3)
    ↓
    REST API (GET/POST /api/*)
    WebSocket (Socket.IO)
```

---

## 🆚 Types de contenu

| Type | Exemple | Résultat |
|------|---------|----------|
| **color** | `#ff0000` | Écran rouge |
| **text** | `"Bienvenue!"` | Affiche du texte |
| **image** | `/assets/img.png` | Affiche une image |
| **video** | `/assets/video.mp4` | Joue une vidéo |

---

## 🛡️ Résilience

- **Fallback automatique** après 30s d'inactivité
- **Reconnexion auto** en cas de perte réseau
- **Service Worker** pour cache local
- **Synchronisation** à la reconnexion

---

## 📋 Scènes incluses

- 🎬 Ouverture du spectacle
- 🔵 Transition Bleue
- 🖼️ Trio d'images
- 🔴 Alerte Rouge
- ⬛ Écran Noir
- ⬜ Écran Blanc

---

## 🆘 Problèmes?

### Les iPads ne se connectent pas
- Vérifier que PC et iPads sont sur le même WiFi
- Utiliser l'IP réelle (pas localhost)
- Vérifier le firewall (port 8080)

### Scènes ne se chargent pas
```bash
curl http://localhost:8080/api/scenes | jq
```

### Voir les logs détaillés
```bash
npm run dev
```

Voir [README.md - Troubleshooting](README.md#-dépannage) pour plus d'aide.

---

## 🚀 Prochaines étapes

1. ✅ Installer et tester
2. 📖 Lire [QUICKSTART.md](QUICKSTART.md)
3. 🎨 Créer vos propres scènes
4. 📊 Ajouter vos images/vidéos
5. 🔧 Consulter [DEVELOPMENT.md](DEVELOPMENT.md) pour les extensions

---

## 📞 Documentation

- 📖 **[README.md](README.md)** - Guide complet (4000+ mots)
- ⚡ **[QUICKSTART.md](QUICKSTART.md)** - 5 minutes chrono
- 🔌 **[API.md](API.md)** - Référence complète
- 🛠️ **[DEVELOPMENT.md](DEVELOPMENT.md)** - Pour développeurs
- 💡 **[EXAMPLES.md](EXAMPLES.md)** - Exemples avancés
- 📁 **[STRUCTURE.md](STRUCTURE.md)** - Vue d'ensemble
- ✅ **[CHECKLIST.md](CHECKLIST.md)** - Avant le déploiement

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| **Serveur** | Node.js + Express + Socket.IO |
| **Clients** | iOS Safari + navigateurs web |
| **Responsive** | 6 scènes incluses |
| **Extensible** | Facilement - voir EXAMPLES.md |
| **Résilience** | Fallback auto, reconnexion, cache |
| **Performance** | WebSocket, compression, cache |

---

## 🎓 Concepts

Ce système illustre:
- ✓ WebSocket temps réel
- ✓ Broadcasting à plusieurs clients
- ✓ Service Worker et offline-first
- ✓ REST API
- ✓ Architecture client-serveur
- ✓ Résilience et fallback

---

## 📄 Fichiers importants

```
server/
├── index.js              ← Serveur principal
├── config.js             ← Configuration
├── devices.json          ← Devices
└── public/
    ├── display.html      ← Client iPad
    ├── admin.html        ← Panel admin
    ├── sw.js             ← Service Worker
    └── scenes/           ← Vos scènes JSON
```

---

## ✅ Avant le spectacle

- [ ] Serveur en cours d'exécution
- [ ] iPads connectés et affichant le contenu
- [ ] Scènes testées
- [ ] Fallback vérifié
- [ ] Backup plan en place

---

## 🎭 Bon spectacle!

**Créé le 3 décembre 2025**  
**iPad Show Control v1.0**  
**Support: Documentation complète incluse**

---

**Questions? Consultez [README.md](README.md) ou [QUICKSTART.md](QUICKSTART.md)**
