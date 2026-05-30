import { createClient } from '@/lib/supabase/server'
import { LeadsKanban } from '@/components/leads/leads-kanban'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leads' }

const STAGES: Array<{ status: string; label: string; color: string }> = [
  { status: 'new',               label: 'New',              color: 'border-t-blue-500' },
  { status: 'qualified',         label: 'Qualified',        color: 'border-t-indigo-500' },
  { status: 'appointment_booked',label: 'Appt Booked',      color: 'border-t-purple-500' },
  { status: 'attended',          label: 'Attended',         color: 'border-t-cyan-500' },
  { status: 'converted',         label: 'Converted',        color: 'border-t-green-500' },
  { status: 'no_response',       label: 'No Response',      color: 'border-t-gray-400' },
]

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: appUser } = await supabase.from('users').select('business_id').eq('id', user!.id).single()

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', appUser!.business_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {leads?.length ?? 0} total leads
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Add Lead
        </button>
      </div>
      <LeadsKanban leads={leads ?? []} stages={STAGES} />
    </div>
  )
}
