import Groq from 'groq-sdk';
import { AppConfig } from './config';

export class GroqService {
  private groq: Groq | null = null;

  constructor(private config: AppConfig) {
    if (this.config.groqApiKey) {
      this.groq = new Groq({ apiKey: this.config.groqApiKey });
    }
  }
  
  async fixTranscript(text: string): Promise<string> {
    if (!this.groq || !text) return text;
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a transcriber. Fix the grammar, punctuation, and normalize the text. Do not add conversational filler. Only output the final fixed text.' },
          { role: 'user', content: text }
        ],
        model: this.config.selectedModel || 'desc-llama-3.1-8b-instant',
      });
      return completion.choices[0]?.message?.content?.trim() || text;
    } catch (e) {
      console.error('Groq processing error:', e);
      return text;
    }
  }

  getSimulatedBalance() {
    // Simulated token count that slowly decreases
    return { tokensRemaining: Math.floor(Math.random() * 1000) + 490000 };
  }
}
