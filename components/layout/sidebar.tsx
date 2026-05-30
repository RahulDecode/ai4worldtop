'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Users, UserPlus, CalendarDays, MessageSquare,
  Megaphone, Bot, BarChart3, CreditCard, Settings, ChevronLeft,
  ChevronRight, Zap,
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/customers',      label: 'Customers',      icon: Users },
  { href: '/leads',          label: 'Leads',          icon: UserPlus },
  { href: '/appointments',   label: 'Appointments',   icon: CalendarDays },
  { href: '/conversations',  label: 'Conversations',  icon: MessageSquare },
  { href: '/campaigns',      label: 'Campaigns',      icon: Megaphone },
  { href: '/ai-employees',   label: 'AI Employees',   icon: Bot },
  { href: '/analytics',      label: 'Analytics',      icon: BarChart3 },
  { href: '/billing',        label: 'Billing',        icon: CreditCard },
  { href: '/settings',       label: 'Settings',       icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-gray-900 text-white transition-all duration-200 shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">AI4World</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}
