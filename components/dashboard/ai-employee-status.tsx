'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { AIEmployee } from '@/types'

const typeLabels: Record<string, { label: string; color: string }> = {
  front_desk:       { label: 'Front Desk',      color: 'bg-blue-100 text-blue-700' },
  lead_recovery:    { label: 'Lead Recovery',   color: 'bg-orange-100 text-orange-700' },
  customer_success: { label: 'Customer Success',color: 'bg-green-100 text-green-700' },
  crm_manager:      { label: 'CRM Manager',     color: 'bg-purple-100 text-purple-700' },
}

interface Props { employees: AIEmployee[] }

export function AIEmployeeStatus({ employees }: Props) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">AI Employees</h2>
        <Link href="/ai-employees" className="text-xs text-blue-600 hover:underline">Manage</Link>
      </div>
      <div className="space-y-3">
        {employees.map(emp => {
          const meta = typeLabels[emp.type]
          return (
            <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className={cn(
                'w-2 h-2 rounded-full shrink-0',
                emp.is_enabled ? 'bg-green-500' : 'bg-gray-300'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', meta?.color ?? '')}>
                  {meta?.label ?? emp.type}
                </span>
              </div>
              <span className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                emp.is_enabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              )}>
                {emp.is_enabled ? 'Active' : 'Off'}
              </span>
            </div>
          )
        })}
        {employees.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No AI employees configured</p>
        )}
      </div>
    </div>
  )
}
