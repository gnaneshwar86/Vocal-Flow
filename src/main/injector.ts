import { clipboard } from 'electron';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

export function injectText(text: string) {
  if (!text) return;
  // Keep previous text optionally if needed, but for now just write
  clipboard.writeText(text);

  setTimeout(() => {
    // VBScript is faster to boot than PowerShell and writing to a file bypasses 'cmd.exe' eating the '^' character!
    const vbsPath = path.join(os.tmpdir(), `vocalflow-paste-${Date.now()}.vbs`);
    fs.writeFileSync(vbsPath, 'Set WshShell = WScript.CreateObject("WScript.Shell")\nWScript.Sleep 50\nWshShell.SendKeys "^v"');
    
    exec(`wscript.exe "${vbsPath}"`, (error) => {
      try { fs.unlinkSync(vbsPath); } catch (e) {}
      if (error) {
        console.error('Failed to inject text via VBScript:', error);
      }
    });
  }, 100);
}
