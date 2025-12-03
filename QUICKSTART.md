# 🚀 Guide de démarrage rapide

Vous voulez lancer le système en 5 minutes? Suivez ce guide.

## ⚡ Installation (2 min)

### 1. Installer Node.js (si ce n'est pas déjà fait)

Téléchargez depuis https://nodejs.org (LTS recommandé)

### 2. Installer les dépendances

```bash
cd /chemin/vers/votre/projet
npm install
```

Vous devriez voir:

```
added 123 packages in 45s
```

## 🎬 Lancer le serveur (1 min)

```bash
npm start
```

Vous devriez voir:

```
╔════════════════════════════════════════════════╗
║  🎬 iPad Show Control Server              ║
║  http://localhost:8080
║  Admin: http://localhost:8080/admin
╚════════════════════════════════════════════════╝
```

✓ Le serveur est prêt!

## 📱 Accéder à l'interface

### Sur votre PC:

**Admin Panel**: http://localhost:8080/admin

### Sur les iPads (ou simulateur):

- **iPad 1**: http://votre-ip-pc:8080/display/1
- **iPad 2**: http://votre-ip-pc:8080/display/2
- **iPad 3**: http://votre-ip-pc:8080/display/3

**Comment trouver votre IP PC?**

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig
```

Cherchez quelque chose comme `192.168.x.x` ou `10.0.x.x`

## 🎨 Essayer une scène (1 min)

1. Accédez au **Admin Panel**
2. Vous devriez voir la liste des devices en haut à gauche
3. Cliquez sur **"Transition Bleue"**
4. Regardez les iPads: elles affichent un écran bleu! 🎉

## 📤 Envoyer du contenu personnalisé

1. Dans le **Admin Panel**, allez à la section **"Envoyer du contenu personnalisé"**
2. Sélectionnez le type:
   - **Image**: Entrez l'URL (ex: `/assets/fallback.svg`)
   - **Couleur**: Choisissez une couleur
   - **Texte**: Entrez du texte
3. Cliquez sur un device en haut à gauche pour le sélectionner
4. Cliquez sur **"Envoyer à la sélection"**

## 🆚 Créer votre propre scène

### Étape 1: Créer le fichier JSON

Créez `server/scenes/ma_premiere_scene.json`:

```json
{
  "id": "ma_premiere_scene",
  "label": "Ma Première Scène",
  "devices": {
    "1": {
      "type": "text",
      "value": "Bienvenue sur iPad 1!"
    },
    "2": {
      "type": "color",
      "value": "#4a9eff"
    },
    "3": {
      "type": "text",
      "value": "Spectacle en cours"
    }
  }
}
```

### Étape 2: Recharger les scènes

1. Allez au **Admin Panel**
2. Cliquez sur **"🔄 Recharger les scènes"**

### Étape 3: Déclencher!

Votre nouvelle scène apparaît dans la liste. Cliquez dessus!

## 🎯 Types de contenu

| Type | Exemple | Résultat |
|------|---------|----------|
| **color** | `{ "type": "color", "value": "#ff0000" }` | Écran rouge |
| **text** | `{ "type": "text", "value": "Bonjour!" }` | Texte blanc |
| **image** | `{ "type": "image", "src": "/assets/img.png" }` | Image affichée |
| **video** | `{ "type": "video", "src": "/assets/video.mp4" }` | Vidéo jouée |

## ⚠️ Pas de signal? Fallback!

Si un iPad:
- Se déconnecte
- N'a pas reçu d'instruction pendant 30 secondes

→ Affiche automatiquement l'image `fallback.svg` avec "NO SIGNAL"

Vous pouvez forcer le fallback:
- **Admin Panel** → Bouton **"🛑 Tout vers FALLBACK"**

## 🔧 Troubleshooting rapide

### "Connection refused"

```bash
# Vérifier que le serveur tourne
curl http://localhost:8080

# Si pas de réponse, redémarrer
npm start
```

### Les iPads ne se connectent pas

1. Vérifiez que PC et iPads sont sur le même WiFi
2. Testez avec l'IP du PC (ex: `http://192.168.1.10:8080`)
3. Vérifiez le firewall (port 8080 doit être accessible)

### Les scènes ne se chargent pas

```bash
# Vérifier les scènes disponibles
curl http://localhost:8080/api/scenes

# Vérifier la syntaxe JSON de votre scène
# (utilisez https://jsonlint.com/)
```

## 📚 Prochaines étapes

- 📖 Lire [README.md](README.md) pour la documentation complète
- 🔧 Lire [DEVELOPMENT.md](DEVELOPMENT.md) pour les extensions
- 🎨 Ajouter vos propres images/vidéos dans `server/public/assets/`
- 🔐 Ajouter une authentification si nécessaire
- 🚀 Déployer sur un serveur distant

## 🆘 Besoin d'aide?

1. **Logs du serveur**: Lancez avec `npm run dev` pour voir plus de détails
2. **DevTools iPad**: Appuyez sur Ctrl+Maj+I (Chrome) ou Menu → Développement (Safari)
3. **Documentation**: Consultez [DEVELOPMENT.md](DEVELOPMENT.md)

---

**Bon spectacle! 🎭**
