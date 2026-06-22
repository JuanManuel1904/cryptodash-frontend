export default function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-2.5 w-10 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
      <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="flex gap-4">
        <div className="h-2.5 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-2.5 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-2.5 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
  )
}
