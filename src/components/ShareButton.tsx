import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Share2, X, Download, MessageCircle, Ghost } from 'lucide-react'
import html2canvas from 'html2canvas'
import { Spirit } from '../data'

export type PosterType = 'capture' | 'collection' | 'profit'

export interface PosterData {
  type: PosterType
  title: string
  // For capture
  spirit?: Spirit
  tag?: string // "欧皇", "歪打正着" etc.
  mixedCount?: number
  elementCount?: number
  individualCount?: number
  cost?: number
  // For collection
  collectedCount?: number
  totalCount?: number
  // For profit
  profit?: number
  review?: number
  multiplier?: number
}

interface ShareButtonProps {
  data: PosterData
}

export default function ShareButton({ data }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!posterRef.current || isGenerating) return
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFF9F0'
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `roco_share_${new Date().getTime()}.png`
      a.click()
    } catch (e) {
      alert('生成图片失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderPosterContent = () => {
    if (data.type === 'capture') {
      return (
        <div className="relative bg-gradient-to-b from-[#FFE4C4] to-[#FFF9F0] w-full aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white shadow-xl flex flex-col items-center p-6">
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md z-10 rotate-[-10deg]">
            {data.tag || '捕获追踪'}
          </div>
          
          <div className="w-32 h-32 bg-white/60 rounded-full border-4 border-white shadow-lg flex items-center justify-center p-2 mb-4 relative mt-4">
            {data.spirit?.image ? (
              <img src={data.spirit.image} alt="spirit" className="w-full h-full object-contain drop-shadow-xl" />
            ) : (
              <Ghost className="w-12 h-12 text-orange-300" />
            )}
          </div>
          
          <h2 className="text-2xl font-black text-orange-950 mb-1">{data.spirit?.name || '未知精灵'}</h2>
          <div className="flex gap-1 mb-6">
            {(data.spirit?.elementTypes?.length ? data.spirit.elementTypes : [data.spirit?.elementType || '未知']).map(t => (
              <span key={t} className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-bold border border-orange-200">
                {t}
              </span>
            ))}
          </div>

          <div className="w-full bg-white/80 rounded-xl p-4 space-y-3 backdrop-blur-sm border border-white">
            {typeof data.mixedCount === 'number' && (
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-orange-900/60">混池已垫</span>
                <span className="text-orange-600">{data.mixedCount}/80</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-orange-900/60">个人已垫</span>
              <span className="text-green-600">{data.individualCount}/80</span>
            </div>
            <div className="pt-2 border-t border-orange-100 flex justify-between items-center text-sm font-black">
              <span className="text-orange-950">当前球耗</span>
              <span className="text-red-500">{data.cost?.toLocaleString()} 洛克贝</span>
            </div>
          </div>
          
          <div className="mt-auto text-[10px] text-orange-900/40 font-bold">洛克王国异色收集器</div>
        </div>
      )
    }

    if (data.type === 'collection') {
      return (
        <div className="relative bg-gradient-to-b from-blue-100 to-[#FFF9F0] w-full aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white shadow-xl flex flex-col items-center p-6">
          <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md z-10 rotate-[-10deg]">
            收集达人
          </div>
          <div className="mt-10 mb-6">
            <Ghost className="w-24 h-24 text-blue-400 drop-shadow-xl" />
          </div>
          <h2 className="text-2xl font-black text-blue-950 mb-2">异色图鉴进度</h2>
          <div className="text-4xl font-black text-blue-600 mb-8 drop-shadow-sm">
            {data.collectedCount} <span className="text-xl text-blue-400">/ {data.totalCount}</span>
          </div>
          <p className="text-sm font-bold text-blue-900/60 text-center px-4">
            还在努力点亮全图鉴中<br/>来看看我都抓到了哪些异色精灵！
          </p>
          <div className="mt-auto text-[10px] text-blue-900/40 font-bold">洛克王国异色收集器</div>
        </div>
      )
    }

    // Profit
    return (
      <div className="relative bg-gradient-to-b from-yellow-100 to-[#FFF9F0] w-full aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white shadow-xl flex flex-col items-center p-6">
        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md z-10 rotate-[-10deg]">
          盆满钵满
        </div>
        
        <div className="w-24 h-24 bg-white/60 rounded-full border-4 border-white shadow-lg flex items-center justify-center p-2 mb-4 relative mt-4">
          {data.spirit?.image ? (
            <img src={data.spirit.image} alt="spirit" className="w-full h-full object-contain drop-shadow-xl" />
          ) : (
            <Ghost className="w-10 h-10 text-yellow-500" />
          )}
        </div>
        
        <h2 className="text-xl font-black text-yellow-950 mb-6">抓捕收益报告</h2>

        <div className="w-full bg-white/80 rounded-xl p-4 space-y-3 backdrop-blur-sm border border-white">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-yellow-900/60">回顾总计</span>
            <span className="text-yellow-700">{data.review?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-yellow-900/60">奖牌倍率</span>
            <span className="text-yellow-600">×{data.multiplier}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-yellow-900/60">球消耗</span>
            <span className="text-red-500">-{data.cost?.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-yellow-200 flex justify-between items-center text-lg font-black">
            <span className="text-yellow-950">净利润</span>
            <span className={(data.profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
              {(data.profit || 0) >= 0 ? '+' : ''}{data.profit?.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="mt-auto text-[10px] text-yellow-900/40 font-bold">洛克王国异色收集器</div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 rounded-full transition-all text-xs font-bold shadow-sm active:scale-95"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>分享海报</span>
      </button>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between bg-[#FFF9F0]">
              <h3 className="font-black text-orange-950 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-orange-500" />
                分享海报
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-orange-900/40 hover:text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Preview */}
            <div className="p-6 overflow-y-auto bg-gray-100 flex-1 flex justify-center items-center">
              <div className="w-full max-w-[280px]" ref={posterRef}>
                {renderPosterContent()}
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 bg-white space-y-4">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? '生成中...' : '保存海报图片'}</span>
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-gray-400 relative z-10">保存后可分享至</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 bg-[#07C160] rounded-full flex items-center justify-center shadow-sm">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">微信</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 bg-[#12B7F5] rounded-full flex items-center justify-center shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                      <path d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 15c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z"/>
                      <circle cx="9.5" cy="10.5" r="1.5"/>
                      <circle cx="14.5" cy="10.5" r="1.5"/>
                      <path d="M12 14c-1.5 0-2.8-.8-3.5-2h7c-.7 1.2-2 2-3.5 2z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">QQ</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 bg-[#FF2442] rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-black text-sm italic">小红书</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">小红书</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
