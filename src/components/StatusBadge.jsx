import useCryptoStore from '../store/useCryptoStore'

const CONFIG = {
  connected:    { label: 'Live',         dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950',  animate: 'animate-pulse' },
  connecting:   { label: 'Conectando…',  dot: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950', animate: '' },
  reconnecting: { label: 'Reconectando…',dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950', animate: 'animate-pulse' },
  disconnected: { label: 'Desconectado', dot: 'bg-red-500',    text: 'text-red-700 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-950',      animate: '' },
}

export default function StatusBadge() {
  const wsStatus = useCryptoStore((s) => s.wsStatus)
  const { label, dot, text, bg, animate } = CONFIG[wsStatus] || CONFIG.disconnected

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${animate}`} />
      {label}
    </span>
  )
}
