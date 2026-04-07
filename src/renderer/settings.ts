import { ipcRenderer } from 'electron';

let mediaRecorder: MediaRecorder | null = null;

async function setupAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Configure timeslice for frequent chunks (e.g., 250ms)
    ipcRenderer.on('start-recording', () => {
      if (!stream.active) {
        // Attempt to restart stream if inactive
      }
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          const buffer = Buffer.from(await e.data.arrayBuffer());
          ipcRenderer.send('audio-chunk', buffer);
        }
      };
      mediaRecorder.start(250);
    });

    ipcRenderer.on('stop-recording', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    });

  } catch (err) {
    console.error('Failed to get user media:', err);
    alert('Microphone access denied or unavailable. Please check permissions.');
  }
}

async function loadSettings() {
  const config = await ipcRenderer.invoke('get-config');
  (document.getElementById('deepgramApiKey') as HTMLInputElement).value = config.deepgramApiKey;
  (document.getElementById('groqApiKey') as HTMLInputElement).value = config.groqApiKey;
  (document.getElementById('selectedModel') as HTMLSelectElement).value = config.selectedModel;
  (document.getElementById('hotkey') as HTMLSelectElement).value = config.hotkey;

  const balances = await ipcRenderer.invoke('get-balances');
  document.getElementById('dgBalance')!.innerText = `$${balances.deepgram.balance}`;
  document.getElementById('groqBalance')!.innerText = `${balances.groq.tokensRemaining} tokens`;
}

document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const config = {
    deepgramApiKey: (document.getElementById('deepgramApiKey') as HTMLInputElement).value,
    groqApiKey: (document.getElementById('groqApiKey') as HTMLInputElement).value,
    selectedModel: (document.getElementById('selectedModel') as HTMLSelectElement).value,
    hotkey: (document.getElementById('hotkey') as HTMLSelectElement).value,
    language: 'en'
  };
  ipcRenderer.send('save-config', config);
  alert('Settings saved successfully!');
});

document.getElementById('quitBtn')?.addEventListener('click', () => {
  ipcRenderer.send('quit-app');
});

ipcRenderer.on('status-update', (event, statusText) => {
  const badge = document.getElementById('statusBadge');
  if (badge) {
    badge.innerText = statusText;
    badge.className = 'badge'; // Reset classes
    
    if (statusText === 'Listening...') {
      badge.classList.add('active');
    } else if (statusText === 'Processing...' || statusText === 'Connecting...') {
      badge.style.backgroundColor = 'var(--warning)';
      badge.style.color = '#000';
    } else if (statusText === 'Idle') {
      badge.style.backgroundColor = 'var(--glass)';
      badge.style.color = 'var(--text)';
    } else {
       // Error or Key Missing
       badge.style.backgroundColor = 'var(--danger)';
       badge.style.color = '#fff';
    }
  }
});

// Init
setupAudio();
loadSettings();

// Reset status if idle for a couple of seconds after processing
ipcRenderer.on('status-update', (event, statusText) => {
  if (statusText === 'Processing...') {
    setTimeout(() => {
      const badge = document.getElementById('statusBadge');
      if (badge && badge.innerText === 'Processing...') {
        badge.innerText = 'Idle';
        badge.style.backgroundColor = '#555';
      }
    }, 2000);
  }
});
