// src/components/shared/StatCard.jsx
import { cn } from '@/lib/utils'

export default function StatCard({ icon: Icon, label, value, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    blue:    'bg-blue-50 text-blue-600',
    green:   'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    red:     'bg-red-50 text-red-600',
    purple:  'bg-purple-50 text-purple-600',
  }

  return (
    <div className="stat-card">
      <div className={cn('stat-icon', colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-display font-bold text-surface-900 mt-0.5">{value ?? '—'}</p>
        {trend && <p className="text-xs text-surface-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  )
}
