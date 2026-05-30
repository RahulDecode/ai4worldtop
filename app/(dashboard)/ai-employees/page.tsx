import { createClient } from '@/lib/supabase/server'
import { AIEmployeeCard } from '@/components/ai-employees/ai-employee-card'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'AI Employees' }

export default async function AIEmployeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: appUser } = await supabase.from('users').select('business_id').eq('id', user!.id).single()

  const { data: employees } = await supabase
    .from('ai_employees')
    .select('*')
    .eq('business_id', appUser!.business_id)
    .order('created_at')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Employees</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enable, configure, and monitor your AI workforce.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(employees ?? []).map(emp => (
          <AIEmployeeCard key={emp.id} employee={emp} />
        ))}
      </div>
    </div>
  )
}
