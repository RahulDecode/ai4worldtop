'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Bot, User, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Conversation } from '@/types'

interface Props { conversations: Conversation[] }

export function ConversationList({ conversations }: Props) {
  return (
    <div className="bg-white rounded-xl border divide-y overflow-hidden">
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <MessageSquare className="w-10 h-10 mb-3" />
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Conversations will appear here when customers message you</p>
        </div>
      )}
      {conversations.map(conv => {
        const customer = (conv as any).customers
        const lastMsg  = (conv as any).messages?.[0]
        return (
          <Link key={conv.id} href={`/conversations/${conv.id}`}
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                {customer?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              {conv.is_ai_active && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                  <Bot className="w-2 h-2 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {customer?.full_name ?? conv.phone}
                </p>
                <span className="text-xs text-gray-400 shrink-0 ml-2">
                  {lastMsg ? formatDistanceToNow(new Date(lastMsg.created_at), { addSuffix: true }) : ''}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {lastMsg?.content ?? 'No messages yet'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-medium',
                conv.is_ai_active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              )}>
                {conv.is_ai_active ? 'AI' : 'Human'}
              </span>
              {conv.is_resolved && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                  Done
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
