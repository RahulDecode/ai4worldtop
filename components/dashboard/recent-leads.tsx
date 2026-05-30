'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { Lead } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const statusColors: Record<string, string> = {
  new:               'bg-blue-100 text-blue-700',
  qualified:         'bg-indigo-100 text-indigo-700',
  appointment_booked:'bg-purple-100 text-purple-700',
  attended:          'bg-cyan-100 text-cyan-700',
  converted:         'bg-green-100 text-green-700',
  no_response:       'bg-gray-100 text-gray-500',
  reactivated:       'bg-yellow-100 text-yellow-700',
  lost:              'bg-red-100 text-red-600',
}

interface Props { leads: Lead[] }

export function RecentLeads({ leads }: Props) {
  return (
    <div className="bg-white rounded-xl border">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-900">Recent Leads</h2>
        <Link href="/leads" className="text-xs text-blue-600 hover:underline">View all</Link>
      </div>
      <div className="divide-y">
        {leads.map(lead => (
          <Link key={lead.id} href={`/leads?id=${lead.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
              {lead.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{lead.full_name}</p>
              <p className="text-xs text-gray-400">{lead.phone} · {lead.source}</p>
            </div>
            <div className="text-right">
              <span className={cn('text-xs px-2 py-1 rounded-full font-medium', statusColors[lead.status] ?? '')}>
                {lead.status.replace('_', ' ')}
              </span>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
        {leads.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No leads yet today</p>
        )}
      </div>
    </div>
  )
}
