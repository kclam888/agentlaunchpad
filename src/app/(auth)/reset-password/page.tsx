'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'

interface ValidationErrors {
  [key: string]: string
}

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { addNotification } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
          return
        }
        throw new Error(data.error || 'Failed to reset password')
      }

      addNotification({
        type: 'success',
        title: 'Password reset successful',
        message: 'You can now log in with your new password'
      })
      router.push('/login')
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to reset password'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-[#1A1721] rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
        <p className="text-gray-400">
          This password reset link is invalid or has expired.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-gray-400 mt-2">Enter your new password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className={`w-full px-3 py-2 bg-[#13111A] border ${
              errors.password ? 'border-red-500' : 'border-gray-800'
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className={`w-full px-3 py-2 bg-[#13111A] border ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-800'
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
} 