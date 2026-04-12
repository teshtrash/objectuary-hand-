# Objectuary — Agent Instructions

## Project Overview

**Objectuary** is an interactive cemetery-themed web art project. Users enter through animated gates, explore a map of 20 tombs, click to accumulate "Attention," view custom objectuary papers, and scan them to reveal predetermined results (burial, cremation, organ donation, or preservation). Each tomb has its own hand-designed artwork.

**Tech stack:** React 19 + Vite 8 + GSAP + Framer Motion + Express API backend

---

## Quick Start

```bash
npm install
npm start          # starts both Vite (port 5173) and Express API (port 3001)
```

Or run separately:

```bash
npm run server     # Express API on port 3001
npm run dev        # Vite dev server on port 5173 (proxies /api → 3001)
```

Build for production:

```bash
npm run build      # outputs to dist/
```

---

## Architecture

```
objectuary/
├── server.js                  # Express API — persists tomb click counts
├── data/attention.json        # JSON store for click counts (auto-created)
├── vite.config.js             # Vite config with /api proxy to :3001
├── src/
│   ├── App.jsx                # Root component, screen routing
│   ├── main.jsx               # Entry point
│   ├── assets.js              # ⭐ IMAGE MANIFEST — all image paths
│   ├── audio.js               # ⭐ AUDIO MANIFEST — all sound paths
│   ├── data/tombs.js          # Tomb data: positions, content, scan results
│   ├── hooks/
│   │   ├── useAttention.js    # API hook for click persistence
│   │   └── useAudio.js        # Resilient audio player (play/loop/stop)
│   ├── screens/               # All screen components + CSS
│   │   ├── GateScreen.*       # Animated gate entrance
│   │   ├── ObjectuaryScreen.* # Main cemetery map + paper + scanner
│   │   ├── OpeningScreen.*    # Title/intro screen
│   │   └── ...                # Other screens
│   └── styles/global.css
└── public/
    ├── assets/                # All images
    │   ├── *.png              # UI images (gate, grave bg, scanner, etc.)
    │   └── tombs/             # Per-tomb asset folders
    │       ├── 01/            # Tomb 01 (Palanquin)
    │       │   ├── tomb.png       # Tomb image on the map
    │       │   ├── paper.png      # Objectuary paper (full design PNG)
    │       │   └── scanned.png    # Fully-scanned result image
    │       ├── 02/ ... 20/    # Tombs 02–20 (same structure)
    └── audio/                 # All sound files
        ├── background-soundtrack.mp3
        ├── gate-open.mp3
        ├── click.mp3
        ├── zoom-in.mp3
        ├── zoom-out.mp3
        ├── grave-hover.mp3
        ├── paper-hovering.mp3
        ├── scanner-hovering.mp3
        ├── scanner-loop.mp3
        ├── scanning-done.mp3
        ├── burial.mp3
        ├── cremation.mp3
        ├── organ-donation.mp3
        └── preservation.mp3
```

---

## ⭐ Asset Replacement System (Important!)

The entire project is designed so that **replacing PNGs or MP3s alone updates the site** — no code changes needed.

### Replacing Tomb Images

Each tomb has a folder at `public/assets/tombs/{NN}/` (01 through 20) containing:

| File           | Purpose                                           |
| -------------- | ------------------------------------------------- |
| `tomb.png`     | The tombstone shown on the cemetery map            |
| `paper.png`    | The full objectuary paper (custom-designed PNG with transparent bg, overlaid text included) |
| `scanned.png`  | The fully-scanned result image shown after scanning |

**To replace:** Drop your new PNG into the folder with the same filename. The site picks it up automatically.

### Replacing UI Images

All UI images live in `public/assets/`. The mapping is in `src/assets.js`:

| Export                  | File in public/assets/         |
| ----------------------- | ------------------------------ |
| `GATE_BG`               | gate background                |
| `GRAVE_BG`              | cemetery map background        |
| `OBJECTUARY_PAPER`      | blank paper template           |
| `SCANNER` / `SCANNER_ON`| scanner device (off/on states) |
| `PALANQUIN`             | palanquin tomb image           |
| `SCAN_RESULT_*`         | generic scan result overlays   |

