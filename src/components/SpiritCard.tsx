import { Spirit } from '../data'

interface SpiritCardProps {
  spirit: Spirit
  collected?: boolean
  onClick?: () => void
}

export default function SpiritCard({ spirit, collected, onClick }: SpiritCardProps) {
  const types = spirit.elementTypes?.length ? spirit.elementTypes : [spirit.elementType]

  return (
    <div
      onClick={onClick}
      className={`relative bg-[#FFF9F0] border-2 ${
        collected ? 'border-green-400 shadow-green-100' : 'border-[#FFE4C4]'
      } rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group`}
    >
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {types.map((t) => (
          <div key={t} className="w-7 h-7 rounded-full bg-[#FFF9F0] p-0.5 shadow-sm border border-[#FFE4C4]">
            <img src={`/icons/${t}.png`} alt={t} className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </div>
        ))}
      </div>

      {collected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm">
          <CheckIcon className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="pt-8 pb-3 px-4 flex justify-center items-center bg-gradient-to-b from-transparent to-[#FFE4C4]/20 min-h-[120px]">
        {spirit.image ? (
          <img src={spirit.image} alt={spirit.name} className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <GhostIcon className="w-16 h-16 text-[#FFE4C4]" />
        )}
      </div>

      <div className="bg-[#FFE4C4] py-1.5 px-4 text-center border-y border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        <h3 className="font-black text-orange-950 tracking-wider text-sm">{spirit.name}</h3>
      </div>

      <div className="p-3 space-y-1.5 text-xs">
        <div className="flex justify-between items-center bg-gray-50 rounded-md px-2 py-1">
          <span className="text-gray-500">基础价值</span>
          <span className="font-bold text-gray-700">{spirit.basePrice}</span>
        </div>
        <div className="flex justify-between items-center bg-orange-50 rounded-md px-2 py-1">
          <span className="text-orange-700">污染价值</span>
          <span className="font-bold text-orange-600">{(spirit.pollutedBasePrice / 10000).toFixed(1)}万</span>
        </div>
        <div className="flex justify-between items-center bg-red-50 rounded-md px-2 py-1 border border-red-100 shadow-sm">
          <span className="text-red-500 font-bold">极限价值</span>
          <span className="font-black text-red-600">{(spirit.maxPrice / 10000).toLocaleString()}万</span>
        </div>
      </div>
    </div>
  )
}

function GhostIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C7.58 2 4 5.58 4 10v12l3-3 3 3 3-3 3 3 3-3 3 3V10c0-4.42-3.58-8-8-8zm-2 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
