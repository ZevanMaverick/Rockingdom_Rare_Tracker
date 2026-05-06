import { useId, useMemo } from 'react'

export default function ArcProgress({
  label,
  subLabel,
  value,
  max,
  gradientFrom,
  gradientTo
}: {
  label: string
  subLabel?: string
  value: number
  max: number
  gradientFrom: string
  gradientTo: string
}) {
  const clamped = Math.max(0, Math.min(max, value))
  const percent = max > 0 ? (clamped / max) * 100 : 0
  const percentText = `${Math.round(percent)}%`

  const { r, c, arc } = useMemo(() => {
    const r = 34
    const c = 2 * Math.PI * r
    const arc = c * 0.76
    return { r, c, arc }
  }, [])

  const dashArray = `${arc} ${c}`
  const dashOffset = arc * (1 - clamped / max)
  const reactId = useId()
  const id = useMemo(() => `roco_arc_${reactId.replace(/:/g, '_')}_${label}`, [reactId, label])

  return (
    <div className="roco-glass rounded-2xl border border-white/15 px-3 pt-3 pb-2">
      <div className="relative w-full aspect-square flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
          <g transform="rotate(135 50 50)">
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              strokeDashoffset={0}
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={`url(#${id})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 400ms ease' }}
            />
          </g>
        </svg>

        <div className="text-center">
          <div className="text-2xl font-black text-yellow-200 leading-none">{percentText}</div>
          <div className="mt-1 text-[11px] font-black text-white/75">{label}</div>
          {subLabel && <div className="text-[10px] font-bold text-white/45">{subLabel}</div>}
        </div>
      </div>

      <div className="mt-2">
        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white/30 shadow-sm"
            style={{
              left: `calc(${percent}% - 6px)`,
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
            }}
          />
        </div>
      </div>
    </div>
  )
}
