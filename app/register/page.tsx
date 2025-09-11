'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const Register = () => {
  const [username, setUsername] = useState('')
  const [emailPrefix, setEmailPrefix] = useState('')
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [step, setStep] = useState<'form' | 'otp'>('form') // form -> otp
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // Full email is constructed from prefix + domain
  const fullEmail = `${emailPrefix}@students.iiests.ac.in`

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const session = await res.json()
        if (session.user) {
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to check session:', error)
      }
    }
    checkAuth()
  }, [router])

  const handleSendOTP = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate username
    if (username.length < 2) {
      setMessage('Name must be at least 2 characters')
      toast.error('Name must be at least 2 characters')
      setLoading(false)
      return
    }

    // Validate email prefix
    if (emailPrefix.length < 1) {
      setMessage('Please enter your username part of the email')
      toast.error('Please enter your username part of the email')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, email: fullEmail }),
      })

      const result = await response.json()

      if (response.ok) {
        setOtpToken(result.otpToken)
        setStep('otp')
        setMessage(result.message || 'OTP sent to your email!')
        toast.success('OTP sent! Please check your email.')
      } else {
        const errorMessage = result.error || 'Failed to send OTP'
        setMessage(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred'
      setMessage(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, email: fullEmail, otp, otpToken }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || 'Registration successful!')
        toast.success('Registration successful! You are now logged in.')
        // Redirect to home page after successful registration
        // Add a small delay to ensure the auth cookie is properly set
        setTimeout(() => {
          router.push('/')
        }, 500)
      } else {
        const errorMessage = result.error || 'OTP verification failed'
        setMessage(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred'
      setMessage(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {step === 'form' ? 'Join Being Resonated' : 'Verify Your Email'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {step === 'form' 
                ? 'Social Media Platform for IIEST Shibpur' 
                : `Enter the 6-digit code sent to ${fullEmail}`}
            </p>
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    id="email"
                    type="text"
                    required
                    value={emailPrefix}
                    onChange={(e) => setEmailPrefix(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ''))}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="username"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm whitespace-nowrap">
                    @students.iiests.ac.in
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Only IIEST Shibpur student emails are allowed
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter 6-digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-lg letter-spacing-wider"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Please check your email inbox for the verification code.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form')
                    setOtp('')
                    setMessage('')
                  }}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </button>
              </div>
            </form>
          )}

          {message && (
            <div className={`mt-4 p-4 rounded-md ${message.includes('successful') || message.includes('sent') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign in here
              </button>
            </p>
          </div>

          {step === 'form' ? (
            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>
                By creating an account, you'll receive a verification code via email.
                No password required - you'll be automatically logged in after verification!
              </p>
            </div>
          ) : (
            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>
                Didn't receive the code? Check your spam folder or go back to try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register;
