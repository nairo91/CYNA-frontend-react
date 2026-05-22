#!/bin/bash
# deploy-frontend.sh — Mise à jour du frontend CYNA après un git push
# Usage : bash deploy-frontend.sh

set -e

DEPLOY_DIR="/var/www/Cyna/CYNA-frontend-react"
echo "🚀 Déploiement frontend CYNA..."

cd "$DEPLOY_DIR"

echo "📥 [1/4] git pull..."
git pull origin main

echo "📦 [2/4] npm install..."
npm install --production=false

echo "🔨 [3/4] Build Vite (production)..."
npm run build

echo "✅ [4/4] Frontend déployé ! dist/ mis à jour."
echo "   Nginx sert automatiquement les nouveaux fichiers."
