#!/usr/bin/env node

/**
 * Interactive CLI Helper
 * 
 * Usage:
 *   node helpers.js
 *   node helpers.js --show-devices
 *   node helpers.js --create-scene
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`
╔════════════════════════════════════════════════╗
║  🎬 iPad Show Control - Helper CLI             ║
╚════════════════════════════════════════════════╝
`);

const args = process.argv.slice(2);

// Commands
const commands = {
  '--show-devices': showDevices,
  '--create-scene': createScene,
  '--list-scenes': listScenes,
  '--validate-json': validateJSON,
  '--help': showHelp,
};

const command = args[0] || '--help';

if (commands[command]) {
  commands[command]();
} else {
  console.log('❌ Commande inconnue:', command);
  showHelp();
}

function showHelp() {
  console.log(`
Commands:
  --help                 Afficher cette aide
  --show-devices         Afficher les devices configurés
  --create-scene         Créer une nouvelle scène interactivement
  --list-scenes          Lister toutes les scènes
  --validate-json        Valider la syntaxe JSON

Examples:
  node helpers.js --show-devices
  node helpers.js --create-scene
  
Documentation:
  README.md              Guide complet
  QUICKSTART.md          Démarrage 5 min
  API.md                 Référence API
  DEVELOPMENT.md         Guide développement
`);
}

function showDevices() {
  try {
    const data = fs.readFileSync(
      path.join(__dirname, 'server/devices.json'),
      'utf-8'
    );
    const config = JSON.parse(data);
    
    console.log('\n📱 Devices configurés:\n');
    config.devices.forEach(device => {
      console.log(`  ${device.id}. ${device.label}`);
      if (device.description) {
        console.log(`     → ${device.description}`);
      }
    });
    console.log('');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

function listScenes() {
  try {
    const scenesDir = path.join(__dirname, 'server/scenes');
    if (!fs.existsSync(scenesDir)) {
      console.log('❌ Aucun dossier scenes/');
      return;
    }
    
    const files = fs.readdirSync(scenesDir).filter(f => f.endsWith('.json'));
    
    console.log(`\n🎬 Scènes disponibles (${files.length}):\n`);
    
    files.forEach(file => {
      const data = fs.readFileSync(
        path.join(scenesDir, file),
        'utf-8'
      );
      const scene = JSON.parse(data);
      
      console.log(`  📄 ${scene.id}`);
      console.log(`     Label: ${scene.label}`);
      if (scene.description) {
        console.log(`     Desc:  ${scene.description}`);
      }
      console.log(`     Devices: ${Object.keys(scene.devices).join(', ')}`);
      console.log('');
    });
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

function createScene() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  function question(q) {
    return new Promise(resolve => rl.question(q, resolve));
  }
  
  (async () => {
    console.log('\n🎨 Créer une nouvelle scène\n');
    
    const sceneId = await question('ID de la scène (ex: my_scene): ');
    const label = await question('Label (ex: Ma Scène): ');
    const description = await question('Description (optionnel): ');
    
    const scene = {
      id: sceneId,
      label,
    };
    
    if (description) {
      scene.description = description;
    }
    
    scene.devices = {};
    
    // Charger les devices
    const devicesData = fs.readFileSync(
      path.join(__dirname, 'server/devices.json'),
      'utf-8'
    );
    const config = JSON.parse(devicesData);
    
    for (const device of config.devices) {
      const contentType = await question(
        `\nContenu pour device ${device.id} (${device.label}):\n` +
        '  Type (image/video/color/text) [color]: '
      );
      
      const type = contentType || 'color';
      
      let content = { type };
      
      switch (type) {
        case 'image':
          content.src = await question('URL image (ex: /assets/image.png): ');
          break;
        case 'video':
          content.src = await question('URL vidéo (ex: /assets/video.mp4): ');
          const duration = await question('Durée (ms, optionnel): ');
          if (duration) content.duration = parseInt(duration);
          break;
        case 'color':
          content.value = await question('Couleur hex (ex: #ff0000) [#000000]: ') || '#000000';
          break;
        case 'text':
          content.value = await question('Texte à afficher: ');
          break;
      }
      
      scene.devices[device.id] = content;
    }
    
    // Sauvegarder
    const filename = `${sceneId}.json`;
    const filepath = path.join(__dirname, 'server/scenes', filename);
    
    fs.writeFileSync(filepath, JSON.stringify(scene, null, 2));
    
    console.log(`\n✅ Scène créée: ${filename}`);
    console.log(`   Chemin: server/scenes/${filename}`);
    console.log('\n💡 Redémarrez le serveur pour que la scène soit disponible.');
    
    rl.close();
  })();
}

function validateJSON() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.question('Chemin du fichier JSON: ', (filepath) => {
    try {
      const fullPath = path.join(__dirname, filepath);
      if (!fs.existsSync(fullPath)) {
        console.log('❌ Fichier non trouvé:', filepath);
        rl.close();
        return;
      }
      
      const data = fs.readFileSync(fullPath, 'utf-8');
      JSON.parse(data);
      
      console.log('✅ JSON valide!');
      rl.close();
    } catch (err) {
      console.log('❌ Erreur JSON:', err.message);
      rl.close();
    }
  });
}
