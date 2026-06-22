export default function SkeletonCard() {
  return (
    <div
      className="p-4 rounded-2xl animate-pulse"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="space-y-1.5">
          <div className="h-3 w-20 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-2.5 w-10 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
      <div className="h-5 w-28 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="flex gap-2">
        <div className="h-4 w-16 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  )
}
