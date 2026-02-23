# 🛠️ DevTools Hub

> **All-in-one developer utilities platform** — Format, convert, compare, and analyze data with powerful web-based tools. No installation required.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)

---

## 🚀 Quick Start

**Access Online:** [URL](https://maninder-bltr.github.io/dev-tool-hub/)

**No installation needed!** Just open in your browser and start coding.

---

## ✨ Features Overview

### 📋 JSON Tool Editor
| Feature | Description |
|---------|-------------|
| **JSON Formatter** | Pretty-print JSON with customizable indentation |
| **JSON Validator** | Real-time validation with clear error messages & line numbers |
| **JSON Minifier** | Remove whitespace for production-ready payloads |
| **JSON Diff** | Side-by-side comparison with visual highlighting of changes |
| **Tree View** | Interactive collapsible tree representation of JSON structure |
| **CSV ↔ JSON Converter** | Bidirectional conversion with preview and error handling |
| **Find & Replace** | Search within JSON with regex support |
| **Import/Export** | Upload `.json` files or download formatted results |

### 🔤 Text Diff Checker
- Side-by-side text comparison
- Git-style highlighting (additions in green, deletions in red)
- Line-by-line and character-level diff detection
- Copy diff results or download as text file
- Supports large documents with smooth scrolling

### 🔐 Base64 Converter
| Mode | Functionality |
|------|--------------|
| **Encode** | Convert text or files to Base64 format |
| **Decode** | Decode Base64 strings back to readable text |
| **Charset Support** | UTF-8, ASCII, ISO-8859-1 encoding options |
| **File Upload** | Drag & drop or browse to encode files |
| **Live Mode** | Real-time conversion as you type |
| **Copy/Download** | One-click copy or download results |

### ⏱️ Epoch Calculator
- Convert between Unix timestamps (seconds/milliseconds) and human-readable dates
- Interactive calendar with date/time picker
- Analog + digital clock display
- Multi-timezone support (UTC, EST, PST, IST, JST, and more)
- Quick actions: Set to Now, Midnight, Noon
- Copy formatted dates in multiple formats (ISO, UTC, Local)

### 🎨 Color Tools
| Tool | Capabilities |
|------|-------------|
| **Color Picker** | Visual HSL/HSV picker, HEX/RGB/HSL input, alpha channel support |
| **Format Converter** | Real-time conversion between HEX, RGB, HSL, CMYK |
| **Gradient Builder** | Create linear gradients with draggable stops, angle control, CSS/SCSS export |
| **Palette Manager** | Save, name, reorder, and persist color palettes in localStorage |
| **Tints & Shades** | Generate 0-100% lightness scale for any color |
| **Export Options** | CSS variables, SCSS, JSON, Tailwind config snippets |

---

## 🎯 Why Use DevTools Hub?

✅ **All tools in one place** — No more tab switching between utilities  
✅ **Zero installation** — Works instantly in any modern browser  
✅ **Privacy-first** — All processing happens client-side; your data never leaves your browser  
✅ **Responsive design** — Works on desktop, tablet, and mobile  
✅ **Dark/Light theme** — Toggle anytime; preference persists across sessions  
✅ **Keyboard accessible** — Full keyboard navigation and shortcuts  
✅ **Copy-friendly** — One-click copy for all outputs  
✅ **Offline capable** — Works without internet after initial load (PWA-ready)

---

## 🛠️ Tech Stack

```
Frontend
├── React 18 + Hooks
├── Ace Editor (JSON editing)
├── tinycolor2 (color conversions)
├── date-fns + date-fns-tz (date/epoch handling)
├── React Icons (Feather-style icons)
└── CSS Variables + Flexbox/Grid

Architecture
├── Context API for global state (theme, active tool)
├── localStorage for persistence (palettes, preferences)
├── Modular component structure
└── Debounced validation for performance

Build
├── Create React App (CRA)
├── ESLint + Prettier for code quality
└── Optimized production build
```

---

## 📦 Local Development (Optional)

If you want to run or contribute locally:

```bash
# Clone the repository
git clone https://github.com/maninder-bltr/devtools-hub.git
cd devtools-hub

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Lint code
npm run lint
```

**Environment Requirements:**
- Node.js 16+ 
- npm 8+ or yarn 1.22+

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Available In |
|----------|--------|--------------|
| `Ctrl/Cmd + S` | Save/Format | JSON Editor |
| `Ctrl/Cmd + F` | Find & Replace | JSON Editor |
| `Ctrl/Cmd + Shift + C` | Copy Output | All Tools |
| `Ctrl/Cmd + Enter` | Convert/Apply | Base64, Epoch |
| `N` | Set to Now | Epoch Calculator |
| `M` | Set to Midnight | Epoch Calculator |
| `T` | Toggle Theme | Global |

---

## 🌐 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Chrome/Safari | Latest | ✅ Responsive |

---

## 🔒 Privacy & Security

- 🔐 **No server processing**: All conversions happen in your browser
- 🗄️ **Local storage only**: Palettes and preferences stay on your device
- 🚫 **No tracking**: No analytics, cookies, or user identification
- 🌐 **HTTPS enforced**: Secure connection when deployed

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

**Contribution Guidelines:**
- Follow existing code style (ESLint/Prettier config included)
- Add tests for new features when applicable
- Update documentation for user-facing changes
- Keep PRs focused and well-described

---

## 🐛 Reporting Issues

Found a bug or have a feature request?

1. Check existing [Issues](link-to-issues) first
2. Use the issue template for bug reports or feature requests
3. Include: browser, OS, steps to reproduce, and expected vs actual behavior

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 DevTools Hub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [Ace Editor](https://ace.c9.io/) for powerful code editing
- [tinycolor2](https://github.com/bgrins/TinyColor) for color utilities
- [date-fns](https://date-fns.org/) for date handling
- [React Icons](https://react-icons.github.io/react-icons/) for consistent iconography
- All contributors and users who help make this tool better

---

> 💡 **Pro Tip**: Bookmark this tool! It's your Swiss Army knife for everyday development tasks.

**Made with ❤️ for developers, by developers.** 🚀
