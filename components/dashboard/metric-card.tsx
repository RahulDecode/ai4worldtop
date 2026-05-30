import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600' },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600' },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600' },
}

interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: keyof typeof colorMap
  change?: string
  suffix?: string
}

export function MetricCard({ title, value, icon: Icon, color, change, suffix }: MetricCardProps) {
  const c = colorMap[color]
  const isPositive = change?.startsWith('+')
  return (
    <div className={cn('rounded-xl p-4 border border-transparent', c.bg)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        <div className={cn('p-2 rounded-lg', c.icon)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {suffix && <span className="text-sm text-gray-400 mb-0.5">{suffix}</span>}
      </div>
      {change && (
        <p className={cn('text-xs mt-1 font-medium', isPositive ? 'text-green-600' : 'text-red-500')}>
          {change} from yesterday
        </p>
      )}
    </div>
  )
}
