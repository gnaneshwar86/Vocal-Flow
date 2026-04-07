# VocalFlow Windows (Final Production Version) ⚡

A premium, high-performance Windows system tray clone of the macOS "VocalFlow" experience. Effortlessly transcribe your speech into high-quality, grammar-corrected text instantly at your active cursor across any application.

## 🌈 Key Evolution Path
- **v1.0.0 (Latest):** 
  - Overhauled **Premium Glassmorphism UI** with smooth animations.
  - Integrated **Real-time Balance/Token tracking** for Deepgram and Groq.
  - New **Branded Blue Soundwave Icon** for both System Tray and .EXE branding.
  - Switched to **VBScript Automation** for 100% reliable text injection.
  - Auto-opens dashboard on launch for quick configuration.

## 🌟 Core Features
- **Global Hotkey:** Toggle recording with `Ctrl + Shift + Space`.
- **Intelligent Fallback:** Hardcoded API keys in the logic allow first-time users to test the app instantly.
- **Deepgram AI:** Ultra-low latency speech-to-text.
- **Groq Llama 3.1:** High-speed, professional grammar correction.
- **Stealth Background Mode:** Minimizes to the System Tray for a clean workspace.

## 🚀 Installation & Usage

### ⚙️ Quick Start (Developer Mode)
> [!CAUTION]
> **Security Warning:** The following keys are provided for hardcoded testing. GitHub's Secret Scanning may flag or block pushes containing these strings.
>
- **Deepgram Key:** `962d27a344e34e825ad247d5c350e5cc625db643`
- **Groq Key:** `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`

1. **Clone & Install:**
   ```bash
   npm install
   ```
2. **Setup Keys:**
   Open `config/config.json` and paste your API keys (optional: defaults already hardcoded).
3. **Compile & Launch:**
   ```bash
   npm run build
   npm start
   ```

### 📦 Building a Standalone EXE
To create a branded Windows installer:
```bash
npm run dist
```
This will generate your installer at `release/VocalFlow Setup 1.0.0.exe`.

## 📁 Repository Cleanliness
The project is strictly organized:
- `/assets`: Branded application icons.
- `/src/main`: All high-performance backend logic.
- `/src/renderer`: Frontend dashboard assets.
- `/config`: Configuration persistence.
- `/release`: Final distribution artifacts (Git ignored).

## 🛡️ Best Practices & Credits
- Built with **Electron + TypeScript**.
- Driven by **Deepgram** and **Groq** AI networks.
- Optimized for Windows focus-retention and non-intrusive operations.

---
*Created for Gnaneshwar's VocalFlow Windows Project.*
