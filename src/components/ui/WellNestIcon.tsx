import { spriteStyle, type UiSpriteName } from '@/utils/sprite'

// Available pre-exported individual icon sizes (in public/icons/)
const ICON_SIZES = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512] as const

/** Pick the smallest pre-exported PNG that is >= displaySize (or the largest if none qualify). */
function pickIconSrc(displaySize: number): string {
  const match = ICON_SIZES.find((s) => s >= displaySize) ?? 512
  return `/icons/icon-${match}x${match}.png`
}

interface AppIconProps {
  variant?: 'app'
  size?: number
  className?: string
  label?: string
}

interface UiIconProps {
  variant: 'ui'
  sprite: UiSpriteName
  size?: number
  className?: string
  label?: string
}

type WellNestIconProps = AppIconProps | UiIconProps

/**
 * Renders the WellNest icon.
 *
 * variant="app"  (default) — uses a pre-exported transparent PNG, ideal for
 *   splash screens, login headers, onboarding, and PWA-style display.
 *   Pass `size` in pixels; the nearest pre-exported size is served automatically.
 *
 * variant="ui" — clips a UI line-icon from the sprite sheet, ideal for
 *   navigation tabs, cards, and small inline icons.
 *   Requires a `sprite` prop (e.g. "uiReports", "uiMedications").
 *
 * Examples:
 *   <WellNestIcon size={80} />                              // 80px app icon
 *   <WellNestIcon variant="ui" sprite="uiMedications" size={24} />
 */
export default function WellNestIcon(props: WellNestIconProps) {
  const { size = 80, className = '', label = 'WellNest' } = props

  if (props.variant === 'ui') {
    return (
      <span
        style={spriteStyle(props.sprite, size)}
        className={className}
        role="img"
        aria-label={label}
      />
    )
  }

  return (
    <img
      src={pickIconSrc(size)}
      width={size}
      height={size}
      alt={label}
      className={className}
      draggable={false}
    />
  )
}
