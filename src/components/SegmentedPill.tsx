import { useMemo } from 'react'

type SegmentedItem<T extends string> = {
  key: T
  label: string
}

export default function SegmentedPill<T extends string>({
  items,
  activeKey,
  onChange
}: {
  items: Array<SegmentedItem<T>>
  activeKey: T
  onChange: (key: T) => void
}) {
  const keySet = useMemo(() => new Set(items.map(i => i.key)), [items])

  return (
    <div className="roco-pill p-1 w-full flex gap-1">
      {items.map((item) => {
        const isActive = item.key === activeKey
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              if (!keySet.has(item.key)) return
              onChange(item.key)
            }}
            className={`flex-1 h-10 rounded-full text-sm font-black transition-colors ${
              isActive
                ? 'bg-yellow-300/90 text-[#1E1B16] shadow-[0_10px_24px_rgba(0,0,0,0.20)]'
                : 'text-white/75 hover:text-yellow-200 hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

