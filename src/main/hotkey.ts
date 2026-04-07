import { globalShortcut } from 'electron';

export class HotkeyManager {
  private isPressed = false;
  private triggerKey: string;

  constructor(triggerKey: string, private onToggleOn: () => void, private onToggleOff: () => void) {
    // Map normal names to valid Electron accelerators if necessary
    // e.g., "Alt" can just be "Alt" but "Alt" requires a modifier for GlobalShortcut often.
    // However, Electron globalShortcut accepts single keys in modern versions.
    // To be safe we try to register what the user configures.
    this.triggerKey = triggerKey;
    this.register();
  }

  private register() {
    let lastPressTime = 0;
    try {
      globalShortcut.unregisterAll();
      const success = globalShortcut.register(this.triggerKey, () => {
        const now = Date.now();
        // Prevent key repeat storms if user holds down the shortcut
        if (now - lastPressTime < 500) return;
        lastPressTime = now;
        
        if (!this.isPressed) {
          this.isPressed = true;
          this.onToggleOn();
        } else {
          this.isPressed = false;
          this.onToggleOff();
        }
      });
      if (!success) {
        console.error('Failed to register global shortcut:', this.triggerKey);
      }
    } catch (err) {
      console.error('Shortcut register error:', err);
    }
  }

  updateKey(newKey: string) {
    this.triggerKey = newKey;
    this.register();
  }
}
