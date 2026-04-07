import { app, Menu, Tray, BrowserWindow, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';

export function createTray(win: BrowserWindow): Tray {
  // app.getAppPath() works in both dev (workspace root) AND production (asar root)
  const iconPath = path.join(app.getAppPath(), 'assets/icon.png');
    
  let icon = nativeImage.createEmpty();
  try {
    if (fs.existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath);
    } else {
      console.error('Tray icon NOT found at:', iconPath);
    }
  } catch (e) {
    console.error('Tray icon error:', e);
  }

  const tray = new Tray(icon);
  tray.setToolTip('VocalFlow (Windows)');
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Settings Dashboard', click: () => win.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      app.quit();
    }}
  ]);

  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

  return tray;
}
