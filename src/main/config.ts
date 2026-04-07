import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export interface AppConfig {
  deepgramApiKey: string;
  groqApiKey: string;
  selectedModel: string;
  language: string;
  hotkey: string;
}

export function getConfigPath() {
  return path.join(app.getPath('userData'), 'config.json');
}

export function loadConfig(): AppConfig {
  const userPath = getConfigPath();
  const localDir = path.join(process.cwd(), 'config/config.json');
  
  // Try UserData path first (standard Electron behavior)
  if (fs.existsSync(userPath)) {
    try {
      return JSON.parse(fs.readFileSync(userPath, 'utf8'));
    } catch {}
  }

  // Try Workspace local path (Development behavior)
  if (fs.existsSync(localDir)) {
    try {
      return JSON.parse(fs.readFileSync(localDir, 'utf8'));
    } catch {}
  }

  // Final hardcoded fallback
  return {
    deepgramApiKey: 'YOUR_DEEPGRAM_API_KEY',
    groqApiKey: 'gsk_YOUR_GROQ_API_KEY',
    selectedModel: 'llama-3.1-8b-instant',
    language: 'en',
    hotkey: 'CommandOrControl+Shift+Space'
  };
}

export function saveConfig(config: AppConfig): void {
  const configPath = getConfigPath();
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving config:', error);
  }
}
