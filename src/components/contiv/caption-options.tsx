import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from 'cn'

export type Position = 'bottom' | 'middle' | 'top'
export type CaptionSize = 'small' | 'medium' | 'large'

export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFE14D' },
  { name: 'Green', value: '#39FF88' },
  { name: 'Cyan', value: '#4DE1FF' },
  { name: 'Pink', value: '#FF5CA8' },
]

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as T)}
        className="w-full"
        aria-label={label}
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o}
            value={o}
            className="min-w-0 flex-1 px-2 text-sm capitalize"
          >
            {o}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export function CaptionOptions({
  showColor,
  color,
  onColor,
  position,
  onPosition,
  size,
  onSize,
}: {
  showColor: boolean
  color: string
  onColor: (v: string) => void
  position: Position
  onPosition: (v: Position) => void
  size: CaptionSize
  onSize: (v: CaptionSize) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {showColor && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Highlight color</p>
          <div className="flex flex-wrap gap-2">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.name}
                title={c.name}
                onClick={() => onColor(c.value)}
                className={cn(
                  'swatch h-9 w-9 rounded-full border-2 focus-visible:outline-none',
                  color === c.value
                    ? 'is-sel border-transparent ring-2 ring-foreground/60 ring-offset-2 ring-offset-background'
                    : 'border-white/40',
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
        <OptionGroup
          label="Position"
          options={['bottom', 'middle', 'top']}
          value={position}
          onChange={onPosition}
        />
        <OptionGroup
          label="Size"
          options={['small', 'medium', 'large']}
          value={size}
          onChange={onSize}
        />
      </div>
    </div>
  )
}
