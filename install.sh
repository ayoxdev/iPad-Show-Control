#!/bin/bash

# Installation et démarrage rapide

set -e

echo "🎬 iPad Show Control - Installation"
echo "=========================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé!"
  echo "   Téléchargez depuis: https://nodejs.org"
  exit 1
fi

echo "✓ Node.js trouvé: $(node -v)"
echo "✓ npm trouvé: $(npm -v)"
echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

echo ""
echo "✅ Installation terminée!"
echo ""
echo "🚀 Pour démarrer le serveur:"
echo "   npm start"
echo ""
echo "💻 Puis accédez à:"
echo "   PC (Admin):    http://localhost:5173/admin"
echo "   iPad 1:        http://votre-ip:5173/display/1"
echo "   iPad 2:        http://votre-ip:5173/display/2"
echo "   iPad 3:        http://votre-ip:5173/display/3"
echo ""
