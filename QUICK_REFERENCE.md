# 🚀 Quick Reference Guide

## Access URLs

| Interface | URL | Purpose |
|-----------|-----|---------|
| **Home** | `http://server:8080/` | Navigation hub |
| **Admin Panel** | `http://server:8080/admin` | Full control with keyboard shortcuts |
| **Mobile Control** | `http://server:8080/mobile` | Touch-optimized for smartphones |
| **Dashboard** | `http://server:8080/dashboard` | Real-time monitoring |
| **Scene Editor** | `http://server:8080/editor` | Create/edit scenes visually |
| **Display 1-3** | `http://server:8080/display/1-3` | iPad display clients |

## Admin Panel Keyboard Shortcuts

```
1 ... 9         Trigger scenes 1-9
T (or t)        Start test sync cycle
SPACE           Emergency fallback (black screen)
```

## Scene Categories

```
🔴 Début/Fin       Opening and closing scenes
🟣 Contenu         Images, videos, content
🟠 Transitions      Effects and transitions
🟢 Tests           Synchronization tests
⚪ Autres          Other scenes
```

## Mobile Admin Tabs

| Tab | Features |
|-----|----------|
| **⚡ Scenes** | Scene buttons, test sync button |
| **📱 Devices** | Device status grid |
| **🎮 Control** | Custom content sender, emergency controls |

## API Endpoints Summary

### Scene Control
```
GET  /api/scenes              Get all scenes
POST /api/scene/:sceneId      Trigger scene
GET  /api/devices             Get device status
POST /api/content             Send custom content
POST /api/all/fallback        Fallback all displays
```

### Audio Sync (NEW)
```
POST /api/audio/sync          Sync audio playback
POST /api/audio/cue           Send audio cue to devices
POST /api/audio/stop          Stop audio playback
```

## Dashboard Features

- 📊 Real-time statistics (connected devices, uptime, last scene)
- 📈 Connection timeline (60-second history)
- 📝 Events log (all system events with timestamps)
- 📥 Export functionality (download monitoring data)
- 🔄 Auto-refresh (every 5 seconds)

## Scene Editor Workflow

1. Click "New Scene" or select existing scene
2. Fill in metadata (label, category, description)
3. Select target devices
4. Choose content type (color, image, video, text)
5. Set content values
6. Click "Apply to Selected Devices"
7. Preview before saving
8. Save or export as JSON

## Test Synchronization

1. Click "🧪 Tester la synchronisation" button
2. System cycles through: Red → Green → Blue → White → Black
3. Each color displays for 2 seconds
4. Verify all iPads show same colors simultaneously
5. Check events log for timing information

## Emergency Controls

| Action | Method | Effect |
|--------|--------|--------|
| **Fallback** | Button or SPACE key | Displays fallback image on all devices |
| **Mobile Stop** | ⚠️ EMERGENCY button | Emergency black screen on all devices |
| **Disconnect** | Admin > Reload | Refresh all device connections |

## Device Status Indicators

```
🟢 Connected      Device is online and ready
🔴 Disconnected   Device is not connected
⏱️  Last Update   Time since last communication
📊 Uptime         Duration device has been connected
```

## Scene Triggers

### From Admin Panel
- Click scene button
- Use keyboard shortcut (1-9)
- Use custom scene uploader

### From Mobile
- Tap scene button in tab
- Use test sync feature
- Send custom content

### From Dashboard
- Monitor only (view-only interface)

### Programmatically
```javascript
// Via REST API
fetch('/api/scene/scene_opening', { method: 'POST' })

// Via audio API
fetch('/api/audio/sync', {
  method: 'POST',
  body: JSON.stringify({ cueId: 'cue_1' })
})
```

## Server Status

### Check Connection
- Open Dashboard to verify all devices
- Look at connection status bar
- Review events log for errors

### Monitor Performance
- Dashboard shows uptime
- Connection timeline visualizes stability
- Events log shows all actions

### Test System
- Use Admin Panel "Test Sync" button
- Use Mobile "Test Sync" button
- Verify all iPads show colors in sequence

## Troubleshooting

### Devices Not Connected
1. Check Dashboard for device status
2. Verify iPad has correct URL: `http://server:8080/display/1`
3. Check network connectivity
4. Try refreshing device page

### Scenes Not Triggering
1. Check Admin Panel - is server connected?
2. Verify scenes loaded in Dashboard
3. Try sending test sync
4. Check browser console for errors

### Audio Not Syncing
1. Verify audio URL is correct
2. Check network latency
3. Use `/api/audio/sync` endpoint
4. Monitor events log

## Performance Tips

- 🎯 Use keyboard shortcuts for faster triggering
- 📱 Use Mobile on your phone for easy access
- 📊 Monitor Dashboard during live performance
- ✏️ Pre-create scenes in Scene Editor
- 🧪 Always run test sync before performance

## File Locations

```
/server/public/
  admin.html      - Admin panel
  mobile.html     - Mobile interface
  dashboard.html  - Monitoring dashboard
  editor.html     - Scene editor
  display.html    - Display client
  index.html      - Home page

/server/scenes/
  scene_*.json    - Scene definitions
  test_sync_*.json - Test scenes
```

## Scene Commands

### Create Scene (Editor)
1. Go to `/editor`
2. Click "New Scene"
3. Configure as needed
4. Save

### Edit Scene (Editor)
1. Go to `/editor`
2. Select scene from list
3. Modify configuration
4. Save

### Duplicate Scene (Editor)
1. Load scene
2. Click "Duplicate" button
3. New scene created as copy
4. Edit as needed

### Delete Scene (Editor)
1. Load scene
2. Click "Delete" button
3. Confirm deletion

## Connection Modes

- **WebSocket** - Primary (fast, real-time)
- **Polling** - Fallback (if WebSocket unavailable)
- Both modes automatic - system picks best option

## Content Types

```
🎨 Color    - Hex color value (#FF0000)
🖼️ Image    - Image URL (/assets/image.png)
🎥 Video    - Video URL (/assets/video.mp4)
📝 Text     - Plain text message
```

## Useful Links

- 📖 Full Documentation: See `/documentation` folder
- 🛠️ Server Config: `/server/config.js`
- 📋 Scene Format: See scene JSON examples in `/scenes`
- 🔌 API Docs: See `API.md` in docs folder

---

**Pro Tips:**
- Use keyboard shortcuts in Admin for fastest control
- Use Dashboard for performance monitoring
- Use Mobile admin for remote/wireless control
- Use Scene Editor to create complex multi-device scenes
- Always test sync before live performance
