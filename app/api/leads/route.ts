import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateLeadSchema = z.object({
  full_name:   z.string().min(1),
  phone:       z.string().min(7),
  email:       z.string().email().optional(),
  source:      z.string().optional(),
  interest:    z.string().optional(),
  notes:       z.string().optional(),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: appUser } = await supabase.from('users').select('business_id').eq('id', user.id).single()
  const { searchParams } = new URL(req.url)

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('business_id', appUser!.business_id)

  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page   = parseInt(searchParams.get('page') ?? '1')
  const limit  = parseInt(searchParams.get('limit') ?? '50')

  if (status) query = query.eq('status', status)
  if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, meta: { total: count, page, per_page: limit } })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: appUser } = await supabase.from('users').select('business_id, role').eq('id', user.id).single()
  if (appUser?.role === 'read_only') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateLeadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...parsed.data, business_id: appUser!.business_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Track event
  await supabase.from('analytics_events').insert({
    business_id: appUser!.business_id,
    event_type:  'lead_created',
    entity_type: 'lead',
    entity_id:   data.id,
    properties:  { source: parsed.data.source },
  })

  return NextResponse.json({ data }, { status: 201 })
}
