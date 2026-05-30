import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateSchema = z.object({
  customer_id:   z.string().uuid().optional(),
  lead_id:       z.string().uuid().optional(),
  title:         z.string().min(1),
  service:       z.string().optional(),
  scheduled_at:  z.string().datetime(),
  duration_mins: z.number().min(5).max(480).default(30),
  staff_id:      z.string().uuid().optional(),
  notes:         z.string().optional(),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: appUser } = await supabase.from('users').select('business_id').eq('id', user.id).single()
  const { searchParams } = new URL(req.url)

  const from = searchParams.get('from')
  const to   = searchParams.get('to')
  const view = searchParams.get('view') ?? 'month'

  let query = supabase
    .from('appointments')
    .select('*, customers(full_name, phone), users!staff_id(full_name)')
    .eq('business_id', appUser!.business_id)
    .order('scheduled_at')

  if (from) query = query.gte('scheduled_at', from)
  if (to)   query = query.lte('scheduled_at', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: appUser } = await supabase.from('users').select('business_id, role').eq('id', user.id).single()
  if (appUser?.role === 'read_only') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...parsed.data, business_id: appUser!.business_id, status: 'scheduled' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Track and update lead status if linked
  if (parsed.data.lead_id) {
    await supabase.from('leads').update({ status: 'appointment_booked' }).eq('id', parsed.data.lead_id)
  }

  await supabase.from('analytics_events').insert({
    business_id: appUser!.business_id,
    event_type:  'appointment_booked',
    entity_type: 'appointment',
    entity_id:   data.id,
  })

  return NextResponse.json({ data }, { status: 201 })
}
