import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays, startOfDay, endOfDay, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: appUser } = await supabase.from('users').select('business_id').eq('id', user.id).single()
  const businessId = appUser!.business_id

  const { searchParams } = new URL(req.url)
  const range = parseInt(searchParams.get('range') ?? '30')
  const from  = startOfDay(subDays(new Date(), range)).toISOString()
  const to    = endOfDay(new Date()).toISOString()

  const [leads, appointments, customers, conversations, aiEmployees] = await Promise.all([
    supabase.from('leads').select('status, created_at, converted_at')
      .eq('business_id', businessId).gte('created_at', from).lte('created_at', to),
    supabase.from('appointments').select('status, scheduled_at')
      .eq('business_id', businessId).gte('scheduled_at', from).lte('scheduled_at', to),
    supabase.from('customers').select('id', { count: 'exact' }).eq('business_id', businessId),
    supabase.from('conversations').select('id', { count: 'exact' }).eq('business_id', businessId),
    supabase.from('ai_employees').select('type, kpis').eq('business_id', businessId),
  ])

  const totalLeads          = leads.data?.length ?? 0
  const convertedLeads      = leads.data?.filter(l => l.status === 'converted').length ?? 0
  const totalAppointments   = appointments.data?.length ?? 0
  const attendedAppointments = appointments.data?.filter(a => a.status === 'attended').length ?? 0
  const noShows             = appointments.data?.filter(a => a.status === 'no_show').length ?? 0

  // Build daily series for chart
  const dailySeries = Array.from({ length: range }, (_, i) => {
    const day = format(subDays(new Date(), range - 1 - i), 'yyyy-MM-dd')
    return {
      date: day,
      leads:        leads.data?.filter(l => l.created_at.startsWith(day)).length ?? 0,
      appointments: appointments.data?.filter(a => a.scheduled_at.startsWith(day)).length ?? 0,
    }
  })

  return NextResponse.json({
    data: {
      summary: {
        total_leads:              totalLeads,
        converted_leads:          convertedLeads,
        lead_conversion_rate:     totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0,
        total_appointments:       totalAppointments,
        attended_appointments:    attendedAppointments,
        appointment_show_rate:    totalAppointments ? Math.round((attendedAppointments / totalAppointments) * 100) : 0,
        no_show_rate:             totalAppointments ? Math.round((noShows / totalAppointments) * 100) : 0,
        total_customers:          customers.count ?? 0,
        total_conversations:      conversations.count ?? 0,
      },
      ai_kpis:    aiEmployees.data?.reduce((acc: Record<string, number>, e: any) => {
        Object.entries(e.kpis ?? {}).forEach(([k, v]) => {
          acc[k] = (acc[k] ?? 0) + (v as number)
        })
        return acc
      }, {}),
      daily_series: dailySeries,
    },
  })
}