If you add a new image, register it in `src/assets.js`.

### Replacing Audio

Drop MP3 files into `public/audio/` with the correct filename. The mapping is in `src/audio.js`. The audio system is **resilient** — if a file is missing or broken, it silently skips without crashing.

| Sound Key             | File                        | Behavior     |
| --------------------- | --------------------------- | ------------ |
| `AMBIENT_SOUNDTRACK`  | background-soundtrack.mp3   | Loops        |
| `GATE_OPEN`           | gate-open.mp3               | One-shot     |
| `CLICK`               | click.mp3                   | One-shot     |
| `ZOOM_IN` / `ZOOM_OUT`| zoom-in/out.mp3            | One-shot     |
| `GRAVE_HOVER`         | grave-hover.mp3             | One-shot     |
| `PAPER_HOVERING`      | paper-hovering.mp3          | One-shot     |
| `SCANNER_HOVERING`    | scanner-hovering.mp3        | One-shot     |
| `SCANNER_LOOP`        | scanner-loop.mp3            | Loops        |
| `SCANNING_DONE`       | scanning-done.mp3           | One-shot     |
| `burial`              | burial.mp3                  | Loops (result)|
| `cremation`           | cremation.mp3               | Loops (result)|
| `organ-donation`      | organ-donation.mp3          | Loops (result)|
| `preservation`        | preservation.mp3            | Loops (result)|

---

## Tomb Data

Defined in `src/data/tombs.js`. Each tomb has:

- **Position**: Deterministic grid layout (5 cols × 4 rows) with seeded jitter
- **Scan result**: Predetermined — `scanResult` field is one of: `burial`, `cremated`, `organ-donation`, `preserved`
- **Palanquin**: Tomb index 0 (folder `01`) is the special palanquin, scan result = `cremated`
- **Others**: Cycle through results via `i % 4`

To change a tomb's scan result, edit the `scanResult` field in `tombs.js`.

---

## Attention System

Clicks on tombs increment an "Attention" counter persisted on the server:

- **API**: `GET /api/attention` (all counts) | `POST /api/attention/:id` (increment one)
- **Storage**: `data/attention.json` — simple `{ "tomb-0": 5, "tomb-1": 3, ... }`
- **Visual**: Tombs grow wider based on click count (8% per click, max 160%)
- **Animation**: Green "+1 Attention" floats up on each click

---

## Key Conventions

1. **All image/audio paths go through manifests** — `src/assets.js` and `src/audio.js`. Never hardcode paths in components.
2. **The audio hook (`useAudio`) is resilient** — missing files won't crash anything. Use `play()` for one-shots, `loop()` for continuous, `stop()` to halt.
3. **Tomb folders are zero-padded** — `01` through `20`, not `1` through `20`.
4. **Paper images are complete designs** — each `paper.png` is a full custom-designed objectuary paper with text baked in as a single PNG (not text rendered over a blank template).
5. **Scan result sounds loop** until the user returns to the cemetery map.
6. **No git repo initialized yet** — this project has no version control set up.

---

## Common Tasks

### Add a new tomb design
1. Replace `public/assets/tombs/{NN}/tomb.png` with the new tombstone image
2. Replace `public/assets/tombs/{NN}/paper.png` with the custom objectuary paper
3. Replace `public/assets/tombs/{NN}/scanned.png` with the scanned result image

### Change a tomb's scan result
Edit `src/data/tombs.js` — find the tomb by index and change its `scanResult` value.

### Add a new sound
1. Drop the MP3 into `public/audio/`
2. Add an export in `src/audio.js`
3. Import and use `play()` or `loop()` from `useAudio` in the relevant component

### Change tomb content text
Edit `src/data/tombs.js` — each tomb has a `content` object with `title`, `subtitle`, and `body` (though text is now baked into paper.png for custom tombs).
