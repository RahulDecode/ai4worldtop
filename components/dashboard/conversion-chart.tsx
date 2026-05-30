'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const MOCK = [
  { day: 'Mon', leads: 12, appointments: 5, converted: 3 },
  { day: 'Tue', leads: 18, appointments: 8, converted: 5 },
  { day: 'Wed', leads: 9,  appointments: 4, converted: 2 },
  { day: 'Thu', leads: 22, appointments: 11, converted: 7 },
  { day: 'Fri', leads: 15, appointments: 7, converted: 4 },
  { day: 'Sat', leads: 28, appointments: 14, converted: 9 },
  { day: 'Sun', leads: 8,  appointments: 3, converted: 2 },
]

export function ConversionChart({ businessId }: { businessId: string }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <h2 className="font-semibold text-gray-900 mb-4">Lead → Appointment → Conversion (This Week)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={MOCK} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gAppts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="leads"        stroke="#3b82f6" fill="url(#gLeads)" strokeWidth={2} name="Leads" />
          <Area type="monotone" dataKey="appointments" stroke="#8b5cf6" fill="url(#gAppts)" strokeWidth={2} name="Appointments" />
          <Area type="monotone" dataKey="converted"    stroke="#10b981" fill="url(#gConv)"  strokeWidth={2} name="Converted" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
