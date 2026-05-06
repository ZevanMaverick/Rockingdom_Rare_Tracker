export interface Spirit {
  id: string
  name: string
  elementType: string
  elementTypes?: string[]
  basePrice: number
  pollutedBasePrice: number
  shinyBasePrice: number
  maxPrice: number
  image?: string
  isSpecial?: boolean // 是否为星尘虫或噩梦这种特殊精灵
}

export interface PoolStatus {
  poolType: 'mixed' | 'element' | 'individual'
  currentCount: number
  maxCount: number
  elementType?: string
  spiritName?: string
}

export interface CaptureRecord {
  id: string
  spiritId: string
  spiritName: string
  captureType: 'normal' | 'polluted' | 'shiny'
  isDeviated: boolean
  deviationTarget?: string
  captureMethod?: 'single' | 'double' | 'triple'
  captureTime: Date
}

export interface Medal {
  id: string
  name: string
  multiplier: number
  category: 'appearance' | 'region' | 'time' | 'size' | 'voice'
  condition: string
}

export interface BallType {
  id: string
  name: string
  price: number
  successRate: number
  isElement: boolean
  applicableElements?: string[]
  image?: string
}

export interface CaptureSession {
  id: string
  startBallCounts: Record<string, number>
  endBallCounts: Record<string, number>
  totalCost: number
  targetSpirit: string
  location: string
  sessionNotes: string
  startTime: Date
  endTime?: Date
}

export const ELEMENT_COLORS: Record<string, string> = {
  '龙': 'bg-rose-500',
  '幻': 'bg-fuchsia-500',
  '机械': 'bg-slate-500',
  '恶': 'bg-pink-600',
  '翼': 'bg-cyan-500',
  '武': 'bg-orange-500',
  '火': 'bg-red-500',
  '水': 'bg-blue-500',
  '电': 'bg-yellow-400',
  '光': 'bg-sky-500',
  '毒': 'bg-violet-500',
  '草': 'bg-green-500',
  '冰': 'bg-blue-300',
  '虫': 'bg-lime-600',
  '地': 'bg-amber-700',
  '幽': 'bg-indigo-600',
  '萌': 'bg-pink-400',
  '普通': 'bg-gray-500',
}

export const MEDALS: Medal[] = [
  { id: 'perfect', name: '完美无瑕', multiplier: 3, category: 'appearance', condition: '使用冷静球捕捉' },
  { id: 'shiny', name: '异色', multiplier: 10, category: 'appearance', condition: '异色形态' },
  { id: 'colorful', name: '炫彩', multiplier: 10, category: 'appearance', condition: '炫彩形态' },
  { id: 'region_wind', name: '轻风之息', multiplier: 2, category: 'region', condition: '轻风山捕捉/孵化' },
  { id: 'region_kingdom', name: '王国颂歌', multiplier: 2, category: 'region', condition: '洛克里安捕捉/孵化' },
  { id: 'region_magic', name: '魔法勋章', multiplier: 2, category: 'region', condition: '魔法学院捕捉/孵化' },
  { id: 'time_morning', name: '晨光破晓', multiplier: 2, category: 'time', condition: '早上捕捉/孵化' },
  { id: 'time_noon', name: '灼日凌空', multiplier: 2, category: 'time', condition: '中午捕捉/孵化' },
  { id: 'time_evening', name: '暮色街山', multiplier: 2, category: 'time', condition: '傍晚捕捉/孵化' },
  { id: 'time_night', name: '星月交辉', multiplier: 2, category: 'time', condition: '夜晚捕捉/孵化' },
  { id: 'size_small', name: '小不点', multiplier: 3, category: 'size', condition: '小体型精灵' },
  { id: 'size_large', name: '大块头', multiplier: 3, category: 'size', condition: '大体型精灵' },
  { id: 'voice_harsh', name: '粗嗓门', multiplier: 3, category: 'voice', condition: '粗犷声音' },
  { id: 'voice_sweet', name: '娇转声', multiplier: 3, category: 'voice', condition: '甜美声音' },
]

export const BALL_TYPES: BallType[] = [
  { id: 'normal', name: '普通咕噜球', price: 0, successRate: 30, isElement: false, image: '/balls/normal.png' },
  { id: 'premium', name: '高级咕噜球', price: 12000, successRate: 45, isElement: false, image: '/balls/premium.png' },
  { id: 'capture_light', name: '捕光球', price: 80000, successRate: 100, isElement: false, image: '/balls/capture_light.png' },
  { id: 'king', name: '国王球', price: 0, successRate: 100, isElement: false, image: '/balls/king.png' },
  { id: 'prism', name: '棱镜球', price: 0, successRate: 100, isElement: false, image: '/balls/prism.png' },
  { id: 'cocoa', name: '可可果球', price: 0, successRate: 35, isElement: false, image: '/balls/cocoa.png' },
  { id: 'soft', name: '柔软咕噜球', price: 0, successRate: 35, isElement: false, image: '/balls/soft.png' },
  { id: 'beautiful', name: '美妙球', price: 0, successRate: 35, isElement: true, applicableElements: ['萌系', '普通系'], image: '/balls/beautiful.png' },
  { id: 'bellicose', name: '好战球', price: 0, successRate: 35, isElement: true, applicableElements: ['武系', '龙系'], image: '/balls/bellicose.png' },
  { id: 'photosynthesis', name: '光合球', price: 0, successRate: 35, isElement: true, applicableElements: ['草系', '光系'], image: '/balls/photosynthesis.png' },
  { id: 'net_shell', name: '网兜球', price: 0, successRate: 35, isElement: true, applicableElements: ['水系', '翼系'], image: '/balls/net_shell.png' },
  { id: 'shadow', name: '暗星球', price: 0, successRate: 35, isElement: true, applicableElements: ['幽系', '恶系'], image: '/balls/shadow.png' },
  { id: 'temperature', name: '调温球', price: 0, successRate: 35, isElement: true, applicableElements: ['火系', '冰系'], image: '/balls/temperature.png' },
  { id: 'stable_electric', name: '绝缘球', price: 0, successRate: 35, isElement: true, applicableElements: ['电系', '毒系'], image: '/balls/stable_electric.png' },
  { id: 'bubble_sand', name: '淘沙球', price: 0, successRate: 35, isElement: true, applicableElements: ['地系', '虫系'], image: '/balls/bubble_sand.png' },
  { id: 'phantom', name: '变幻球', price: 0, successRate: 35, isElement: true, applicableElements: ['幻系', '机械系'], image: '/balls/phantom.png' },
]

