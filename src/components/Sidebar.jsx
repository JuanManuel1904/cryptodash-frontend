const NAV = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
  },
  {
    id: 'compare',
    label: 'Compare',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M9.5 4C7 4 5 6 5 8.5c0 2.27 1.63 4.17 3.79 4.45L11 14.68V17H9v2h2v2h2v-2h2v-2h-2v-2.32l2.21-2.23C17.37 12.67 19 10.77 19 8.5 19 6 17 4 14.5 4c-1.33 0-2.52.52-3.4 1.36C10.24 4.64 9.43 4 9.5 4zm0 2c.83 0 1.5.67 1.5 1.5 0 .53-.28 1-.7 1.27.45.25.76.71.7 1.23A1.5 1.5 0 0 1 9.5 11 2.5 2.5 0 0 1 7 8.5 2.5 2.5 0 0 1 9.5 6zm5 0A2.5 2.5 0 0 1 17 8.5 2.5 2.5 0 0 1 14.5 11a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z" />
      </svg>
    ),
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    ),
  },
]

export default function Sidebar({ page, onNavigate }) {
  return (
    <aside
      className="w-[200px] flex-shrink-0 flex flex-col py-7 px-4 border-r"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10 px-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
            boxShadow: '0 0 16px rgba(34,211,238,0.4)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
            <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
            <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-wide leading-none">CryptoDash</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Portfolio Tracker</p>
        </div>
      </div>

      {/* Nav label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Menu
      </p>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group"
              style={{
                background: active ? 'var(--cyan-dim)' : 'transparent',
                color: active ? 'var(--cyan)' : 'rgba(255,255,255,0.4)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }}
                />
              )}
              <span style={{ color: active ? 'var(--cyan)' : 'rgba(255,255,255,0.35)' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
