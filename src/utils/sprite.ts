/**
 * WellNest Sprite Sheet Utility
 *
 * Source file: /icons/wellnest-icon.png  (1254 × 1254 px)
 *
 * Layout of the sheet (all coordinates in source pixels):
 *
 *  ┌────────────────────────────────────────────────────────────┐
 *  │  DARK SECTION — app icon at various sizes                  │
 *  │                                                            │
 *  │  [1024×1024]  [512×512]  [192×192]     [logo flat / no bg]│
 *  │  x=38,y=50    x=268,y=66  x=451,y=79   x=614,y=18         │
 *  │  w=236,h=236  w=161,h=161 w=117,h=117  w=329,h=329        │
 *  │                                                            │
 *  │  [144×144]  [96×96]  [72×72]  [48×48]                     │
 *  │  x=38,y=330  x=166,y=344  x=260,y=352  x=339,y=357        │
 *  │  w=108,h=108  w=74,h=74   w=55,h=55    w=44,h=44          │
 *  │                                                            │
 *  ├────────────────────────────────────────────────────────────┤
 *  │  LIGHT SECTION — design language reference                 │
 *  │                                                            │
 *  │  UI icon set row  (Reports / Insights / Timeline /         │
 *  │                    Medications / Symptoms / Family)        │
 *  │  y≈1141, each icon ≈31×31 px, spaced ~57 px apart         │
 *  │  x: 25   82   139   196   253   310                        │
 *  └────────────────────────────────────────────────────────────┘
 *
 * ADJUSTING COORDINATES
 * If an icon appears slightly off, tweak the x/y/w/h values below.
 * Run `npm run dev` and inspect the rendered element to verify.
 */

import type { CSSProperties } from 'react'

// ─── Sheet constants ────────────────────────────────────────────────────────

export const SPRITE_URL = '/icons/wellnest-icon.png'
export const SHEET_W    = 1254
export const SHEET_H    = 1254

// ─── Frame definitions ──────────────────────────────────────────────────────

export interface SpriteFrame {
  x: number  // left edge in source sheet (px)
  y: number  // top edge in source sheet (px)
  w: number  // width in source sheet (px)
  h: number  // height in source sheet (px)
}

/**
 * Named frames within the sprite sheet.
 *
 * App icons (dark rounded-square bg):
 *   appIcon  — use for UI logo marks (login, splash, onboarding)
 *   appIcon48 — use for tiny badges or favicons
 *
 * logoFlat — full-colour mark without the dark background square;
 *            use on light or branded backgrounds
 *
 * UI icons — line icons from the "Icon Set" section of the sheet;
 *            use in navigation, cards, or anywhere a small icon is needed
 */
export const SPRITES = {
  // ── App icon with dark rounded-square background ─────────────────────────
  appIcon:    { x:  38, y:  50, w: 236, h: 236 },  // 1024-size region (best quality)
  appIcon512: { x: 268, y:  66, w: 161, h: 161 },  // 512-size region
  appIcon192: { x: 451, y:  79, w: 117, h: 117 },  // 192-size region
  appIcon144: { x:  38, y: 330, w: 108, h: 108 },
  appIcon96:  { x: 166, y: 344, w:  74, h:  74 },
  appIcon72:  { x: 260, y: 352, w:  55, h:  55 },
  appIcon48:  { x: 339, y: 357, w:  44, h:  44 },

  // ── Full-colour mark (no background square) ───────────────────────────────
  logoFlat:   { x: 614, y:  18, w: 329, h: 329 },

  // ── UI icon set (line icons, light section of sheet) ─────────────────────
  uiReports:     { x:  25, y: 1141, w: 31, h: 31 },
  uiInsights:    { x:  82, y: 1141, w: 31, h: 31 },
  uiTimeline:    { x: 139, y: 1141, w: 31, h: 31 },
  uiMedications: { x: 196, y: 1141, w: 31, h: 31 },
  uiSymptoms:    { x: 253, y: 1141, w: 31, h: 31 },
  uiFamily:      { x: 310, y: 1141, w: 31, h: 31 },
} as const satisfies Record<string, SpriteFrame>

export type SpriteName = keyof typeof SPRITES

// ─── Style calculator ───────────────────────────────────────────────────────

/**
 * Returns an inline style object that renders the named sprite frame
 * at `displaySize` pixels wide.  Height is scaled proportionally.
 *
 * Usage:
 *   <span style={spriteStyle('appIcon', 80)} role="img" aria-label="WellNest" />
 */
export function spriteStyle(name: SpriteName, displaySize: number): CSSProperties {
  const frame = SPRITES[name]
  const scale = displaySize / frame.w

  return {
    display:             'inline-block',
    backgroundImage:     `url('${SPRITE_URL}')`,
    backgroundRepeat:    'no-repeat',
    backgroundSize:      `${Math.round(SHEET_W * scale)}px ${Math.round(SHEET_H * scale)}px`,
    backgroundPosition:  `${Math.round(-frame.x * scale)}px ${Math.round(-frame.y * scale)}px`,
    width:               `${displaySize}px`,
    height:              `${Math.round(frame.h * scale)}px`,
    flexShrink:          0,
  }
}
