// src/components/shared/LoadingScreen.jsx
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-primary-600 animate-pulse" />
        <p className="text-sm text-surface-400 font-medium">Loading…</p>
      </div>
    </div>
  )
}
