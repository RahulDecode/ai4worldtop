'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Bot, Settings, TrendingUp, MessageSquare, CalendarCheck, DollarSign, Star } from 'lucide-react'
import type { AIEmployee } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const typeConfig: Record<string, { color: string; description: string }> = {
  front_desk:       { color: 'from-blue-500 to-blue-600',   description: 'Handles incoming WhatsApp messages, FAQs, lead capture, and appointment booking.' },
  lead_recovery:    { color: 'from-orange-500 to-orange-600', description: 'Re-engages inactive leads with automated follow-ups and objection handling.' },
  customer_success: { color: 'from-green-500 to-green-600',  description: 'Sends birthday/anniversary wishes, review requests, and retention campaigns.' },
  crm_manager:      { color: 'from-purple-500 to-purple-600', description: 'Auto-updates CRM, scores leads, segments customers, and tracks all activity.' },
}

interface Props { employee: AIEmployee }

export function AIEmployeeCard({ employee }: Props) {
  const [enabled, setEnabled] = useState(employee.is_enabled)
  const [loading, setLoading] = useState(false)
  const config = typeConfig[employee.type]

  async function toggleEnabled() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('ai_employees')
      .update({ is_enabled: !enabled })
      .eq('id', employee.id)
    if (error) {
      toast.error('Failed to update AI Employee')
    } else {
      setEnabled(!enabled)
      toast.success(`${employee.name} ${!enabled ? 'activated' : 'deactivated'}`)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className={cn('bg-gradient-to-r p-4 text-white', config?.color ?? 'from-gray-500 to-gray-600')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{employee.name}</h3>
              <p className="text-xs text-white/70 capitalize">{employee.type.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={toggleEnabled}
            disabled={loading}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
              enabled ? 'bg-white/30' : 'bg-black/20',
              loading && 'opacity-50'
            )}
          >
            <span className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              enabled ? 'translate-x-6' : 'translate-x-1'
            )} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500">{config?.description}</p>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <MessageSquare className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{employee.kpis.conversations_handled}</p>
            <p className="text-xs text-gray-400">Convs</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <CalendarCheck className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{employee.kpis.appointments_booked}</p>
            <p className="text-xs text-gray-400">Booked</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">₹{employee.kpis.revenue_recovered}</p>
            <p className="text-xs text-gray-400">Recovered</p>
          </div>
        </div>

        <Link href={`/ai-employees/${employee.id}`}
          className="flex items-center justify-center gap-2 w-full py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings className="w-4 h-4" />
          Configure
        </Link>
      </div>
    </div>
  )
}
