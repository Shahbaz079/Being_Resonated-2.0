'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const Login = () => {
  const [emailPrefix, setEmailPrefix] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [loginType, setLoginType] = useState<'password' | 'otp'>('otp')
  const [otpSent, setOtpSent] = useState(false)
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

  const handleSendOTP = async () => {
    if (!emailPrefix) {
      toast.error('Please enter your username part of the email')
      return
    }
    
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: fullEmail, type: 'otp-request' }),
      })

      const result = await response.json()

      if (response.ok) {
        setOtpToken(result.otpToken)
        setOtpSent(true)
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

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: fullEmail, otp, otpToken, type: 'otp-verify' }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Login successful!')
        // Add a small delay to ensure the auth cookie is properly set
        setTimeout(() => {
          router.push('/')
        }, 500)
      } else {
        const errorMessage = result.error || 'Invalid OTP'
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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (loginType === 'otp') {
        if (!otpSent) {
          await handleSendOTP()
          return
        } else {
          await handleVerifyOTP()
          return
        }
      }
      
      // Handle password login
      if (!emailPrefix) {
        toast.error('Please enter your username part of the email')
        setLoading(false)
        return
      }
      
      if (!password) {
        toast.error('Please enter your password')
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: fullEmail, password, type: 'password' }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Login successful!')
        // Add a small delay to ensure the auth cookie is properly set
        setTimeout(() => {
          router.push('/')
        }, 500)
      } else {
        const errorMessage = result.error || 'Login failed'
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
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to Being Resonated
            </p>
          </div>

          <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setLoginType('password')
                setOtpSent(false)
                setOtp('')
                setMessage('')
              }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                loginType === 'password'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('otp')
                setOtpSent(false)
                setOtp('')
                setMessage('')
              }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                loginType === 'otp'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              OTP
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            {loginType === 'password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required={loginType === 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your password"
                />
              </div>
            )}

            {loginType === 'otp' && otpSent && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-lg letter-spacing-wider"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  OTP sent to {fullEmail}. Check your email inbox.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                loginType === 'password' ? 'Signing In...' :
                loginType === 'otp' && !otpSent ? 'Sending OTP...' :
                'Verifying OTP...'
              ) : (
                loginType === 'password' ? 'Sign In' :
                loginType === 'otp' && !otpSent ? 'Send OTP' :
                'Verify OTP'
              )}
            </button>

            {loginType === 'otp' && otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false)
                  setOtp('')
                  setMessage('')
                }}
                className="w-full mt-2 flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Use Different Email
              </button>
            )}
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-md ${
              message.includes('sent') || message.includes('successful')
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign up here
              </button>
            </p>
          </div>

          {loginType === 'otp' && !otpSent && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>
                We'll send a 6-digit code to your email address.
                Enter the code to log in securely.
              </p>
            </div>
          )}

          {loginType === 'password' && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>
                Don't have a password? You can use OTP to sign in,
                then set a password in your profile settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


export default Login;
