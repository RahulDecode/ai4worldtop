import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/dashboard/metric-card'
import { RecentLeads } from '@/components/dashboard/recent-leads'
import { AIEmployeeStatus } from '@/components/dashboard/ai-employee-status'
import { ConversionChart } from '@/components/dashboard/conversion-chart'
import { Users, CalendarCheck, DollarSign, Star, Bot } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

async function getDashboardData(businessId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [leadsToday, appointmentsToday, aiEmployees, recentLeads] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact' })
      .eq('business_id', businessId)
      .gte('created_at', today),
    supabase.from('appointments').select('id', { count: 'exact' })
      .eq('business_id', businessId)
      .eq('status', 'scheduled')
      .gte('scheduled_at', today),
    supabase.from('ai_employees').select('*').eq('business_id', businessId),
    supabase.from('leads').select('*, customers(full_name, phone)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    leadsToday: leadsToday.count ?? 0,
    appointmentsToday: appointmentsToday.count ?? 0,
    aiEmployees: aiEmployees.data ?? [],
    recentLeads: recentLeads.data ?? [],
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: appUser } = await supabase.from('users').select('business_id').eq('id', user!.id).single()

  const data = await getDashboardData(appUser!.business_id)
  const activeAI = data.aiEmployees.filter(e => e.is_enabled).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Leads Today"
          value={data.leadsToday}
          icon={Users}
          color="blue"
          change="+12%"
        />
        <MetricCard
          title="Appointments"
          value={data.appointmentsToday}
          icon={CalendarCheck}
          color="green"
          change="+8%"
        />
        <MetricCard
          title="Revenue Recovered"
          value="₹0"
          icon={DollarSign}
          color="purple"
          change="+0%"
        />
        <MetricCard
          title="Reviews Generated"
          value={0}
          icon={Star}
          color="yellow"
          change="+0%"
        />
        <MetricCard
          title="Active AI Employees"
          value={activeAI}
          icon={Bot}
          color="indigo"
          suffix={`/ ${data.aiEmployees.length}`}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ConversionChart businessId={appUser!.business_id} />
          <RecentLeads leads={data.recentLeads} />
        </div>
        <div>
          <AIEmployeeStatus employees={data.aiEmployees} />
        </div>
      </div>
    </div>
  )
}
