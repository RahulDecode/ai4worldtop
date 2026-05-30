import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { processAIResponse } from '@/lib/ai/front-desk'
import type { WAWebhookPayload, WAMessage } from '@/types'

// GET — Meta webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST — Incoming messages
export async function POST(req: NextRequest) {
  const body: WAWebhookPayload = await req.json()
  const supabase = await createServiceClient()

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue

      const value    = change.value
      const phoneId  = value.metadata.phone_number_id
      const messages = value.messages ?? []
      const contacts = value.contacts ?? []

      // Find business by Meta phone_number_id
      const { data: business } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('meta_phone_id', phoneId)
        .single()

      if (!business) continue

      for (const msg of messages) {
        const contact = contacts.find(c => c.wa_id === msg.from)
        await handleIncomingMessage(supabase, business.id, msg, contact?.profile.name)
      }

      // Handle delivery status updates
      for (const status of value.statuses ?? []) {
        await supabase
          .from('messages')
          .update({ is_read: status.status === 'read' })
          .eq('wa_message_id', status.id)
      }
    }
  }

  return NextResponse.json({ status: 'ok' })
}

async function handleIncomingMessage(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  businessId: string,
  msg: WAMessage,
  contactName?: string
) {
  const phone   = msg.from
  const content = msg.text?.body ?? '[media]'

  // Upsert customer / lead
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .maybeSingle()

  let customerId = existing?.id
  if (!customerId && contactName) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({ business_id: businessId, full_name: contactName, phone, source: 'whatsapp' })
      .select('id')
      .single()
    customerId = newCustomer?.id
  }

  // Get or create conversation
  let { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!conv) {
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({
        business_id: businessId,
        customer_id: customerId,
        phone,
        channel: 'whatsapp',
        ai_employee_type: 'front_desk',
        is_ai_active: true,
      })
      .select()
      .single()
    conv = newConv
  }

  if (!conv) return

  // Store message
  await supabase.from('messages').insert({
    conversation_id: conv.id,
    business_id:     businessId,
    sender:          'customer',
    content,
    wa_message_id:   msg.id,
  })

  // Update last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conv.id)

  // Track analytics
  await supabase.from('analytics_events').insert({
    business_id: businessId,
    event_type:  'message_received',
    entity_type: 'conversation',
    entity_id:   conv.id,
    properties:  { phone, channel: 'whatsapp' },
  })

  // Fire AI response if AI is active
  if (conv.is_ai_active) {
    await processAIResponse({
      supabase,
      businessId,
      conversationId: conv.id,
      customerMessage: content,
      phone,
      customerId,
    })
  }
}
