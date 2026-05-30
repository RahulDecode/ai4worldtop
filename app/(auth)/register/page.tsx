'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Zap } from 'lucide-react'
import Link from 'next/link'

const VERTICALS = [
  ['dental_clinic','Dental Clinic'],['medical_clinic','Medical Clinic'],
  ['dermatology_clinic','Dermatology Clinic'],['weight_loss_clinic','Weight Loss Clinic'],
  ['diagnostic_lab','Diagnostic Lab'],['salon','Salon'],['barber_shop','Barber Shop'],
  ['gym','Gym'],['restaurant','Restaurant'],['real_estate_agency','Real Estate Agency'],
]

export default function RegisterPage() {
  const router  = useRouter()
  const [step, setStep]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [vertical, setVertical]     = useState('')
  const [phone, setPhone]           = useState('')
  const [fullName, setFullName]     = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError || !authData.user) {
      toast.error(authError?.message ?? 'Registration failed')
      setLoading(false)
      return
    }

    // 2. Create business
    const { data: biz, error: bizError } = await supabase
      .from('businesses')
      .insert({ name: businessName, vertical, phone })
      .select('id')
      .single()

    if (bizError || !biz) {
      toast.error('Failed to create business')
      setLoading(false)
      return
    }

    // 3. Create user profile
    await supabase.from('users').insert({
      id: authData.user.id,
      business_id: biz.id,
      full_name: fullName,
      email,
      role: 'business_owner',
    })

    toast.success('Account created! Setting up your AI workforce...')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI4World</h1>
          <p className="text-sm text-gray-500 mt-1">Register your business</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {[1,2].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleRegister}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900">Business Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Smile Dental Clinic" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <select value={vertical} onChange={e => setVertical(e.target.value)} required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select type...</option>
                    {VERTICALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210" />
                </div>
                <button type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900">Your Account</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min 8 characters" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
