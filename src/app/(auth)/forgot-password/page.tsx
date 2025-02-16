'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useNotification } from '@/contexts/NotificationContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { addNotification } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Failed to send reset email')
      }

      setSent(true)
      addNotification({
        type: 'success',
        title: 'Email sent',
        message: 'Check your email for password reset instructions'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send reset email'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-gray-400 mt-2">
          Enter your email to receive reset instructions
        </p>
      </div>

      {sent ? (
        <div className="text-center">
          <p className="text-gray-400 mb-6">
            If an account exists with that email, you will receive password reset instructions.
          </p>
          <Link href="/login" className="text-blue-500 hover:text-blue-400">
            Return to login
          </Link>
        </div>
      ) : (
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

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-400">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
} 