import { useState, useMemo, useEffect } from 'react'
import SpiritCard from '../components/SpiritCard'
import ShareButton, { PosterData } from '../components/ShareButton'
import { SPIRITS } from '../data'

export default function SpiritList() {
  const [selectedElement, setSelectedElement] = useState<string>('全部')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [collected, setCollected] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('roco_collected_spirits')
    if (saved) {
      try {
        return new Set(JSON.parse(saved))
      } catch (e) {
        return new Set()
      }
    }
    return new Set()
  })

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('roco_collected_spirits', JSON.stringify(Array.from(collected)))
  }, [collected])

  const elements = useMemo(() => {
    const allElements = new Set<string>()
    SPIRITS.forEach(s => {
      if (s.isSpecial) return
      if (s.elementTypes?.length) {
        s.elementTypes.forEach(e => allElements.add(e))
      } else {
        allElements.add(s.elementType)
      }
    })
    return ['全部', ...Array.from(allElements)]
  }, [])

  const filteredSpirits = useMemo(() => {
    let result = SPIRITS.filter(spirit => {
      if (spirit.isSpecial) return false // 隐藏特殊精灵，因为它们无法收集
      const types = spirit.elementTypes?.length ? spirit.elementTypes : [spirit.elementType]
      const matchElement = selectedElement === '全部' || types.includes(selectedElement)
      const matchSearch = spirit.name.includes(searchKeyword)
      return matchElement && matchSearch
    })

    // 排序逻辑：未收集的排在前面，已收集的排在后面
    result.sort((a, b) => {
      const aCollected = collected.has(a.id)
      const bCollected = collected.has(b.id)
      if (aCollected === bCollected) return 0
      return aCollected ? 1 : -1
    })

    return result
  }, [selectedElement, searchKeyword, collected])

  const toggleCollected = (id: string) => {
    setCollected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const shareData: PosterData = {
    type: 'collection',
    title: '洛克王国异色收集',
    collectedCount: collected.size,
    totalCount: SPIRITS.filter(s => !s.isSpecial).length
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-black text-orange-950 tracking-wide">精灵图鉴</h1>
        <ShareButton data={shareData} />
      </div>

      {/* === 顶部：收集进度 === */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#FFE4C4]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-orange-950">收集进度</span>
          <span className="text-lg font-black text-orange-600">
            {collected.size} <span className="text-sm text-gray-400">/ {SPIRITS.filter(s => !s.isSpecial).length}</span>
          </span>
        </div>
        <div className="h-3 bg-[#FFF9F0] rounded-full overflow-hidden border border-[#FFE4C4]">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
            style={{ width: `${(collected.size / SPIRITS.filter(s => !s.isSpecial).length) * 100}%` }}
          />
        </div>
      </div>

      {/* === 过滤与搜索 === */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#FFE4C4]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索精灵名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FFF9F0] border-2 border-[#FFE4C4] rounded-xl focus:ring-0 focus:border-orange-400 text-orange-950 placeholder-orange-900/40 font-bold"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {elements.map(element => (
              <button
                key={element}
                onClick={() => setSelectedElement(element)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  selectedElement === element
                    ? 'bg-orange-500 text-white shadow-orange-500/30'
                    : 'bg-[#FFE4C4] text-orange-900 hover:bg-orange-300'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {element !== '全部' && (
                    <img
                      src={`/icons/${element}.png`}
                      alt={element}
                      className="w-4 h-4 drop-shadow-sm"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  {element}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === 精灵网格 === */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-4">
        {filteredSpirits.map(spirit => (
          <SpiritCard
            key={spirit.id}
            spirit={spirit}
            collected={collected.has(spirit.id)}
            onClick={() => toggleCollected(spirit.id)}
          />
        ))}
      </div>
    </div>
  )
}
