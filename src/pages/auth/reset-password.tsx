'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bot, Mail, ArrowLeft } from 'lucide-react'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement password reset logic
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#13111A] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-[#1A1721] p-8 rounded-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Bot className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Reset password</h2>
          <p className="mt-2 text-sm text-gray-400">
            {!submitted 
              ? "Enter your email address and we'll send you a link to reset your password"
              : "Check your email for password reset instructions"
            }
          </p>
        </div>

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#13111A]"
            >
              Send reset link
            </button>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="p-4 bg-blue-500 bg-opacity-10 rounded-lg mb-6">
              <p className="text-blue-500">
                If an account exists for {email}, you will receive password reset instructions.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue-500 hover:text-blue-400"
            >
              Try another email
            </button>
          </div>
        )}

        <div className="mt-4">
          <Link
            href="/auth/signin"
            className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 