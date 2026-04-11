import { spriteStyle, type SpriteName } from '@/utils/sprite'

interface WellNestIconProps {
  /** Which region of the sprite sheet to show. Defaults to 'appIcon'. */
  sprite?: SpriteName
  /** Display width in pixels. Height is scaled proportionally. */
  size?: number
  className?: string
  /** Accessible label. Defaults to 'WellNest'. */
  label?: string
}

/**
 * Renders a region of the WellNest sprite sheet using CSS background-position.
 * One HTTP request serves all icon sizes and variants.
 *
 * Examples:
 *   <WellNestIcon size={80} />                          // rounded app icon, 80px
 *   <WellNestIcon sprite="logoFlat" size={120} />       // flat mark on light bg
 *   <WellNestIcon sprite="uiMedications" size={24} />   // small UI icon
 */
export default function WellNestIcon({
  sprite = 'appIcon',
  size = 80,
  className = '',
  label = 'WellNest',
}: WellNestIconProps) {
  return (
    <span
      style={spriteStyle(sprite, size)}
      className={className}
      role="img"
      aria-label={label}
    />
  )
}
