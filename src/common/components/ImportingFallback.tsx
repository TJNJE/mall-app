export default function ImportingFallback({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-5 text-gray-400">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-gray-400">加载中：{name}...</p>
    </div>
  )
}
