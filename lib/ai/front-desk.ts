import OpenAI from 'openai'

interface AIResponseParams {
  supabase: any
  businessId: string
  conversationId: string
  customerMessage: string
  phone: string
  customerId?: string
}

export async function processAIResponse(params: AIResponseParams) {
  const { supabase, businessId, conversationId, customerMessage, phone, customerId } = params

  // Get AI Employee config
  const { data: aiEmployee } = await supabase
    .from('ai_employees')
    .select('*')
    .eq('business_id', businessId)
    .eq('type', 'front_desk')
    .eq('is_enabled', true)
    .single()

  if (!aiEmployee) return

  // Get business info
  const { data: business } = await supabase
    .from('businesses')
    .select('name, vertical, settings')
    .eq('id', businessId)
    .single()

  // Get last 10 messages for context
  const { data: history } = await supabase
    .from('messages')
    .select('sender, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10)

  const messages = (history ?? []).reverse().map((m: { sender: string; content: string }) => ({
    role: m.sender === 'customer' ? 'user' : 'assistant',
    content: m.content,
  }))

  // Check escalation triggers
  const escalationKeywords: string[] = aiEmployee.config?.escalation_keywords ?? []
  const shouldEscalate = escalationKeywords.some((kw: string) =>
    customerMessage.toLowerCase().includes(kw.toLowerCase())
  )
  if (shouldEscalate) {
    await handleEscalation(supabase, businessId, conversationId)
    return
  }

  // Check max AI turns
  const aiTurns = (history ?? []).filter((m: { sender: string }) => m.sender === 'ai').length
  if (aiTurns >= (aiEmployee.config?.max_ai_turns ?? 10)) {
    await handleEscalation(supabase, businessId, conversationId)
    return
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const systemPrompt = `${aiEmployee.system_prompt}

Business: ${business?.name ?? 'Our Business'}
Vertical: ${business?.vertical?.replace('_', ' ') ?? 'service'}

Available actions you can take:
1. Answer FAQs about the business
2. Capture customer name, phone, and service interest
3. Book appointments (respond with: [BOOK_APPOINTMENT: service=X, date=Y, time=Z])
4. Escalate to human (respond with: [ESCALATE: reason=X])

Keep responses short (under 100 words) and conversational. Use WhatsApp-friendly formatting.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
        { role: 'user', content: customerMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const aiReply = completion.choices[0]?.message?.content ?? ''
    if (!aiReply) return

    // Parse action commands
    if (aiReply.includes('[ESCALATE:')) {
      await handleEscalation(supabase, businessId, conversationId)
      return
    }

    if (aiReply.includes('[BOOK_APPOINTMENT:')) {
      await handleAppointmentBooking(supabase, businessId, conversationId, customerId, aiReply)
    }

    // Store AI message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      business_id:     businessId,
      sender:          'ai',
      content:         aiReply.replace(/\[.*?\]/g, '').trim(),
      ai_intent:       detectIntent(customerMessage),
      ai_confidence:   0.85,
    })

    // Send via WhatsApp API
    await sendWhatsAppMessage(supabase, businessId, phone, aiReply.replace(/\[.*?\]/g, '').trim())

    // Update AI employee KPIs
    await supabase.rpc('increment_ai_kpi', {
      p_business_id: businessId,
      p_type: 'front_desk',
      p_field: 'conversations_handled',
    })
  } catch (err) {
    console.error('AI response error:', err)
  }
}

async function handleEscalation(supabase: any, businessId: string, conversationId: string) {
  await supabase
    .from('conversations')
    .update({ is_ai_active: false })
    .eq('id', conversationId)

  await supabase.from('messages').insert({
    conversation_id: conversationId,
    business_id: businessId,
    sender: 'system',
    content: 'Conversation transferred to human agent.',
  })
}

async function handleAppointmentBooking(
  supabase: any,
  businessId: string,
  conversationId: string,
  customerId: string | undefined,
  aiReply: string
) {
  const match = aiReply.match(/\[BOOK_APPOINTMENT: service=(.*?), date=(.*?), time=(.*?)\]/)
  if (!match) return

  const [, service, date, time] = match
  await supabase.from('appointments').insert({
    business_id: businessId,
    customer_id: customerId,
    title: `${service} Appointment`,
    service,
    scheduled_at: new Date(`${date} ${time}`).toISOString(),
    status: 'scheduled',
  })
}

async function sendWhatsAppMessage(supabase: any, businessId: string, to: string, message: string) {
  const { data: business } = await supabase
    .from('businesses')
    .select('whatsapp_token, meta_phone_id')
    .eq('id', businessId)
    .single()

  if (!business?.whatsapp_token || !business?.meta_phone_id) return

  try {
    await fetch(
      `https://graph.facebook.com/v19.0/${business.meta_phone_id}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${business.whatsapp_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        }),
      }
    )
  } catch (err) {
    console.error('WhatsApp send error:', err)
  }
}

function detectIntent(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('book') || m.includes('appointment') || m.includes('schedule')) return 'booking'
  if (m.includes('price') || m.includes('cost') || m.includes('fee')) return 'pricing'
  if (m.includes('cancel') || m.includes('reschedule')) return 'cancellation'
  if (m.includes('hello') || m.includes('hi') || m.includes('hey')) return 'greeting'
  if (m.includes('hour') || m.includes('open') || m.includes('timing')) return 'hours'
  return 'general'
}
