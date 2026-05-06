import { Outlet, Link, useLocation } from 'react-router-dom'
import { Ghost, Calculator, Camera } from 'lucide-react'

const navItems = [
  { path: '/', label: '捕获', icon: Camera },
  { path: '/spirits', label: '图鉴', icon: Ghost },
  { path: '/calculator', label: '收益', icon: Calculator },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-20 md:pb-0">
      {/* 顶部导航 - 在移动端较小，PC端正常 */}
      <header className="bg-[#FFE4C4] border-b border-[#FFD8A8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center md:justify-start h-14 md:h-16">
            <div className="flex items-center gap-2">
              <Ghost className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
              <h1 className="text-lg md:text-xl font-bold text-orange-900 tracking-wide">
                洛克王国异色收集器
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* 侧边导航 (仅在 md 以上显示) */}
      <div className="max-w-7xl mx-auto flex">
        <nav className="hidden md:block w-64 shrink-0 py-6 pr-4">
          <div className="flex flex-col gap-2 sticky top-24">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-orange-900 hover:bg-[#FFE4C4]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-bold">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 主内容区 */}
        <main className="flex-1 px-4 py-4 md:py-6 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* 底部 TabBar (仅在移动端显示) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFF9F0] border-t border-[#FFD8A8] pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-orange-600' : 'text-orange-900/60'
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-orange-100' : ''}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-orange-600' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
