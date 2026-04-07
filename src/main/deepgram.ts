import { createClient, LiveClient } from '@deepgram/sdk';
import { AppConfig } from './config';

export class DeepgramService {
  private connection: LiveClient | null = null;
  private finalTranscript = '';

  constructor(private config: AppConfig) {}

  startStream(onTranscript: (text: string) => void, onOpen: () => void) {
    if (!this.config.deepgramApiKey || this.config.deepgramApiKey === 'YOUR_DEEPGRAM_API_KEY') {
      console.error('Deepgram API Key is missing or invalid.');
      onTranscript('VocalFlow Error: Please enter your Deepgram API Key in the Settings Dashboard.');
      return;
    }

    const deepgram = createClient(this.config.deepgramApiKey);
    this.finalTranscript = '';
    this.connection = deepgram.listen.live({ 
      model: 'nova-2', 
      language: this.config.language || 'en', 
      smart_format: true
    });

    this.connection.on('open', () => {
      console.log('Deepgram connection opened.');
      onOpen();
    });

    this.connection.on('Results', (data: any) => {
      const p = data.channel.alternatives[0].transcript;
      if (p && data.is_final) {
        this.finalTranscript += p + ' ';
      }
    });

    this.connection.on('close', () => {
      onTranscript(this.finalTranscript.trim());
    });

    this.connection.on('error', (err: any) => {
      console.error('Deepgram error:', err);
      this.finalTranscript += ` [VocalFlow Error: Deepgram API rejected the connection. Check your API key. Error: ${err.message || 'Unknown'}] `;
    });
  }

  sendAudioChunk(chunk: Buffer | ArrayBuffer) {
    if (this.connection && this.connection.getReadyState() === 1) { // OPEN
      this.connection.send(chunk as any);
    }
  }

  stopStream() {
    if (this.connection) {
      this.connection.requestClose();
      this.connection = null;
    }
  }

  async getBalance() {
     // Mock balance 
     return { balance: 15.42 };
  }
}
