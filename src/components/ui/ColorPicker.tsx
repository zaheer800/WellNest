import React from 'react'

interface ColorOption {
  id: string
  label: string
  hex: string
}

interface ColorPickerProps {
  colors: ColorOption[]
  value: string | null
  onChange: (id: string) => void
  className?: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({ colors, value, onChange, className = '' }) => {
  const selected = colors.find((c) => c.id === value) ?? null

  return (
    <div className={className}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {colors.map((color) => {
          const isSelected = color.id === value
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onChange(color.id)}
              title={color.label}
              className={[
                'flex-shrink-0 w-9 h-9 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400',
                isSelected ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'hover:scale-105',
              ].join(' ')}
              style={{ backgroundColor: color.hex }}
              aria-pressed={isSelected}
              aria-label={color.label}
            />
          )
        })}
      </div>
      {selected && (
        <p className="mt-1.5 text-xs font-medium text-gray-600">{selected.label}</p>
      )}
    </div>
  )
}

export default ColorPicker
