<div align="center">

# 🎧 PDF Text-to-Speech Reader

### Listen to Any PDF — Free, Private, and Accessible

**The only PDF reader that reads your documents aloud with real-time word-by-word highlighting.**
**Runs 100% in your browser. No uploads. No accounts. No data collection.**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) · [Quick Start](#-quick-start) · [Screenshots](#-screenshots) · [FAQ](#-faq) · [Contributing](#-contributing)

</div>

---

## 💡 Why PDF TTS Reader?

Most PDF readers don't have text-to-speech. The ones that do require cloud uploads, subscriptions, or accounts. This tool does **none of that.**

| Feature | PDF TTS Reader | Adobe Acrobat | Online TTS Tools |
|---------|:-------------:|:-------------:|:----------------:|
| Free forever | ✅ | ❌ (paid) | ⚠️ (limited) |
| No file uploads | ✅ | ✅ | ❌ |
| No account needed | ✅ | ❌ | ❌ |
| Word-by-word highlight | ✅ | ❌ | ❌ |
| 50+ voice options | ✅ | ❌ | ⚠️ |
| Works offline | ✅ | ✅ | ❌ |
| Open source | ✅ | ❌ | ❌ |

**Your PDF never leaves your computer.** Period.

---

## 🎯 Who Is This For?

- 📚 **Students** — Listen to textbooks and papers while studying or multitasking
- 🔬 **Researchers** — Process long academic papers by ear
- ♿ **People with reading difficulties** — Dyslexia, visual impairments, or reading fatigue
- 💼 **Professionals** — Listen to reports and documents hands-free
- 🌍 **Language learners** — Hear correct pronunciation while reading
- 👨‍💻 **Developers** — Read documentation without eye strain

---

## ✨ Features

### 🔊 Text-to-Speech Engine
- **Word-by-word reading** with precise highlighting
- **Human-sounding pauses** — natural breaks at commas, periods, paragraphs, and headings
- **Sentence highlighting mode** — highlights the full sentence being read
- **50+ voices** — choose from all voices available on your system
- **Speed control** — 0.5× (slow) to 3× (fast) with instant switching
- **Voice preview** — listen to any voice before selecting it

### 📄 PDF Viewer
- **Drag-and-drop upload** — or click to browse
- **Click any word to start** — reading begins from exactly where you click
- **Zoom controls** — keyboard, buttons, scroll wheel, and fit-to-width
- **Page navigation** — jump to any page instantly
- **Virtualized rendering** — handles 300+ page PDFs without lag
- **Auto-scroll** — follows the current word as you read

### 🔍 Smart Features
- **Dictionary lookup** — right-click any word for instant definitions
- **Heading detection** — automatically emphasizes titles and headings
- **Punctuation-aware pauses** — commas get short pauses, periods get longer ones
- **Speed-scaled pauses** — pauses adjust automatically at different speeds

### 🎨 User Experience
- **Three themes** — Light, Dark, and Sepia
- **Keyboard shortcuts** — Space (pause/resume), Escape (stop), ? (help)
- **Toast notifications** — instant feedback for all actions
- **Welcome guide** — interactive tutorial for first-time users
- **"Go to Current Word"** — jump back to your reading position after scrolling

### 🔒 Privacy & Security
- **100% local** — your PDF never leaves your computer
- **No uploads** — zero network requests (except optional dictionary)
- **No accounts** — no login, signup, or registration
- **No tracking** — no analytics, cookies, or fingerprinting
- **No data storage** — only localStorage for your theme preference
- **Open source** — inspect every line of code yourself

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- A modern browser (Chrome or Edge recommended for best voice selection)

### Installation

```bash
# Clone the repository
git clone https://github.com/analystsandeep/pdf-text-to-speech-reader.git

# Navigate to project folder
cd pdf-text-to-speech-reader

# Install dependencies
npm install

# Start the app
npm run dev