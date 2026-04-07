import { BrowserWindow } from 'electron';

export class AudioCapture {
  constructor(private win: BrowserWindow) {}

  start() {
    this.win.webContents.send('start-recording');
  }

  stop() {
    this.win.webContents.send('stop-recording');
  }
}
