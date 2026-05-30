'use client'

import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { TrendingUp, Users, CalendarCheck, Bot, Star } from 'lucide-react'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

interface Props { businessId: string }

export function AnalyticsDashboard({ businessId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', businessId],
    queryFn: async () => {
      const res = await fetch('/api/analytics?range=30')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => (
      <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
    ))}</div>
  }

  const s = data?.data?.summary ?? {}
  const daily = data?.data?.daily_series ?? []
  const aiKpis = data?.data?.ai_kpis ?? {}

  const conversionData = [
    { name: 'Leads → Converted', value: s.lead_conversion_rate ?? 0 },
    { name: 'Appt Show Rate', value: s.appointment_show_rate ?? 0 },
    { name: 'No Show Rate', value: s.no_show_rate ?? 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: s.total_leads ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Appointments', value: s.total_appointments ?? 0, icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Conversion Rate', value: `${s.lead_conversion_rate ?? 0}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Customers', value: s.total_customers ?? 0, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Leads & Appointments (30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily.filter((_:unknown, i: number) => i % 3 === 0)} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads"        fill="#3b82f6" name="Leads" radius={[4,4,0,0]} />
              <Bar dataKey="appointments" fill="#8b5cf6" name="Appointments" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Conversion Rates</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={conversionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" nameKey="name" label={({ name, value }: { name: string; value: number }) => `${value}%`}>
                {conversionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI KPIs */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">AI Employee Performance (All Time)</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ['conversations_handled', 'Conversations'],
            ['appointments_booked', 'Bookings'],
            ['leads_recovered', 'Recovered'],
            ['revenue_recovered', 'Revenue'],
            ['reviews_generated', 'Reviews'],
            ['referrals_generated', 'Referrals'],
          ].map(([key, label]) => (
            <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-900">
                {key === 'revenue_recovered' ? `₹${aiKpis[key] ?? 0}` : aiKpis[key] ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
