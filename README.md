# 🚀 AI Effectiveness & Token Value-Maxing: 1-Hour Masterclass

A pragmatic, engineering-focused 1-hour workshop and interactive slide deck designed to transform how software engineers use AI coding tools (specifically **Cursor**, frontier models, and agentic workflows).

---

## 📂 Deliverables & Quick Start

| File / Folder | Description | Quick Access |
|---|---|---|
| **[`index.html`](file:///Users/rajatbansal/repo/AI-Effectiveness/index.html)** | **Main Interactive Slide Deck** (14 Slides, Live Token Calculator, Light/Dark Theme, Synced Timer) | Open directly in any browser |
| **[`notes.html`](file:///Users/rajatbansal/repo/AI-Effectiveness/notes.html)** | **Separate Presenter Console** (Private speaker notes, timing cues, next slide preview, synced controls for Teams) | Open or launch via <kbd>N</kbd> in deck |
| **[`slides/`](file:///Users/rajatbansal/repo/AI-Effectiveness/slides)** | **Modular Slide Files** (`01-title.html` through `14-qa-toolkit.html`) for clean editing | Edit individual slides |
| **[`cheatsheet.html`](file:///Users/rajatbansal/repo/AI-Effectiveness/cheatsheet.html)** | **Printable 1-Page Handout** (Shortcuts, Model Matrix, CCAO prompt framework, `.cursor/rules` starter) | Open and click "Print / Save PDF" |
| **[`template.html`](file:///Users/rajatbansal/repo/AI-Effectiveness/template.html)** | Base shell template with navigation, modals, and slide insertion target | Used by `build.js` |
| **[`build.js`](file:///Users/rajatbansal/repo/AI-Effectiveness/build.js)** | Zero-dependency compiler: combines `slides/*.html` into standalone `index.html` | `npm run build` / `npm run watch` |
| **[`styles.css`](file:///Users/rajatbansal/repo/AI-Effectiveness/styles.css)** | Executive Light Theme (default) & Engineering Dark Theme styling | Supports theme toggle |
| **[`app.js`](file:///Users/rajatbansal/repo/AI-Effectiveness/app.js)** | Presentation engine (BroadcastChannel sync, timer, reactive token calculator, prompt copy) | - |

---

## 👥 Presenting in Microsoft Teams (Separate Window Setup)

When presenting this masterclass on **Microsoft Teams**, **Zoom**, or **Google Meet**:

1. Open **[`index.html`](file:///Users/rajatbansal/repo/AI-Effectiveness/index.html)** in your browser.
2. Click **Speaker Notes ↗** in the header or press <kbd>N</kbd>.
3. A separate **Presenter Console window** (`notes.html`) opens on your screen showing your private talking points, target minute goals, next slide preview, and synced timer.
4. In Microsoft Teams, click **Share → Window** and choose **ONLY the presentation deck window** (`index.html`).
5. **Result**: Your audience on Teams sees the clean presentation in full screen with zero distracting notes overlays, while you keep full presenter control, notes, and timing on your private monitor!

---

## 🛠️ Building & Editing Slides

This deck uses a modular architecture so you can edit individual slides without touching a massive HTML file:

```bash
# Compile slides into standalone index.html
npm run build
# Or directly: node build.js

# Auto-rebuild on any slide change (watch mode)
npm run watch
# Or directly: node build.js --watch
```

> **Zero Dependencies**: `index.html` remains 100% self-contained and double-clickable in any browser without needing a local web server!

---

## ⌨️ Presentation Keyboard Shortcuts

- **Advance Slide:** <kbd>→</kbd>, <kbd>Space</kbd>, or <kbd>PageDown</kbd>
- **Previous Slide:** <kbd>←</kbd> or <kbd>PageUp</kbd>
- **Open Presenter Notes Window:** <kbd>N</kbd> (Launches / focuses separate notes window)
- **Toggle In-Page Notes Drawer:** <kbd>Shift</kbd> + <kbd>N</kbd>
- **Slide Overview Grid (TOC):** <kbd>T</kbd>
- **Fullscreen Toggle:** <kbd>F</kbd>
- **Jump to Start / End:** <kbd>Home</kbd> / <kbd>End</kbd>
- **Toggle Timer (Notes Window):** <kbd>P</kbd>

---

## ⏱️ 60-Minute Talk Structure & Agenda

| Time | Slide | Topic | Key Takeaway |
|---|---|---|---|
| **00:00 - 05:00** | **Slide 1 - 2** | The 2M Token Trap & Reality Check | Why infinite chats cause "Lost in the Middle" and slow down responses |
| **05:00 - 15:00** | **Slide 3 - 4** | Cursor Pricing, Model Economics & Interactive Calculator | Match task to model tier (Tab → Composer 2.5 → Sonnet 5 → Opus 5); live calculator demo |
| **15:00 - 22:00** | **Slide 5** | Taming MCP & Agentic Tool Loops | Stop recursive file-scanning loops; the 4 Laws of Agent Control |
| **22:00 - 30:00** | **Slide 6 - 7** | Cursor Modalities & Precision Context (`@` Mastery) | Tab vs Cmd+K vs Cmd+L vs Cmd+I; laser-target `@files` vs blind `@workspace` |
| **30:00 - 38:00** | **Slide 8** | System Prompting with `.cursor/rules/*.mdc` | Automating standards and negative constraints without repeating prompts |
| **38:00 - 48:00** | **Slide 9 - 11** | Real-World Stack Deep Dives | **Java/Spring** (JPA N+1 + Caching), **React/TS** (Async search + Query), **Data** (PySpark skew join + SQL) |
| **48:00 - 54:00** | **Slide 12 - 13** | The CCAO Prompt Framework & 5 Golden Rules | 4 Click-to-copy production templates + Monday Morning action checklist |
| **54:00 - 60:00** | **Slide 14** | Open Q&A & Cheatsheet Handover | Handout distribution & team live troubleshooting |

---

## 💡 The 5 Golden Rules Summary

1. **Reset Chats Ruthlessly (The 3-Turn Rule):** If not resolved in 3 turns, restart with clean context.
2. **Route Models Deliberately:** Tab for typing ($0), Composer 2.5 / Haiku for boilerplate/tests (20%), Sonnet 5 / Grok for features (10%), Opus 5 for hard logic (<5%).
3. **Laser-Target Context:** Reference `@file:L20-50` and `@symbols`. Stop typing `@workspace`.
4. **Bake Standards into `.cursor/rules/`:** Scope by glob (`globs: **/*.tsx`), use negative constraints ("DO NOT").
5. **Steer Agent Loops:** Never let agents spin autonomously without human approval checkpoints.
