'use client'

import { cn } from '@/lib/utils/cn'
import type { Lead } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Phone, MessageSquare } from 'lucide-react'

interface Stage { status: string; label: string; color: string }
interface Props { leads: Lead[]; stages: Stage[] }

export function LeadsKanban({ leads, stages }: Props) {
  const byStatus = stages.reduce<Record<string, Lead[]>>((acc, s) => {
    acc[s.status] = leads.filter(l => l.status === s.status)
    return acc
  }, {})

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
      {stages.map(stage => (
        <div key={stage.status} className={cn(
          'flex-shrink-0 w-64 bg-gray-50 rounded-xl border-t-4 flex flex-col',
          stage.color
        )}>
          <div className="px-3 py-2 border-b bg-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">{stage.label}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {byStatus[stage.status]?.length ?? 0}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {(byStatus[stage.status] ?? []).map(lead => (
              <div key={lead.id} className="bg-white rounded-lg border p-3 cursor-pointer hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-1 mb-2">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{lead.full_name}</p>
                  <span className="text-xs text-gray-400 shrink-0 font-bold">{lead.score}pts</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{lead.phone}</p>
                {lead.interest && (
                  <p className="text-xs text-gray-400 truncate mb-2">{lead.interest}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                    {lead.source}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <Phone className="w-3 h-3 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <MessageSquare className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
