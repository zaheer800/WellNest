/**
 * WellNest Sprite Sheet Utility — UI icons only
 *
 * Source file: /icons/wellnest-icon.png  (1254 × 1254 px)
 *
 * This utility handles only the UI line-icon row at the bottom of the sheet.
 * App-icon display (splash, login, onboarding) uses individual pre-exported
 * PNGs in /public/icons/ via the WellNestIcon component — no cropping needed.
 *
 *  ┌────────────────────────────────────────────────────────────┐
 *  │  LIGHT SECTION — UI icon set row                          │
 *  │  (Reports / Insights / Timeline /                         │
 *  │   Medications / Symptoms / Family)                        │
 *  │  y≈1141, each icon ≈31×31 px, spaced ~57 px apart        │
 *  │  x: 25   82   139   196   253   310                       │
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
 * UI line-icons from the "Icon Set" section of the sprite sheet.
 * Use in navigation tabs, cards, or anywhere a small icon is needed.
 */
export const SPRITES = {
  uiReports:     { x:  25, y: 1141, w: 31, h: 31 },
  uiInsights:    { x:  82, y: 1141, w: 31, h: 31 },
  uiTimeline:    { x: 139, y: 1141, w: 31, h: 31 },
  uiMedications: { x: 196, y: 1141, w: 31, h: 31 },
  uiSymptoms:    { x: 253, y: 1141, w: 31, h: 31 },
  uiFamily:      { x: 310, y: 1141, w: 31, h: 31 },
} as const satisfies Record<string, SpriteFrame>

export type UiSpriteName = keyof typeof SPRITES
/** @deprecated Use UiSpriteName */
export type SpriteName = UiSpriteName

// ─── Style calculator ───────────────────────────────────────────────────────

/**
 * Returns an inline style object that renders the named sprite frame
 * at `displaySize` pixels wide.  Height is scaled proportionally.
 *
 * Usage:
 *   <span style={spriteStyle('uiMedications', 24)} role="img" aria-label="Medications" />
 */
export function spriteStyle(name: UiSpriteName, displaySize: number): CSSProperties {
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