export const SPIRITS: Spirit[] = [
  { id: '1', name: '柴渣虫', elementType: '火', elementTypes: ['火', '草'], basePrice: 1200, pollutedBasePrice: 30000, shinyBasePrice: 1800000, maxPrice: 64800000, image: '/sprites/spirit_1.png' },
  { id: '2', name: '贝瑟', elementType: '机械', elementTypes: ['机械', '火'], basePrice: 1200, pollutedBasePrice: 30000, shinyBasePrice: 1800000, maxPrice: 64800000, image: '/sprites/spirit_2.png' },
  { id: '3', name: '粉粉星', elementType: '电', elementTypes: ['电', '幻'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_3.png' },
  { id: '4', name: '空空颅', elementType: '幽', elementTypes: ['幽'], basePrice: 1200, pollutedBasePrice: 30000, shinyBasePrice: 1800000, maxPrice: 64800000, image: '/sprites/spirit_4.png' },
  { id: '5', name: '嗜光嗡嗡', elementType: '恶', elementTypes: ['恶', '光'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_5.png' },
  { id: '6', name: '月牙雪熊', elementType: '冰', elementTypes: ['冰', '幻'], basePrice: 4500, pollutedBasePrice: 112500, shinyBasePrice: 6750000, maxPrice: 243000000, image: '/sprites/spirit_6.png' },
  { id: '7', name: '双灯鱼', elementType: '水', elementTypes: ['水', '电'], basePrice: 1200, pollutedBasePrice: 30000, shinyBasePrice: 1800000, maxPrice: 64800000, image: '/sprites/spirit_7.png' },
  { id: '8', name: '粉星仔', elementType: '幻', elementTypes: ['幻'], basePrice: 2400, pollutedBasePrice: 60000, shinyBasePrice: 3600000, maxPrice: 129600000, image: '/sprites/spirit_8.png' },
  { id: '9', name: '奇丽草', elementType: '草', elementTypes: ['草'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_9.png' },
  { id: '10', name: '呼呼猪', elementType: '冰', elementTypes: ['冰', '地'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_10.png' },
  { id: '11', name: '拉特', elementType: '电', elementTypes: ['电'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_11.png' },
  { id: '12', name: '治愈兔', elementType: '火', elementTypes: ['火', '萌'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_12.png' },
  { id: '13', name: '格兰种子', elementType: '草', elementTypes: ['草'], basePrice: 1200, pollutedBasePrice: 30000, shinyBasePrice: 1800000, maxPrice: 64800000, image: '/sprites/spirit_13.png' },
  { id: '14', name: '恶魔狼', elementType: '恶', elementTypes: ['恶'], basePrice: 6000, pollutedBasePrice: 150000, shinyBasePrice: 9000000, maxPrice: 324000000, image: '/sprites/spirit_14.png' },
  { id: '15', name: '机械方方', elementType: '机械', elementTypes: ['机械'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_15.png' },
  { id: '16', name: '大耳帽兜', elementType: '冰', elementTypes: ['冰', '萌'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_16.png' },
  { id: '17', name: '犀角鸟', elementType: '光', elementTypes: ['光'], basePrice: 2400, pollutedBasePrice: 60000, shinyBasePrice: 3600000, maxPrice: 129600000, image: '/sprites/spirit_17.png' },
  { id: '18', name: '绒绒', elementType: '虫', elementTypes: ['虫', '光'], basePrice: 2400, pollutedBasePrice: 60000, shinyBasePrice: 3600000, maxPrice: 129600000, image: '/sprites/spirit_18.png' },
  { id: '19', name: '火红尾', elementType: '火', elementTypes: ['火'], basePrice: 1800, pollutedBasePrice: 45000, shinyBasePrice: 2700000, maxPrice: 97200000, image: '/sprites/spirit_19.png' },
  // 特殊精灵
  { id: 's1', name: '星尘虫', elementType: '虫', elementTypes: ['虫'], basePrice: 0, pollutedBasePrice: 0, shinyBasePrice: 0, maxPrice: 0, isSpecial: true, image: '/sprites/stardust_bug.png' },
  { id: 's2', name: '果冻的噩梦', elementType: '普通', elementTypes: ['普通'], basePrice: 0, pollutedBasePrice: 0, shinyBasePrice: 0, maxPrice: 0, isSpecial: true, image: '/sprites/nightmare.png' },
]
