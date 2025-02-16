'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'

interface ValidationErrors {
  [key: string]: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { addNotification } = useNotification()
  const [errors, setErrors] = useState<ValidationErrors>({})

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
          return
        }
        throw new Error(data.error || 'Registration failed')
      }

      addNotification({
        type: 'success',
        title: 'Registration successful',
        message: 'Please sign in with your new account'
      })
      router.push('/login')
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration failed',
        message: error instanceof Error ? error.message : 'Please try again later'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        <p className="text-gray-400 mt-2">Get started with your free account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 bg-[#13111A] border ${
              errors.name ? 'border-red-500' : 'border-gray-800'
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-3 py-2 bg-[#13111A] border ${
              errors.email ? 'border-red-500' : 'border-gray-800'
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
            Password
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
            Confirm Password
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-500 hover:text-blue-400">
          Sign in
        </Link>
      </p>
    </div>
  )
} 