import { useState, useMemo, useEffect, useRef } from 'react'
import { SPIRITS, BALL_TYPES } from '../data'
import { Ghost, Target, Play, Pause, RotateCcw, Edit2, Check } from 'lucide-react'
import ShareButton, { PosterData } from '../components/ShareButton'
import SpiritSelector from '../components/SpiritSelector'

type PollutedCountMode = 'elementAndIndividual' | 'mixedOnly' | 'noCount' | 'elementOnly' | 'individualOnly'

export default function Home() {
  const selectableSpirits = useMemo(() => SPIRITS.filter((s) => !s.isSpecial), [])
  const initialSpirit = selectableSpirits[0]

  const loadPersistedState = () => {
    try {
      const rawV2 = localStorage.getItem('roco_home_state_v2')
      if (rawV2) {
        const parsed = JSON.parse(rawV2) as {
          isActive?: boolean
          selectedSpiritId?: string
          mixedCount?: number
          hideMixedProgress?: boolean
          elementCounts?: Record<string, number>
          individualCounts?: Record<string, number>
          ballCounts?: Record<string, number>
          sessionStart?: Record<string, number>
          captureLog?: Array<{ time: string; type: 'polluted' | 'shiny' | 'deviated' | 'special'; desc: string }>
        }
        return parsed
      }

      const rawV1 = localStorage.getItem('roco_home_state_v1')
      if (!rawV1) return null
      const parsedV1 = JSON.parse(rawV1) as {
        isActive?: boolean
        selectedSpiritId?: string
        pools?: Array<{ poolType: 'mixed' | 'element' | 'individual'; currentCount: number; maxCount: number; elementType?: string; spiritName?: string }>
        ballCounts?: Record<string, number>
        sessionStart?: Record<string, number>
        captureLog?: Array<{ time: string; type: 'polluted' | 'shiny' | 'deviated' | 'special'; desc: string }>
      }

      const spiritId = parsedV1.selectedSpiritId || initialSpirit?.id
      const spirit = selectableSpirits.find((s) => s.id === spiritId) || initialSpirit
      const mixedPool = parsedV1.pools?.find((p) => p.poolType === 'mixed')
      const elementPool = parsedV1.pools?.find((p) => p.poolType === 'element')
      const individualPool = parsedV1.pools?.find((p) => p.poolType === 'individual')
      const elementType = elementPool?.elementType || spirit?.elementType

      return {
        isActive: parsedV1.isActive,
        selectedSpiritId: spiritId,
        mixedCount: mixedPool?.currentCount ?? 0,
        elementCounts: elementType ? { [elementType]: elementPool?.currentCount ?? 0 } : {},
        individualCounts: spiritId ? { [spiritId]: individualPool?.currentCount ?? 0 } : {},
        ballCounts: parsedV1.ballCounts,
        sessionStart: parsedV1.sessionStart,
        captureLog: parsedV1.captureLog,
      }
    } catch {
      return null
    }
  }

  const persisted = loadPersistedState()
  const persistedSpirit = persisted?.selectedSpiritId
    ? selectableSpirits.find((s) => s.id === persisted.selectedSpiritId)
    : null

  const allowedBalls = ['高级咕噜球', '捕光球'] as const
  const sanitizeBallRecord = (record: Record<string, number> | undefined) => {
    return Object.fromEntries(allowedBalls.map((k) => [k, record?.[k] ?? 0])) as Record<(typeof allowedBalls)[number], number>
  }

  const [selectedSpirit, setSelectedSpirit] = useState(() => persistedSpirit || initialSpirit)

  const maxCount = 80
  const [mixedCount, setMixedCount] = useState(() => Math.max(0, Math.min(maxCount, persisted?.mixedCount ?? 0)))
  const [hideMixedProgress, setHideMixedProgress] = useState(() => persisted?.hideMixedProgress ?? false)
  const [elementCounts, setElementCounts] = useState<Record<string, number>>(() => persisted?.elementCounts || {})
  const [individualCounts, setIndividualCounts] = useState<Record<string, number>>(() => persisted?.individualCounts || {})
  const [isEditingPools, setIsEditingPools] = useState(false)

  // === 抓捕记录状态 ===
  const [isActive, setIsActive] = useState(() => persisted?.isActive ?? false)
  const [ballCounts, setBallCounts] = useState<Record<string, number>>(() => sanitizeBallRecord(persisted?.ballCounts))
  const [sessionStart, setSessionStart] = useState<Record<string, number>>(() => sanitizeBallRecord(persisted?.sessionStart))
  const [captureLog, setCaptureLog] = useState<Array<{
    time: Date
    type: 'polluted' | 'shiny' | 'deviated' | 'special'
    desc: string
  }>>(() => {
    if (!persisted?.captureLog?.length) return []
    return persisted.captureLog.map((l) => ({ ...l, time: new Date(l.time) }))
  })

  const elementType = selectedSpirit?.elementType || initialSpirit?.elementType || '电'
  const individualKey = selectedSpirit?.id || initialSpirit?.id || 'unknown'
  const individualCount = Math.max(0, Math.min(maxCount, individualCounts[individualKey] ?? 0))

  const hasPersistedOnce = useRef(false)

  useEffect(() => {
    if (!hasPersistedOnce.current) {
      hasPersistedOnce.current = true
      return
    }
    const next = {
      isActive,
      selectedSpiritId: selectedSpirit?.id,
      mixedCount,
      hideMixedProgress,
      elementCounts,
      individualCounts,
      ballCounts,
      sessionStart,
      captureLog: captureLog.map((l) => ({ ...l, time: l.time.toISOString() })),
    }
    localStorage.setItem('roco_home_state_v2', JSON.stringify(next))
  }, [isActive, selectedSpirit?.id, mixedCount, hideMixedProgress, elementCounts, individualCounts, ballCounts, sessionStart, captureLog])

  const resetPools = () => {
    if (confirm('确定要重置混池 / 当前目标池进度吗？')) {
      setMixedCount(0)
      setElementCounts((prev) => ({ ...prev, [elementType]: 0 }))
      setIndividualCounts((prev) => ({ ...prev, [individualKey]: 0 }))
      setHideMixedProgress(false)
    }
  }

  // === 核心抓捕逻辑 ===
  const handleCapture = (
    isShiny: boolean,
    pollutedCountMode: PollutedCountMode = 'elementAndIndividual',
    logType: 'polluted' | 'shiny' | 'deviated' | 'special',
    logDesc: string
  ) => {
    if (isActive) {
      setCaptureLog(prev => [{ time: new Date(), type: logType, desc: logDesc }, ...prev])
    }

    if (!isShiny) {
      if (pollutedCountMode === 'noCount') return

      const incMixed = () => setMixedCount((c) => Math.min(maxCount, c + 1))
      const incElement = () => setElementCounts((prev) => ({
        ...prev,
        [elementType]: Math.min(maxCount, (prev[elementType] ?? 0) + 1),
      }))
      const incIndividual = () => setIndividualCounts((prev) => ({
        ...prev,
        [individualKey]: Math.min(maxCount, (prev[individualKey] ?? 0) + 1),
      }))

      if (pollutedCountMode === 'mixedOnly') {
        incMixed()
        return
      }
      if (pollutedCountMode === 'elementOnly') {
        incElement()
        return
      }
      if (pollutedCountMode === 'individualOnly') {
        incIndividual()
        return
      }

      incElement()
      incIndividual()
      return
    }

    if (pollutedCountMode === 'mixedOnly') {
      setMixedCount(0)
      return
    }
    if (pollutedCountMode === 'elementOnly') {
      setElementCounts((prev) => ({ ...prev, [elementType]: 0 }))
      return
    }
    if (pollutedCountMode === 'individualOnly') {
      setIndividualCounts((prev) => ({ ...prev, [individualKey]: 0 }))
      return
    }
    if (pollutedCountMode === 'elementAndIndividual') {
      setElementCounts((prev) => ({ ...prev, [elementType]: 0 }))
      setIndividualCounts((prev) => ({ ...prev, [individualKey]: 0 }))
      return
    }
  }

  const clampCount = (n: number) => Math.max(0, Math.min(maxCount, n))

  const getFillStyle = (count: number, max: number) => {
    const pct = max > 0 ? Math.max(0, Math.min(1, count / max)) : 0
    const hue = 120 - 120 * pct
    const start = `hsl(${hue} 85% 45%)`
    const end = `hsl(${Math.max(0, hue - 12)} 85% 40%)`
    return {
      width: `${pct * 100}%`,
      backgroundImage: `linear-gradient(90deg, ${start}, ${end})`,
      boxShadow: `0 6px 14px hsl(${hue} 80% 40% / 0.22)`,
    } as const
  }

  const startSession = () => {
    setSessionStart({ ...ballCounts })
    setIsActive(true)
    setCaptureLog([])
    setIsEditingPools(false)
    setHideMixedProgress(false)
  }

  const endSession = () => {
    setIsActive(false)
    setIsEditingPools(false)
  }

  const getUsedBalls = () => {
    const used: Record<string, number> = {}
    Object.keys(ballCounts).forEach(ball => {
      const diff = ballCounts[ball] - (sessionStart[ball] || 0)
      if (diff > 0) used[ball] = diff
    })
    return used
  }

  const totalCost = Object.entries(getUsedBalls()).reduce((total, [ball, count]) => {
    if (ball !== '捕光球' && ball !== '高级咕噜球') return total
    const ballType = BALL_TYPES.find(b => b.name === ball)
    return total + (ballType ? ballType.price * count : 0)
  }, 0)

  const shareData: PosterData = {
    type: 'capture',
    title: '洛克王国异色收集',
    spirit: selectedSpirit,
    tag: '边抓边记',
    mixedCount: hideMixedProgress ? undefined : mixedCount,
    individualCount,
    cost: totalCost
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-black text-orange-950 tracking-wide">捕获追踪</h1>
        <ShareButton data={shareData} />
      </div>

      {/* === 顶部：目标选择与保底进度 === */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#FFE4C4]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-orange-950">当前目标</h2>
          </div>
          {isActive ? (
            <button onClick={endSession} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
              <Pause className="w-3 h-3" /> 结束抓捕
            </button>
          ) : (
            <button onClick={startSession} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              <Play className="w-3 h-3" /> 开始抓捕
            </button>
          )}
        </div>

        {/* 沉浸式大图展示 */}
        {isActive ? (
          <div className="relative w-full bg-gradient-to-b from-[#FFF9F0] to-[#FFE4C4]/30 border-2 border-[#FFE4C4] rounded-2xl mb-4 overflow-hidden shadow-sm flex flex-col items-center pt-8 pb-4">
            <div className="absolute top-3 left-3 flex gap-1 z-10">
              {(selectedSpirit?.elementTypes?.length ? selectedSpirit.elementTypes : [selectedSpirit?.elementType]).map(t => (
                <div key={t} className="w-8 h-8 rounded-full bg-[#FFF9F0] p-1 shadow-sm border border-[#FFE4C4]">
                  <img src={`/icons/${t}.png`} alt={t} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white/60 rounded-full border-4 border-white shadow-lg flex items-center justify-center p-4 mb-6 relative">
              {selectedSpirit?.image ? (
                <img src={selectedSpirit.image} alt={selectedSpirit.name} className="w-full h-full object-contain drop-shadow-xl animate-[pulse_3s_ease-in-out_infinite]" />
              ) : (
                <Ghost className="w-12 h-12 text-orange-300" />
              )}
            </div>
            <div className="bg-orange-500 text-white px-6 py-2 rounded-full font-black shadow-md border-2 border-white translate-y-[-24px]">
              {selectedSpirit?.name}
            </div>
            <div className="text-xs text-orange-900/60 font-bold -mt-2">正在全力抓捕中...</div>
          </div>
        ) : (
          <div className="mb-4 relative z-50">
            <SpiritSelector
              spirits={selectableSpirits}
              selected={selectedSpirit}
              onSelect={setSelectedSpirit}
              dropdownMode="push"
            />
          </div>
        )}

        {!isActive && (
          <div className="space-y-3">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingPools((v) => !v)}
                className={`p-1.5 rounded-full transition-colors ${isEditingPools ? 'bg-orange-500 text-white shadow-sm' : 'text-orange-900/40 hover:text-orange-500 hover:bg-orange-50'}`}
              >
                {isEditingPools ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
              <button
                onClick={resetPools}
                className="p-1.5 text-orange-900/40 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {!hideMixedProgress && (
              <div className="bg-[#FFF9F0] border border-[#FFE4C4] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-orange-950">混池保底</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-orange-900/50">全局</span>
                  </div>
                  {isEditingPools ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={mixedCount}
                        onChange={(e) => setMixedCount(clampCount(parseInt(e.target.value) || 0))}
                        className="w-16 px-2 py-1 text-right bg-white border border-orange-200 rounded-lg text-orange-600 font-black focus:outline-none focus:ring-1 focus:ring-orange-400"
                      />
                      <span className="text-sm font-black text-orange-900/50">/ {maxCount}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-black text-orange-600">{mixedCount} / {maxCount}</span>
                  )}
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-[#FFE4C4]">
                  <div className="h-full transition-all duration-500" style={getFillStyle(mixedCount, maxCount)} />
                </div>
              </div>
            )}

            <div className="bg-[#FFF9F0] border border-[#FFE4C4] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-black text-orange-950">单宠池保底</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-green-700 bg-green-100">{selectedSpirit?.name}</span>
                </div>
                {isEditingPools ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={individualCount}
                      onChange={(e) => setIndividualCounts((prev) => ({ ...prev, [individualKey]: clampCount(parseInt(e.target.value) || 0) }))}
                      className="w-16 px-2 py-1 text-right bg-white border border-orange-200 rounded-lg text-orange-600 font-black focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    <span className="text-sm font-black text-orange-900/50">/ {maxCount}</span>
                  </div>
                ) : (
                  <span className="text-sm font-black text-orange-600">{individualCount} / {maxCount}</span>
                )}
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden border border-[#FFE4C4]">
                <div className="h-full transition-all duration-500" style={getFillStyle(individualCount, maxCount)} />
              </div>
            </div>
          </div>
        )}

        {/* 抓捕时显示保底进度 */}
        {isActive && (
          <div className="pt-4 border-t border-[#FFF9F0]">
            {(() => {
              const showOther = individualCount >= 50 || isEditingPools
              const showMixed = showOther && !hideMixedProgress

              return (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFE4C4]/60 border-2 border-[#FFE4C4] rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-black text-orange-950">当前目标单宠池 ({individualCount}/{maxCount})</div>
                        <div className="text-[11px] text-orange-900/60 font-bold">{selectedSpirit?.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingPools((v) => !v)}
                          className={`p-1.5 rounded-full transition-colors ${isEditingPools ? 'bg-orange-500 text-white shadow-sm' : 'text-orange-900/40 hover:text-orange-500 hover:bg-orange-50'}`}
                        >
                          {isEditingPools ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={resetPools}
                          className="p-1.5 text-orange-900/40 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mb-2">
                      {isEditingPools ? (
                        <input
                          type="number"
                          value={individualCount}
                          onChange={(e) => setIndividualCounts((prev) => ({ ...prev, [individualKey]: clampCount(parseInt(e.target.value) || 0) }))}
                          className="w-24 px-3 py-1.5 text-xl text-orange-600 font-black bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                      ) : (
                        <span className="text-2xl font-black text-orange-600">{individualCount}</span>
                      )}
                      <span className="text-sm font-black text-orange-900/50">/ {maxCount}</span>
                    </div>

                    <div className="h-4 bg-white rounded-full overflow-hidden border border-[#FFE4C4]">
                      <div className="h-full transition-all duration-500" style={getFillStyle(individualCount, maxCount)} />
                    </div>

                    {!showOther && !hideMixedProgress && (
                      <div className="mt-2 text-[11px] text-orange-900/50 font-bold">达到 50 后自动显示混池</div>
                    )}
                  </div>

                  {showMixed && (
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-[#FFF9F0] border border-[#FFE4C4] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-orange-950">混池保底</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-orange-900/50">全局</span>
                          </div>
                          {isEditingPools ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={mixedCount}
                                onChange={(e) => setMixedCount(clampCount(parseInt(e.target.value) || 0))}
                                className="w-16 px-2 py-1 text-right bg-white border border-orange-200 rounded-lg text-orange-600 font-black focus:outline-none focus:ring-1 focus:ring-orange-400"
                              />
                              <span className="text-sm font-black text-orange-900/50">/ {maxCount}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-black text-orange-600">{mixedCount} / {maxCount}</span>
                          )}
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden border border-[#FFE4C4]">
                          <div className="h-full transition-all duration-500" style={getFillStyle(mixedCount, maxCount)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* === 核心操作区（开始抓捕后） === */}
      {isActive ? (
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#FFE4C4]">
          <h2 className="font-bold text-orange-950 mb-3">记录操作</h2>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleCapture(false, 'elementAndIndividual', 'polluted', '噩梦形态+1')}
              className="w-full py-6 bg-[#FFE4C4] text-orange-900 rounded-3xl font-black text-xl hover:bg-orange-300 transition-colors shadow-sm active:scale-95 flex flex-col items-center justify-center gap-1"
            >
              <span>噩梦形态+1</span>
              <span className="text-[11px] font-bold opacity-70">系别/单宠 +1</span>
            </button>

            <button
              onClick={() => {
                setHideMixedProgress(true)
                handleCapture(true, 'elementAndIndividual', 'shiny', `目标异色：${selectedSpirit?.name}`)
              }}
              className="w-full py-5 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-3xl font-black text-lg hover:from-orange-500 hover:to-orange-600 shadow-sm active:scale-95 shadow-orange-500/30 flex flex-col items-center justify-center gap-1"
            >
              <span>目标异色</span>
              <span className="text-[11px] font-bold opacity-80">系别/单宠清零</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleCapture(false, 'mixedOnly', 'special', '星尘虫/果冻')}
                className="py-4 bg-pink-50 text-pink-700 rounded-3xl text-sm font-black active:scale-95 border border-pink-100 flex flex-col items-center justify-center gap-1"
              >
                <span>星尘虫/果冻</span>
                <span className="text-[10px] font-bold opacity-70">混池+1</span>
              </button>
              <button
                onClick={() => handleCapture(false, 'elementOnly', 'special', '同系精灵噩梦')}
                className="py-4 bg-blue-50 text-blue-700 rounded-3xl text-sm font-black active:scale-95 border border-blue-100 flex flex-col items-center justify-center gap-1"
              >
                <span>同系噩梦</span>
                <span className="text-[10px] font-bold opacity-70">系别+1</span>
              </button>
              <button
                onClick={() => handleCapture(false, 'mixedOnly', 'special', '随机噩梦')}
                className="py-4 bg-purple-50 text-purple-700 rounded-3xl text-sm font-black active:scale-95 border border-purple-100 flex flex-col items-center justify-center gap-1"
              >
                <span>随机噩梦</span>
                <span className="text-[10px] font-bold opacity-70">混池+1</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCapture(true, 'elementOnly', 'deviated', '同系精灵异色')}
                className="py-3 bg-green-50 text-green-700 rounded-3xl text-sm font-black active:scale-95 border border-green-100 flex flex-col items-center justify-center gap-1"
              >
                <span>同系异色</span>
                <span className="text-[10px] font-bold opacity-70">系别清零</span>
              </button>
              <button
                onClick={() => handleCapture(true, 'mixedOnly', 'deviated', '随机精灵异色')}
                className="py-3 bg-gray-50 text-gray-700 rounded-3xl text-sm font-black active:scale-95 border border-gray-200 flex flex-col items-center justify-center gap-1"
              >
                <span>随机精灵异色</span>
                <span className="text-[10px] font-bold opacity-70">混池清零</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* === 日志显示 (仅进行中) === */}
      {isActive && captureLog.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#FFE4C4]">
          <h2 className="font-bold text-orange-950 mb-3">操作日志</h2>
          <div className="space-y-2 max-h-40 overflow-y-auto roco-scrollbar pr-1">
            {captureLog.map((log, i) => (
              <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{log.time.toLocaleTimeString([], { hour12: false })}</span>
                <span className={`font-bold ${
                  log.type === 'shiny' ? 'text-orange-500' :
                  log.type === 'deviated' ? 'text-purple-500' :
                  log.type === 'special' ? 'text-pink-500' : 'text-gray-700'
                }`}>
                  {log.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === 底部：球持有量记录 === */}
      {isActive && (
        <div className="bg-[#FFFDFB] rounded-3xl shadow-sm p-5 border border-[#FFE4C4] pb-safe mt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#5A3D2C]">球持有量结算</h2>
            <span className="text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full">当前花费: {totalCost} 洛克贝</span>
          </div>
          
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-4 items-center">
            <div className="col-start-2 text-center text-xs font-bold text-[#5A3D2C]/70">高级咕噜球</div>
            <div className="col-start-3 text-center text-xs font-bold text-[#5A3D2C]/70">捕光球</div>

            {/* Before Row */}
            <div className="text-sm font-bold text-[#5A3D2C] text-right pr-2">抓捕前</div>
            {allowedBalls.map(ballName => (
              <div key={`before-${ballName}`}>
                <input
                  type="number"
                  value={sessionStart[ballName] || 0}
                  onChange={(e) => setSessionStart(prev => ({
                    ...prev,
                    [ballName]: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-2 py-2.5 text-center bg-[#F9F9F9] border border-gray-200 rounded-xl text-base text-[#5A3D2C] font-semibold focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>
            ))}

            {/* After Row */}
            <div className="text-sm font-bold text-[#5A3D2C] text-right pr-2">抓捕后</div>
            {allowedBalls.map(ballName => (
              <div key={`after-${ballName}`}>
                <input
                  type="number"
                  value={ballCounts[ballName] || 0}
                  onChange={(e) => setBallCounts(prev => ({
                    ...prev,
                    [ballName]: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-2 py-2.5 text-center bg-[#FFF3E8] border-2 border-orange-200 rounded-xl text-base text-orange-600 font-bold focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
