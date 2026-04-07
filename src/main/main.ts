import { app, BrowserWindow, ipcMain, Tray } from 'electron';
import path from 'path';
import { loadConfig, saveConfig, AppConfig } from './config';
import { createTray } from './tray';
import { HotkeyManager } from './hotkey';
import { AudioCapture } from './audio';
import { DeepgramService } from './deepgram';
import { GroqService } from './groq';
import { injectText } from './injector';

let mainWindow: BrowserWindow;
let tray: Tray;
let config: AppConfig;
let hotkeyManager: HotkeyManager;
let audioCapture: AudioCapture;
let deepgramService: DeepgramService;
let groqService: GroqService;

async function activateRecording() {
  if (!config.deepgramApiKey || config.deepgramApiKey === 'YOUR_DEEPGRAM_API_KEY') {
    mainWindow.show();
    mainWindow.webContents.send('status-update', 'Key Missing!');
    return;
  }

  console.log('Recording started...');
  mainWindow.webContents.send('status-update', 'Connecting...');
  
  deepgramService.startStream(async (transcript) => {
    console.log('Transcript finished:', transcript);
    if (transcript && transcript.trim()) {
      const finalTranscript = await groqService.fixTranscript(transcript);
      console.log('Final text to inject:', finalTranscript);
      injectText(finalTranscript);
      mainWindow.webContents.send('status-update', 'Idle');
    } else {
      mainWindow.webContents.send('status-update', 'No Speech detected');
      setTimeout(() => mainWindow.webContents.send('status-update', 'Idle'), 2000);
    }
  }, () => {
    // onOpen callback
    audioCapture.start();
    mainWindow.webContents.send('status-update', 'Listening...');
  });
}

function stopRecording() {
  console.log('Recording stopped...');
  audioCapture.stop();
  deepgramService.stopStream();
  mainWindow.webContents.send('status-update', 'Processing...');
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

app.whenReady().then(() => {
  config = loadConfig();
  
  mainWindow = new BrowserWindow({
    width: 600,
    height: 700,
    show: true, // Always show on startup
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') callback(true);
    else callback(false);
  });

  mainWindow.loadFile(path.join(__dirname, '../../src/renderer/settings.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!(app as any).isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  tray = createTray(mainWindow);
  audioCapture = new AudioCapture(mainWindow);
  deepgramService = new DeepgramService(config);
  groqService = new GroqService(config);

  hotkeyManager = new HotkeyManager(config.hotkey, activateRecording, stopRecording);

  // IPC Handlers
  ipcMain.on('audio-chunk', (event, buffer) => {
    deepgramService.sendAudioChunk(buffer);
  });

  ipcMain.handle('get-config', () => {
    return loadConfig();
  });

  ipcMain.on('save-config', (event, newConfig) => {
    saveConfig(newConfig);
    config = newConfig;
    deepgramService = new DeepgramService(config);
    groqService = new GroqService(config);
    hotkeyManager.updateKey(config.hotkey);
  });

  ipcMain.handle('get-balances', async () => {
    const dg = await deepgramService.getBalance();
    const gr = groqService.getSimulatedBalance();
    return { deepgram: dg, groq: gr };
  });
  
  ipcMain.on('quit-app', () => {
    app.quit();
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Recreate window if needed
  }
});

// @ts-ignore
app.isQuitting = false;
app.on('before-quit', () => {
    // @ts-ignore
  app.isQuitting = true;
});
