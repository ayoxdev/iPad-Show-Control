/**
 * Configuration centralisée du serveur
 */

export const config = {
  // Serveur
  PORT: process.env.PORT || 8080,  // Port 8080
  HOST: '0.0.0.0',  // Écouter sur toutes les interfaces

  // WebSocket
  PING_INTERVAL: 500, // Ping toutes les 5 secondes
  CONNECTION_TIMEOUT: 80800, // Timeout après 30 secondes

  // Paths
  DEVICES_CONFIG: './devices.json',
  SCENES_DIR: './scenes',
  ASSETS_DIR: './assets',
  PUBLIC_DIR: './public',

  // Fallback
  FALLBACK_IMAGE: '/assets/fallback.svg',
  FALLBACK_TIMEOUT: 80800, // Fallback après 30s d'inactivité sur l'iPad

  // Logs
  DEBUG: process.env.DEBUG || false,
};

export const log = (context, message, data = '') => {
  if (config.DEBUG) {
    console.log(`[${new Date().toISOString()}] ${context}: ${message}`, data);
  }
};
