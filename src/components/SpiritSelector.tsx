import { useState, useRef, useEffect } from 'react'
import { Spirit } from '../data'
import { Ghost, ChevronDown } from 'lucide-react'

interface SpiritSelectorProps {
  spirits: Spirit[]
  selected: Spirit
  onSelect: (spirit: Spirit) => void
  showPrice?: boolean
  onOpenChange?: (open: boolean) => void
  dropdownMode?: 'overlay' | 'push'
}

export default function SpiritSelector({ spirits, selected, onSelect, showPrice = false, onOpenChange, dropdownMode = 'overlay' }: SpiritSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onOpenChange?.(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* 选中状态展示卡片 */}
      <div 
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev
            onOpenChange?.(next)
            return next
          })
        }}
        className={`relative z-20 w-full bg-[#FFF9F0] border-2 ${isOpen ? 'border-orange-400' : 'border-[#FFE4C4]'} rounded-xl overflow-hidden shadow-sm hover:border-orange-300 transition-colors cursor-pointer`}
      >
        <div className="p-3 flex items-center gap-4">
          {/* 缩略图 */}
          <div className="w-14 h-14 bg-white rounded-xl border border-[#FFE4C4] flex items-center justify-center p-1.5 shadow-sm shrink-0">
            {selected?.image ? (
              <img src={selected.image} alt={selected.name} className="w-full h-full object-contain" />
            ) : (
              <Ghost className="w-6 h-6 text-orange-300" />
            )}
          </div>
          {/* 详细信息 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-[#5A3D2C] text-lg">{selected?.name}</h3>
              <div className="flex gap-1">
                {(selected?.elementTypes?.length ? selected.elementTypes : [selected?.elementType]).map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFF3E8] text-orange-600 border border-[#FFE4C4] font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-[#5A3D2C]/60 font-bold flex items-center gap-1">
              <span>点击切换目标</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* 自定义下拉列表 */}
      {isOpen && (
        <div
          className={`w-full mt-2 bg-white border border-[#FFE4C4] rounded-xl shadow-xl max-h-[300px] overflow-y-auto roco-scrollbar pr-1 animate-in fade-in slide-in-from-top-2 duration-200 ${
            dropdownMode === 'overlay' ? 'absolute z-50' : 'relative z-10'
          }`}
        >
          <div className="p-2 space-y-1">
            {spirits.map(spirit => {
              const isSelected = spirit.id === selected.id
              return (
                <div
                  key={spirit.id}
                  onClick={() => {
                    onSelect(spirit)
                    setIsOpen(false)
                    onOpenChange?.(false)
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'hover:bg-[#FFF9F0] text-[#5A3D2C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 列表中的小头像 */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center p-0.5 shrink-0 ${isSelected ? 'bg-white/20' : 'bg-[#FFF9F0] border border-[#FFE4C4]'}`}>
                      {spirit.image ? (
                        <img src={spirit.image} alt={spirit.name} className="w-full h-full object-contain" />
                      ) : (
                        <Ghost className="w-4 h-4 opacity-50" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{spirit.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                        isSelected 
                          ? 'bg-white/20 border-white/30 text-white' 
                          : 'bg-[#FFF3E8] border-[#FFE4C4] text-orange-600'
                      }`}>
                        {spirit.elementType}
                      </span>
                    </div>
                  </div>
                  
                  {/* 收益计算器页面需要的价格显示 */}
                  {showPrice && (
                    <span className={`text-xs font-bold ${isSelected ? 'text-white/90' : 'text-orange-500'}`}>
                      污染 {(spirit.pollutedBasePrice / 10000).toFixed(1)}万
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
