'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { addNotification } = useNotification()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully logged in'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: 'Invalid email or password'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-blue-500 hover:text-blue-400"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-500 hover:text-blue-400">
          Sign up
        </Link>
      </p>
    </div>
  )
} 