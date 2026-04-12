/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │                     OBJECTUARY — IMAGE MANIFEST                     │
 * │                                                                     │
 * │  Every image used by the site is registered here. To replace any    │
 * │  image, simply swap the PNG file in public/assets/ and (if the      │
 * │  filename changed) update the path below. No other files need to    │
 * │  be touched.                                                        │
 * │                                                                     │
 * │  All paths are relative to the public/ folder (served at root).     │
 * └──────────────────────────────────────────────────────────────────────┘
 */

// ── Backgrounds ──────────────────────────────────────────────────────
export const GATE_BG = '/assets/Gate.png'
export const GRAVE_BG = '/assets/GRAVE BG 1.png'

// ── UI elements ──────────────────────────────────────────────────────
export const OBJECTUARY_ICON = '/assets/objectuary icon 1.png'
export const OBJECTUARY_PAPER = '/assets/objectuary paper 1.png'
export const SCANNER = '/assets/scanner 1.png'
export const SCANNER_ON = '/assets/scanner turned on 1.png'

// ── Objects ──────────────────────────────────────────────────────────
export const PALANQUIN = '/assets/palanquin 1.png'
export const PALANQUIN_SEAL = '/assets/palanquin seal 1.png'

// ── Fully scanned result images ───────────────────────────────────────
export const SCAN_RESULT_BURIAL = '/assets/fully scanned-burial.png'
export const SCAN_RESULT_CREMATED = '/assets/fully scanned-cremeted.png'
export const SCAN_RESULT_ORGAN_DONATION = '/assets/fully scanned-organ donation.png'
export const SCAN_RESULT_PRESERVED = '/assets/fully scanned-persevation.png'

export const SCAN_RESULT_IMAGES = {
  burial: SCAN_RESULT_BURIAL,
  cremated: SCAN_RESULT_CREMATED,
  'organ-donation': SCAN_RESULT_ORGAN_DONATION,
  preserved: SCAN_RESULT_PRESERVED,
}

// ── Tombs (20 individual graves) ─────────────────────────────────────
// Folder structure: public/assets/tombs/01/ … 20/
//   tomb.png    — the grave image shown on the map and hover views
//   scanned.png — the fully-scanned result image shown after scanning
// To replace a tomb's art, just swap the PNGs in its folder.
export const TOMB_COUNT = 20
export const tombImage = (index) => {
  const num = String(index + 1).padStart(2, '0')
  return `/assets/tombs/${num}/tomb.png`
}
export const tombPaperImage = (index) => {
  const num = String(index + 1).padStart(2, '0')
  return `/assets/tombs/${num}/paper.png`
}
export const tombScannedImage = (index) => {
  const num = String(index + 1).padStart(2, '0')
  return `/assets/tombs/${num}/scanned.png`
}
