import { useMemo, useState, useEffect } from 'react'
import { SPIRITS, MEDALS, BALL_TYPES, Spirit } from '../data'
import { Plus, Trash2, Calculator as CalculatorIcon, Edit2, Check, ChevronDown, ChevronUp } from 'lucide-react'
import ShareButton, { PosterData } from '../components/ShareButton'
import SpiritSelector from '../components/SpiritSelector'

interface CalculatorData {
  reviewAmounts: number[]
  ballCounts: Record<string, { before: number; after: number }>
  selectedMedals: string[]
}

export default function CalculatorPage() {
  const selectableSpirits = useMemo(() => SPIRITS.filter((s) => !s.isSpecial), [])
  const [selectedSpirit, setSelectedSpirit] = useState<Spirit>(() => {
    const savedId = localStorage.getItem('roco_calc_last_spirit')
    return selectableSpirits.find(s => s.id === savedId) || selectableSpirits[0]
  })
  
  // Data state
  const [reviewAmounts, setReviewAmounts] = useState<number[]>([])
  const [ballCounts, setBallCounts] = useState<Record<string, { before: number; after: number }>>({
    '高级咕噜球': { before: 0, after: 0 },
    '捕光球': { before: 0, after: 0 },
  })
  const [selectedMedals, setSelectedMedals] = useState<Set<string>>(new Set())

  // UI state
  const [newReview, setNewReview] = useState('')
  const [isEditingReviews, setIsEditingReviews] = useState(false)
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(true)

  // Load data when spirit changes
  useEffect(() => {
    localStorage.setItem('roco_calc_last_spirit', selectedSpirit.id)
    const savedData = localStorage.getItem(`roco_calc_data_${selectedSpirit.id}`)
    if (savedData) {
      try {
        const parsed: CalculatorData = JSON.parse(savedData)
        setReviewAmounts(parsed.reviewAmounts || [])
        setBallCounts({
          '高级咕噜球': parsed.ballCounts?.['高级咕噜球'] || { before: 0, after: 0 },
          '捕光球': parsed.ballCounts?.['捕光球'] || { before: 0, after: 0 },
        })
        setSelectedMedals(new Set(parsed.selectedMedals || []))
      } catch (e) {
        console.error('Failed to parse saved data')
      }
    } else {
      // Reset if no saved data
      setReviewAmounts([])
      setBallCounts({
        '高级咕噜球': { before: 0, after: 0 },
        '捕光球': { before: 0, after: 0 },
      })
      setSelectedMedals(new Set())
    }
  }, [selectedSpirit.id])

  // Save data when state changes
  useEffect(() => {
    const dataToSave: CalculatorData = {
      reviewAmounts,
      ballCounts,
      selectedMedals: Array.from(selectedMedals)
    }
    localStorage.setItem(`roco_calc_data_${selectedSpirit.id}`, JSON.stringify(dataToSave))
  }, [reviewAmounts, ballCounts, selectedMedals, selectedSpirit.id])

  const addReviewAmount = () => {
    const amount = parseInt(newReview)
    if (!isNaN(amount) && amount > 0) {
      setReviewAmounts(prev => [...prev, amount])
      setNewReview('')
    }
  }

  const updateReviewAmount = (index: number, newValue: string) => {
    const amount = parseInt(newValue)
    if (!isNaN(amount) && amount >= 0) {
      setReviewAmounts(prev => prev.map((val, i) => i === index ? amount : val))
    }
  }

  const totalReview = reviewAmounts.reduce((sum, amount) => sum + amount, 0)

  const ballCost = Object.entries(ballCounts).reduce((total, [ballName, counts]) => {
    // 仅计算捕光球和高级咕噜球的费用
    if (ballName !== '捕光球' && ballName !== '高级咕噜球') return total

    const ball = BALL_TYPES.find(b => b.name === ballName)
    const used = counts.before > counts.after ? counts.before - counts.after : 0
    return total + (ball ? ball.price * used : 0)
  }, 0)

  const medalMultiplier = MEDALS
    .filter(m => selectedMedals.has(m.id))
    .reduce((mult, m) => mult * m.multiplier, 1)

  const baseIncome = selectedSpirit.basePrice > 0 ? (totalReview * selectedSpirit.pollutedBasePrice) / selectedSpirit.basePrice : 0
  const finalIncome = Math.floor(baseIncome * medalMultiplier)
  const profit = finalIncome - ballCost

  const toggleMedal = (medalId: string) => {
    setSelectedMedals(prev => {
      const next = new Set(prev)
      if (next.has(medalId)) {
        next.delete(medalId)
      } else {
        next.add(medalId)
      }
      return next
    })
  }

  const medalCategories = [
    { key: 'appearance', label: '外观' },
    { key: 'region', label: '地区' },
    { key: 'time', label: '时间' },
    { key: 'size', label: '体型' },
    { key: 'voice', label: '声音' },
  ]

  const shareData: PosterData = {
    type: 'profit',
    title: '洛克王国异色收益',
    spirit: selectedSpirit,
    profit,
    review: totalReview,
    multiplier: medalMultiplier,
    cost: ballCost
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#FFE4C4]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalculatorIcon className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-orange-950">收益计算器</h2>
          </div>
          <ShareButton data={shareData} />
        </div>

        <div className="mt-4 space-y-6">
          <div className="relative z-50">
            <SpiritSelector
              spirits={selectableSpirits}
              selected={selectedSpirit}
              onSelect={setSelectedSpirit}
              showPrice={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-[#FFF9F0] p-4 rounded-xl border border-[#FFE4C4]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-bold text-orange-950">回顾金币录入</label>
                    <span className="text-[10px] text-orange-900/60 ml-2">可多次录入累计</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {reviewAmounts.length > 0 && (
                      <button
                        onClick={() => setIsEditingReviews(!isEditingReviews)}
                        className={`p-1.5 rounded-full transition-colors ${isEditingReviews ? 'bg-orange-500 text-white shadow-sm' : 'text-orange-900/40 hover:text-orange-500'}`}
                      >
                        {isEditingReviews ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
                      className="p-1.5 text-orange-900/40 hover:text-orange-500 rounded-full transition-colors"
                    >
                      {isReviewsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="输入回顾金币数"
                    className="flex-1 px-4 py-2 border border-[#FFE4C4] rounded-lg focus:ring-0 focus:border-orange-400 font-bold"
                    onKeyDown={(e) => e.key === 'Enter' && addReviewAmount()}
                  />
                  <button
                    onClick={addReviewAmount}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {reviewAmounts.length > 0 && isReviewsExpanded && (
                  <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    {reviewAmounts.map((amount, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-orange-100">
                        <span className="text-sm text-orange-900 font-bold">第{index + 1}次</span>
                        {isEditingReviews ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => updateReviewAmount(index, e.target.value)}
                              className="w-24 px-2 py-0.5 text-right border border-orange-300 rounded font-black text-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <button
                              onClick={() => setReviewAmounts(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-black text-orange-950">{amount.toLocaleString()}</span>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between font-black text-orange-600 pt-2 border-t border-orange-200/50">
                      <span>总计回顾</span>
                      <span>{totalReview.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#FFF9F0] p-4 rounded-xl border border-[#FFE4C4]">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-orange-950">球消耗成本</label>
                  <span className="text-xs text-orange-900/60">抓捕前后差值 (仅算光/高级)</span>
                </div>
                <div className="space-y-3">
                  {['高级咕噜球', '捕光球'].map(ballName => (
                    <div key={ballName} className="flex items-center gap-2">
                      <span className="w-20 text-xs font-bold text-orange-900">{ballName}</span>
                      <input
                        type="number"
                        placeholder="前"
                        value={ballCounts[ballName]?.before || ''}
                        onChange={(e) => setBallCounts(prev => ({
                          ...prev,
                          [ballName]: { ...prev[ballName], before: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-16 px-2 py-1.5 border border-[#FFE4C4] rounded-lg text-sm text-center focus:ring-0 focus:border-orange-400"
                      />
                      <span className="text-orange-300 font-bold">→</span>
                      <input
                        type="number"
                        placeholder="后"
                        value={ballCounts[ballName]?.after || ''}
                        onChange={(e) => setBallCounts(prev => ({
                          ...prev,
                          [ballName]: { ...prev[ballName], after: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-16 px-2 py-1.5 border border-[#FFE4C4] rounded-lg text-sm text-center focus:ring-0 focus:border-orange-400"
                      />
                      <span className="text-xs text-orange-500 font-bold ml-auto">
                        用 {Math.max(0, (ballCounts[ballName]?.before || 0) - (ballCounts[ballName]?.after || 0))} 个
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-[#FFE4C4]">
                <label className="text-sm font-bold text-orange-950 mb-3 block">选择获得奖牌</label>
                <div className="space-y-4">
                  {medalCategories.map(category => (
                    <div key={category.key}>
                      <div className="text-xs text-orange-900/60 mb-1.5 font-bold">{category.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {MEDALS.filter(m => m.category === category.key).map(medal => (
                          <button
                            key={medal.id}
                            onClick={() => toggleMedal(medal.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                              selectedMedals.has(medal.id)
                                ? 'bg-yellow-400 text-yellow-950 border-yellow-500 shadow-sm'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {medal.name}{' '}
                          <span className={selectedMedals.has(medal.id) ? 'text-yellow-800' : 'text-gray-400'}>
                              ×{medal.multiplier}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFE4C4]/50 rounded-xl p-4 border border-[#FFE4C4] shadow-sm">
              <h3 className="font-black text-orange-950 mb-4 flex items-center gap-2">
                  结算明细
                </h3>
              <div className="space-y-2.5 text-sm font-medium text-orange-900/80">
                  <div className="flex justify-between">
                    <span>精灵基础价格</span>
                  <span className="font-bold text-gray-700">{selectedSpirit.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>污染基础价格</span>
                  <span className="font-bold text-orange-600">{(selectedSpirit.pollutedBasePrice / 10000).toFixed(1)}万</span>
                  </div>
                  <div className="flex justify-between">
                    <span>回顾总金币</span>
                  <span className="font-bold text-gray-700">{totalReview.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>奖牌总倍率</span>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-black text-xs">× {medalMultiplier}</span>
                  </div>
                <div className="flex justify-between text-red-500">
                    <span>球消耗成本</span>
                  <span className="font-bold">-{ballCost.toLocaleString()}</span>
                  </div>
                <div className="border-t border-orange-200 pt-3 mt-3">
                    <div className="flex justify-between items-end mb-1">
                    <span className="font-bold text-orange-950">预估收益</span>
                    <span className="text-xl font-black text-orange-600">{finalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-orange-950">净利润</span>
                    <span className={`font-black px-2 py-0.5 rounded ${profit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
