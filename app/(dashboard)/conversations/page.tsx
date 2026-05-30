import { createClient } from '@/lib/supabase/server'
import { ConversationList } from '@/components/conversations/conversation-list'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Conversations' }

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: appUser } = await supabase.from('users').select('business_id').eq('id', user!.id).single()

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      customers(full_name, phone),
      messages(content, sender, created_at)
    `)
    .eq('business_id', appUser!.business_id)
    .order('last_message_at', { ascending: false })
    .limit(50)

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <div className="flex gap-2">
          <select className="text-sm border rounded-lg px-3 py-1.5">
            <option>All Channels</option>
            <option>WhatsApp</option>
            <option>SMS</option>
          </select>
          <select className="text-sm border rounded-lg px-3 py-1.5">
            <option>All Status</option>
            <option>Active AI</option>
            <option>Human</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>
      <ConversationList conversations={conversations ?? []} />
    </div>
  )
}
