# ✅ Checklist pré-déploiement

Guide pour vérifier que tout est prêt avant utilisation.

## 🔧 Avant de démarrer

- [ ] Node.js est installé (`node --version` doit fonctionner)
- [ ] Vous êtes dans le bon répertoire: `/Users/rigoleti/Documents/ARN/Spectacle/ipad/`
- [ ] Le fichier `package.json` existe

## 📦 Installation

```bash
npm install
```

- [ ] Les dépendances s'installent sans erreur
- [ ] Le dossier `node_modules/` a été créé
- [ ] Aucune erreur "ERR!"

## 🎬 Démarrage du serveur

```bash
npm start
```

- [ ] Vous voyez le message d'accueil avec le port
- [ ] Aucune erreur "EADDRINUSE" (port déjà utilisé)
- [ ] Le serveur affiche: "🎬 iPad Show Control Server"

### Si EADDRINUSE (port déjà utilisé)

```bash
# Trouver le processus utilisant le port 8080
lsof -i :8080

# Tuer le processus (adaptez le PID)
kill -9 12345

# Ou changer le port dans server/config.js
PORT: 3001
```

## 🌐 Accès aux interfaces

### PC (Admin)

Ouvrir: http://localhost:8080

- [ ] Page d'accueil affichée avec bouttons
- [ ] Admin Panel accessible
- [ ] Pas d'erreur 404

### iPad/Simulateur

Ouvrir: http://votre-ip:8080/display/1

- [ ] Page display.html chargée
- [ ] Statut bar affichée (haut de l'écran)
- [ ] "Connexion..." puis "Connecté" après quelques secondes

**Comment trouver votre IP:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

## 📱 Test fonctionnel

### 1. Admin Panel

Accéder à: http://localhost:8080/admin

- [ ] Page charge correctement
- [ ] Vous voyez "🎬 Show Control" en haut
- [ ] Deux sections visibles: "Devices" et "Scènes préprogrammées"

### 2. Devices

- [ ] Au moins 1 device dans la liste (Gauche, Centre, Droite)
- [ ] Statut "🟴 Déconnecté" au début
- [ ] Après quelques secondes, l'iPad se connecte → "🟢 Connecté"

### 3. Déclencher une scène

- [ ] Cliquez sur "Transition Bleue"
- [ ] L'iPad affiche un écran bleu
- [ ] Aucune erreur dans la console

### 4. Fallback

- [ ] Cliquez "🛑 Tout vers FALLBACK"
- [ ] L'iPad affiche l'image fallback ("NO SIGNAL")
- [ ] Cela confirme que le mécanisme de fallback fonctionne

## 📊 Vérifications techniques

### Console serveur

- [ ] Vous voyez des logs quand l'iPad se connecte
- [ ] Format: "[timestamp] Device 1 connected"

### Console iPad (DevTools)

- [ ] Ouvrir Safari DevTools (Menu → Développement → Afficher la console)
- [ ] Aucune erreur 404
- [ ] Service Worker enregistré ("✓ Service Worker registered")

## 🔌 WebSocket

### Vérifier la connexion WebSocket

Dans la console du navigateur (Admin panel):

```javascript
// Vérifier que Socket.IO est chargé
console.log(window.io)  // Doit afficher: ƒ io()

// Vérifier le socket
console.log(window.socket)  // Doit afficher: Object { ... }

// Vérifier la connexion
console.log(window.socket.connected)  // Doit afficher: true
```

- [ ] Socket.IO est chargé
- [ ] Socket est connecté

## 🎨 Assets

- [ ] Fallback image existe: `server/public/assets/fallback.svg`
- [ ] Les scènes réfèrent à `/assets/fallback.svg` (au moins scene_trio_images)

## 📁 Structure de fichiers

```
✓ package.json
✓ server/
  ✓ index.js
  ✓ config.js
  ✓ devices.json
  ✓ scenes/
    ✓ scene_*.json (6 fichiers)
  ✓ public/
    ✓ index.html
    ✓ display.html
    ✓ admin.html
    ✓ sw.js
    ✓ assets/
      ✓ fallback.svg
✓ Documentation (README.md, etc.)
```

- [ ] Tous les fichiers existent
- [ ] Aucun fichier cassé

## 🆚 Créer votre première scène personnalisée

1. Créer: `server/scenes/test_scene.json`

```json
{
  "id": "test_scene",
  "label": "Ma Scène de Test",
  "devices": {
    "1": {
      "type": "text",
      "value": "Ça marche!"
    }
  }
}
```

- [ ] Fichier créé avec syntaxe JSON valide
- [ ] Validée avec https://jsonlint.com/ si doute

2. Recharger les scènes

- [ ] Admin Panel → "🔄 Recharger les scènes"
- [ ] Votre scène "Ma Scène de Test" apparaît dans la liste

3. Déclencher

- [ ] Cliquez sur "Ma Scène de Test"
- [ ] L'iPad affiche le texte "Ça marche!"

## 🚨 Problèmes courants

### "Cannot GET /admin"

- [ ] Vérifier que `server/public/admin.html` existe
- [ ] Redémarrer le serveur

### iPad se déconnecte immédiatement

- [ ] Vérifier que PC et iPad sont sur le même WiFi
- [ ] Essayer directement l'IP (ex: http://192.168.1.10:8080)
- [ ] Vérifier le firewall

### Service Worker ne se charge pas

- [ ] Dans DevTools, aller à Application → Service Workers
- [ ] Vérifier qu'il y a une ligne avec `/sw.js`
- [ ] Vérifier dans Console qu'il n'y a pas d'erreur 404

### Scènes ne se chargent pas

```bash
# Vérifier l'API directement
curl http://localhost:8080/api/scenes | jq
```

- [ ] L'API retourne au moins 6 scènes (les fichiers d'exemple)

## 📈 Performance

### Test de charge

- [ ] Déclencher rapidement 5 scènes d'affilée
- [ ] L'iPad n'affiche pas d'erreurs
- [ ] Pas de ralentissement notable

### Mémoire

```bash
# Dans la console serveur
# Vérifier qu'il n'y a pas de fuite mémoire
```

## 🔐 Sécurité (réseau local)

- [ ] Serveur accessible uniquement sur le réseau local
- [ ] Pas d'ouverture à Internet (pas besoin pour spectacle)
- [ ] Pour l'Internet, ajouter authentification (voir DEVELOPMENT.md)

## 📊 Monitoring

Accéder à: http://localhost:8080/api/devices

- [ ] JSON valide retourné
- [ ] Tous les devices listés
- [ ] États (connected/disconnected) corrects

## ✨ Checklist complète

- [ ] Installation OK (npm install)
- [ ] Serveur démarre (npm start)
- [ ] Admin panel accessible
- [ ] iPad se connecte
- [ ] Scènes se déclenchent
- [ ] Fallback fonctionne
- [ ] Première scène perso créée et testée
- [ ] Aucune erreur de console
- [ ] WebSocket connecté
- [ ] API répond correctement

## 🚀 Prêt pour le spectacle!

Si tout est ✓, vous êtes prêt!

### Avant le spectacle

1. Charger les iPads
2. Les placer en position
3. Ouvrir les URLs display
4. Ouvrir le panel admin sur PC
5. Faire des tests rapides
6. Lancer!

### Pendant le spectacle

1. Déclencher les scènes via admin panel
2. En cas de problème: bouton "🛑 FALLBACK"
3. Garder le plan B (iPad en fallback = écran noir/signal)

### Après le spectacle

1. Arrêter le serveur: Ctrl+C
2. Décharger les iPads
3. Sauvegarder les logs si besoin

---

**Bon spectacle! 🎭**
